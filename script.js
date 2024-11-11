let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 
let context;


let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize; 


let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1; 


let bulletArray = [];
let bulletVelocityY = -10; 

let score = 0;
let gameOver = false;

let lives = 3;

let AudioBackground = new Audio('./sound/Mercury.ogg');
let AudioGameOver = new Audio("./sound/GameOver.mp3");
let AudioHit = new Audio("./sound/hit.ogg");

window.onload = function() {
    document.addEventListener("keydown", startGame, { once: true });
}

function startGame() {
    AudioBackground.loop = true;
    AudioBackground.play();
    const startMessage = document.getElementById("startMessage");
    if (startMessage) {
        startMessage.remove();
    }
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); 

    shipImg = new Image();
    shipImg.src = "./graphics/ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./graphics/alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
    document.addEventListener("keyup", function(e) {
        if (e.code == "KeyR") {
            resetGame();
        }
    });
}

function resetGame() {
    AudioBackground.currentTime = 0;
    gameOver = false;
    ship.x = shipX;
    ship.y = shipY;
    bulletArray = [];
    lives = 3;
    score = 0;
    alienColumns = 3;
    alienRows = 2;
    alienCount = 6;
    alienVelocityX = 1;
    alien = [];
    alienArray = [];
    createAliens();
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        if(e.code == "KeyR"){
            resetGame();
        }
    }

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) { 
                if (lives == 0){
                    gameOver = true;
                    AudioBackground.pause(); 
                    AudioGameOver.play();
                }

                else {
                    lives -= 1;

                    if (lives == 2 || lives == 1) {
                        if (alienVelocityX > 0) {
                            alienVelocityX -= 0.4;
                        }
                        else {
                            alienVelocityX += 0.2; 
                        }
                        alienArray = [];
                        bulletArray = [];
                        createAliens();
                    }
                }
            }
        }
    }


    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);


        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
                AudioHit.play();
            }
        }
    }

 
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }


    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns/2 -2);
        alienRows = Math.min(alienRows + 1, rows-4);  
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2;
        }
        else {
            alienVelocityX -= 0.2; 
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("PUNKTY: " + score, 5, 20);

    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("ŻYCIA: " + lives, 420, 20);
}

function moveShip(e) {
    if (gameOver) {
        if(e.code == "KeyR"){
            resetGame();
        }
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; 
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        if(e.code == "KeyR"){
            resetGame();
        }
    }

    if (e.code == "Space") {
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        };
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && 
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;   
}