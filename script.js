let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 
let context;

let speed = 50;
let position = 0;

let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;
let shipDirection = 0;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize * 0.1; 


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

let ChargedBulletArray = [];
let ChargedBulletVelocityY = 0; 

let score = 0;
let gameOver = false;

let lives = 3;

let AudioBackground = new Audio('./sound/Mercury.ogg');
let AudioGameOver = new Audio("./sound/GameOver.mp3");
let AudioHit = new Audio("./sound/hit.ogg");
let AudioLaser = new Audio("./sound/LaserShot.mp3")
let LaserReady = new Audio("./sound/LaserReady.mp3")

let lastShotTime = 0;
const shootCooldown = 20;

let lastChargedShot = 0;
const ChargedShotCooldwon = 5000;

let SpacePressed = true;

window.onload = function() {
    document.addEventListener("keydown", startGame, { once: true });
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = '100%';
    progressBar.removeAttribute('id');
}

function startGame() {
    setInterval(updateGame, 1000 / 60);
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
    document.addEventListener("keyup", stopShip);
    document.addEventListener("keyup", shoot);
    document.addEventListener("keyup", function(e) {
        if (e.code == "KeyR") {
            resetGame();
        }
    });
    document.addEventListener("keydown", ChargedShot)
    
}

function updateGame() {
    let distance = speed / 60;
    position += distance;
    requestAnimationFrame(updateGame);
}

function resetGame() {
    playLaserBarAnimation();
    AudioBackground.currentTime = 0;
    gameOver = false;
    ship.x = shipX;
    ship.y = shipY;
    bulletArray = [];
    ChargedBulletArray = [];
    lives = 3;
    score = 0;
    alienColumns = 3;
    alienRows = 2;
    alienCount = 6;
    alienVelocityX = 1;
    alien = [];
    alienArray = [];
    lastChargedShot = 0;
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

    if (shipDirection !== 0) {
        let newShipX = ship.x + shipVelocityX * shipDirection;
        if (newShipX >= 0 && newShipX + ship.width <= board.width) {
            ship.x = newShipX;
        }
    }

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
                        ChargedBulletArray = [];
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

    for (let x = 0; x < ChargedBulletArray.length; x++) {
        let ChargedBullets = ChargedBulletArray[x];
        ChargedBullets.y += ChargedBulletVelocityY;
        context.fillStyle="red";
        context.fillRect(ChargedBullets.x, ChargedBullets.y, ChargedBullets.width, ChargedBullets.height);


        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!ChargedBullets.used && alien.alive && detectCollision(ChargedBullets, alien)) {
                alien.alive = false;
                alienCount--;
                score += 100;
                AudioLaser.play();
            }
        }
    }

 
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }

    while (ChargedBulletArray.length > 0 && (ChargedBulletArray[0].used || ChargedBulletArray[0].y < 0)) {
        ChargedBulletArray.shift(); 
    }

    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns/2 -2);
        alienRows = Math.min(alienRows + 1, rows-4);  
        if (alienVelocityX > 0) {
            alienVelocityX += 0.1;
        }
        else {
            alienVelocityX -= 0.1; 
        }
        alienArray = [];
        bulletArray = [];
        ChargedBulletArray = [];
        createAliens();
    }

    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("PUNKTY: " + score, 5, 20);

    context.fillStyle="white";
    context.font="16px courier";
    context.fillText("ŻYCIA: " + lives, 420, 20);
}

function stopShip(e) {
    if (gameOver == false) {
        if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
            shipDirection = 0;
        }
    }
}

function moveShip(e) {
    if(gameOver == false){
        if (gameOver) {
            if(e.code == "KeyR"){
                resetGame();
            }
        }

        if (e.code == "ArrowLeft") {
            shipDirection = -1;
        }
        else if (e.code == "ArrowRight") {
            shipDirection = 1;
        }
    }
}

function createAliens() {
    if(gameOver == false){
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
}

function shoot(e) {
    if(gameOver == false){
        const currentTime = Date.now();
        if (gameOver) {
            if(e.code == "KeyR"){
                resetGame();
            }
        }

        if (e.code == "Space") {
            if(currentTime - lastShotTime >= shootCooldown){
                let bullet = {
                    x: ship.x + ship.width * 15 / 32,
                    y: ship.y,
                    width: tileSize / 8,
                    height: tileSize / 2,
                    used: false
                };
                bulletArray.push(bullet);
                lastShotTime = currentTime;
                if(lives =3){
                shipImg.src = "./graphics/ship.png";
                }
                if(lives =3){
                    shipImg.src = "./graphics/ship.png";
                }
                if(lives =3){
                    shipImg.src = "./graphics/ship.png";
                }
        }
        }
    }
}

function playLaserBarAnimation() {
    const progressBar = document.querySelector('.progress-bar');

    progressBar.style.animation = 'none';
    progressBar.offsetHeight; 
    progressBar.style.animation = null;

    progressBar.setAttribute('id', 'play-animation');
}

function ChargedShot(e){
    if(gameOver == false){
        const currentTime2 = Date.now();
        if (gameOver) {
            if(e.code == "KeyR"){
                resetGame();
            }
        }

        if (e.code == "KeyB") {
            if(currentTime2 - lastChargedShot >= ChargedShotCooldwon){
                playLaserBarAnimation();
                let ChargedBullet = {
                    x: ship.x + ship.width * 27.5 / 64,
                    y: ship.y - tileSize * 16,
                    width: tileSize / 3,
                    height: tileSize * 16,
                    used: false,
                    shipImg : shipImg.src = "./graphics/shipLaser.png"
                };
                ChargedBulletArray.push(ChargedBullet);
                lastChargedShot = currentTime2;
            }
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && 
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;   
}