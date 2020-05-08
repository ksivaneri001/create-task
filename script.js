/*
Note:
Any function or object preceded by "ctx" or "canvas" is part of the Canvas API.
All the algorithms and abstractions are made by me. I simply used the functions and objects in the API to create these algorithms and abstractions.
Canvas API Source: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
*/

// Canvas Initialization, Variables, Objects
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.strokeStyle = "black";
ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
ctx.textAlign = "center";
ctx.lineWidth = 2.5;

let gameStarted;
let dx = 0;
let dy = 0;
let score;
let simpleScore;
const SLOW_DOWN = 0.2;
let winZoneX;
let time;

let player = {
    x: null,
    y: null,
    radius: 10,
    health: 3,
    invincible: false,
    left: null,
    right: null,
    up: null
};

let terrain;

let enemies;

let terrainTopLayerImg = new Image();
terrainTopLayerImg.src = "images/terrain_top_layer.png";

let terrainImg = new Image();
terrainImg.src = "images/terrain.png";


// Set Intervals
setInterval(game, 10);
setInterval(function() { time = (gameStarted) ? time - 1 : time; }, 1000);


// Event Listeners
window.onload = function() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00d9ff";
    ctx.font = "48px Comic Sans MS";
    ctx.fillText("Jimothy the Orb's Adventure", canvas.width / 2, (canvas.height / 2) - 50);
    ctx.strokeText("Jimothy the Orb's Adventure", canvas.width / 2, (canvas.height / 2) - 50);

    ctx.font = "40px Comic Sans MS";
    ctx.fillText("Press play button to start", canvas.width / 2, (canvas.height / 2) + 50);
    ctx.strokeText("Press play button to start", canvas.width / 2, (canvas.height / 2) + 50);
    ctx.fillStyle = "lightblue";

    document.getElementById("play-button").onclick = init;
    game();
}

document.addEventListener("keydown", getKeydown);
document.addEventListener("keyup", getKeyup);


// Functions
function init() {
    ctx.lineWidth = 1.5;
    ctx.font = "40px Comic Sans MS";
    document.getElementById("play-button").innerHTML = "Restart";

    createTerrain();
    createEnemies();

    player.x = 225;
    player.y = canvas.height / 2;
    player.health = 3;

    winZoneX = 16000;
    score = 0;
    time = 200;
    gameStarted = true;
}

function game() {
    if (gameStarted) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();
        checkCollision();
        hitDetection();
        move();
        enemyBehavior();
        sideScroll();
        simpleScore = Math.trunc(score / 10);
        if (time <= 0 || player.health <= 0) {
            gameOver();
        }
    }
}

function draw() {
    ctx.font = "40px Comic Sans MS";
    for (let i = 0; i < terrain.length; i++) {
        if (terrain[i].topLayer) {
            ctx.drawImage(terrainTopLayerImg, terrain[i].x, terrain[i].y);
        }
        else {
            ctx.drawImage(terrainImg, terrain[i].x, terrain[i].y);
        }
    }
    for (let i = 0; i < enemies.length; i++) {
        ctx.strokeStyle = "#ad0011";
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(enemies[i].x, enemies[i].y, enemies[i].radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    for (let x = winZoneX; x < winZoneX + 100; x += 50) {
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.fillStyle = (x == winZoneX && y % 100 == 0) ? "black" : (x != winZoneX && y % 100 != 0) ? "black" : "white";
            ctx.fillRect(x, y, 50, 50);
        }
    }

    ctx.strokeStyle = (player.invincible) ? "red" : "blue";
    ctx.fillStyle = "#00d9ff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + simpleScore, canvas.width - 125, canvas.height - 20);
    ctx.fillText("Health:", 100, canvas.height - 20);

    ctx.fillStyle = (time < 30) ? "red" : "gray";
    ctx.fillText("Time: " + time, canvas.width - 100, 40);
    ctx.strokeText("Time: " + time, canvas.width - 100, 40);

    ctx.fillStyle = (player.health <= 1) ? "red" : (player.health == 2) ? "orange" : "#00d9ff";
    ctx.fillText(player.health, 185, canvas.height - 20);
    ctx.strokeText(player.health, 185, canvas.height - 20);
    ctx.fillStyle = "lightblue";
}

function checkCollision() {
    for (let i = 0; i < terrain.length; i++) {
        if (player.x + player.radius >= terrain[i].x - 4 && player.x + player.radius < terrain[i].x + 4 && player.y + player.radius >= terrain[i].y + 1 && player.y - player.radius < terrain[i].y + terrain[i].height) {
            dx = 0;
            player.x = terrain[i].x - 4 - player.radius;
        }
        else if (player.x - player.radius <= terrain[i].x + terrain[i].width + 4 && player.x - player.radius > terrain[i].x + terrain[i].width - 4 && player.y + player.radius >= terrain[i].y + 1 && player.y - player.radius < terrain[i].y + terrain[i].height) {
            dx = 0;
            player.x = terrain[i].x + terrain[i].width + 4 + player.radius;
        }
        else if (player.y + player.radius >= terrain[i].y && player.y + player.radius < terrain[i].y + 10 && player.x + player.radius > terrain[i].x && player.x - player.radius < terrain[i].x + terrain[i].width) {
            player.up = (dy >= 0 && dy <= 0.1) ? player.up : false;
            player.y = terrain[i].y - player.radius;
            dy = 0;
        }
        else if (player.y - player.radius <= terrain[i].y + terrain[i].height && player.y + player.radius > terrain[i].y + terrain[i].height - 10 && player.x + player.radius > terrain[i].x && player.x - player.radius < terrain[i].x + terrain[i].width) {
            player.up = false;
            player.y = terrain[i].y + terrain[i].height + player.radius;
            dy = 0;
        }
    }

    if (player.x - player.radius < 0) {
        dx = 0;
        player.x = player.radius;
    }
    if (player.y - player.radius > canvas.height) {
        gameOver();
    }
    if (player.x - player.radius > winZoneX) {
        win();
    }
}

function hitDetection() {
    for (let i = 0; i < enemies.length; i++) {
        if (Math.abs(player.x - enemies[i].x) < player.radius + enemies[i].radius && Math.abs(player.y - enemies[i].y) < player.radius + enemies[i].radius && !player.invincible) {
            damage();
        }
    }
}

function move() {
    if (player.left) {
        dx = (dx > -3) ? dx - SLOW_DOWN : -3;
    }
    else if (player.right) {
        dx = (dx < 3) ? dx + SLOW_DOWN : 3;
    }
    else {
        dx = (dx > 0.1)
        ? dx - SLOW_DOWN
        : (dx < -0.1) ? dx + SLOW_DOWN : 0;
    }

    if (player.up) {
        dy = (dy === 0)
        ? -7.9
        : (dy < 8) ? dy + SLOW_DOWN : 8;
    }
    else {
        dy = (dy === 0)
        ? 0.1
        : (dy < 8) ? dy + SLOW_DOWN : 8;
    }

    player.x += dx;
    player.y += dy;
}

function enemyBehavior() {
    for (let i = 0; i < enemies.length; i++) {
        switch (enemies[i].type) {
            case "X":
                enemies[i].speedX = (enemies[i].x < enemies[i].setPoint1) ? Math.abs(enemies[i].speedX) : (enemies[i].x > enemies[i].setPoint2) ? Math.abs(enemies[i].speedX) * -1 : enemies[i].speedX;
                enemies[i].x += enemies[i].speedX;
                break;
            case "Y":
                enemies[i].speedY = (enemies[i].y < enemies[i].setPoint1) ? Math.abs(enemies[i].speedY) : (enemies[i].y > enemies[i].setPoint2) ? Math.abs(enemies[i].speedY) * -1 : enemies[i].speedY;
                enemies[i].y += enemies[i].speedY;
                break;
            case "CW":
                if (enemies[i].speedX > 0 && enemies[i].speedY == 0 && enemies[i].x > enemies[i].setPointTR) {
                    enemies[i].speedX = 0;
                    enemies[i].speedY = enemies[i].speedInit;
                }
                else if (enemies[i].speedX == 0 && enemies[i].speedY > 0 && enemies[i].y > enemies[i].setPointBR) {
                    enemies[i].speedX = enemies[i].speedInit * -1;
                    enemies[i].speedY = 0;
                }
                else if (enemies[i].speedX < 0 && enemies[i].speedY == 0 && enemies[i].x < enemies[i].setPointBL) {
                    enemies[i].speedX = 0;
                    enemies[i].speedY = enemies[i].speedInit * -1;
                }
                else if (enemies[i].speedX == 0 && enemies[i].speedY < 0 && enemies[i].y < enemies[i].setPointTL) {
                    enemies[i].speedX = enemies[i].speedInit;
                    enemies[i].speedY = 0;
                }
                enemies[i].x += enemies[i].speedX;
                enemies[i].y += enemies[i].speedY;
                break;
            case "CCW":
                if (enemies[i].speedX < 0 && enemies[i].speedY == 0 && enemies[i].x < enemies[i].setPointTL) {
                    enemies[i].speedX = 0;
                    enemies[i].speedY = enemies[i].speedInit;
                }
                else if (enemies[i].speedX == 0 && enemies[i].speedY > 0 && enemies[i].y > enemies[i].setPointBL) {
                    enemies[i].speedX = enemies[i].speedInit;
                    enemies[i].speedY = 0;
                }
                else if (enemies[i].speedX > 0 && enemies[i].speedY == 0 && enemies[i].x > enemies[i].setPointBR) {
                    enemies[i].speedX = 0;
                    enemies[i].speedY = enemies[i].speedInit * -1;
                }
                else if (enemies[i].speedX == 0 && enemies[i].speedY < 0 && enemies[i].y < enemies[i].setPointTR) {
                    enemies[i].speedX = enemies[i].speedInit * -1;
                    enemies[i].speedY = 0;
                }
                enemies[i].x += enemies[i].speedX;
                enemies[i].y += enemies[i].speedY;
                break;
            case "B":
                enemies[i].speedX = (enemies[i].x < enemies[i].setPointX1 && enemies[i].y + enemies[i].radius > enemies[i].setPointY) ? Math.abs(enemies[i].speedX) : (enemies[i].x > enemies[i].setPointX2 && enemies[i].y + enemies[i].radius > enemies[i].setPointY) ? Math.abs(enemies[i].speedX) * -1 : enemies[i].speedX;
                enemies[i].speedY = (enemies[i].y + enemies[i].radius > enemies[i].setPointY) ? enemies[i].speedYInit : enemies[i].speedY + SLOW_DOWN;
                enemies[i].x += enemies[i].speedX;
                enemies[i].y += enemies[i].speedY;
                break;
            default:
                break;
        }
    }
}

function sideScroll() {
    if (player.x > (canvas.width / 2) - 50) {
        player.x = (canvas.width / 2) - 50;
        score += dx;
        winZoneX -= dx;
        for (let i = 0; i < terrain.length; i++) {
            terrain[i].x -= dx;
        }
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].x -= dx;
            switch (enemies[i].type) {
                case "X":
                    enemies[i].setPoint1 -= dx;
                    enemies[i].setPoint2 -= dx;
                    break;
                case "CW":
                    enemies[i].setPointTR -= dx;
                    enemies[i].setPointBL -= dx;
                    break;
                case "CCW":
                    enemies[i].setPointTL -= dx;
                    enemies[i].setPointBR -= dx;
                    break;
                case "B":
                    enemies[i].setPointX1 -= dx;
                    enemies[i].setPointX2 -= dx;
                    break;
                default:
                    break;
            }
        }
    }
}

function damage() {
    player.health--;
    player.invincible = true;
    setTimeout(function() { player.invincible = false; }, 2000);
}

function createTerrain() {
    terrain = [];

    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 0; x < 800; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 800; x < 950; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 950; x < 1200; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 1350; x < 1800; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = -100; y < canvas.height - 250; y += 50) {
        for (let x = 1850; x < 2000; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 1900; x < 2050; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 2250; x < 3050; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 300; y < canvas.height; y += 50) {
        for (let x = 3200; x < 3400; x += 50) {
            if (x >= 3300 || y >= canvas.height - 150) {
                let terrainTemplate = {
                    x: x,
                    y: y,
                    height: 50,
                    width: 50,
                    topLayer: (x >= 3300 && y == canvas.height - 300) ? true : (x < 3300 && y == canvas.height - 150) ? true : false
                };
                terrain.push(terrainTemplate);
            }
        }
    }
    for (let y = 100; y < 200; y += 50) {
        for (let x = 3550; x < 4150; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 3400; x < 4700; x += 50) {
        if ((x >= 3400 && x < 3550) || (x >= 3700 && x < 3800) || (x >= 3950 && x < 4100) || x >= 4250) {
            let terrainTemplate = {
                x: x,
                y: canvas.height - 50,
                height: 50,
                width: 50,
                topLayer: canvas.height - 50
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 4700; x < 4800; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height; y += 50) {
        for (let x = 4900; x < 5000; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 300; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 5150,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 300) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 5400,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 100) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 5600; x < 5800; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 5900; x < 6000; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 6150; x < 6250; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 6250; x < 6450; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 6600; x < 6850; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 7050,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 150) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 7200; x < 7300; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 7300; x < 8500; x += 50) {
        let terrainTemplate = {
            x: x,
            y: canvas.height - 50,
            height: 50,
            width: 50,
            topLayer: true
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 350; y < canvas.height - 200; y += 50) {
        for (let x = 7350; x < 7550; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 350) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 7700; x < 8550; x += 50) {
        if ((x - 7700) % 200 == 0) {
            let terrainTemplate = {
                x: x,
                y: canvas.height - 350,
                height: 50,
                width: 50,
                topLayer: true
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 8500; x < 8650; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height; y += 50) {
        for (let x = 8650; x < 8800; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height; y += 50) {
        for (let x = 8900; x < 9150; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 9200; x < 9350; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 9400; x < 9650; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 9800; x < 9900; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 150; y < canvas.height; y += 50) {
        for (let x = 10050; x < 10700; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 150) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = 0; y < 100; y += 50) {
        for (let x = 10250; x < 11050; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = 100; y < 250; y += 50) {
        for (let x = 10400; x < 10550; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height; y += 50) {
        for (let x = 10700; x < 10850; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 10850; x < 10950; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        for (let x = 11150; x < 11350; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 100) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 100; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 11550,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 100) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 11700,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 200) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 300; y < canvas.height; y += 50) {
        let terrainTemplate = {
            x: 11850,
            y: y,
            height: 50,
            width: 50,
            topLayer: (y == canvas.height - 300) ? true : false
        };
        terrain.push(terrainTemplate);
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 12050; x < 12150; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 12300; x < 12550; x += 50) {
        if (x == 12300 || x == 12500) {
            let terrainTemplate = {
                x: x,
                y: canvas.height - 200,
                height: 50,
                width: 50,
                topLayer: true
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 12700; x < 12900; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 350; y < canvas.height; y += 50) {
        for (let x = 12900; x < 13050; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 350) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 13050; x < 13700; x += 50) {
        let terrainTemplate = {
            x: x,
            y: canvas.height - 50,
            height: 50,
            width: 50,
            topLayer: true
        };
        terrain.push(terrainTemplate);
    }
    for (let y = 0; y < canvas.height - 150; y += 50) {
        for (let x = 13400; x < 13550; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 13700; x < 13850; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height - 100; y += 50) {
        for (let x = 13950; x < 14200; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 250; y < canvas.height - 100; y += 50) {
        for (let x = 13950; x < 14200; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 250) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let x = 14400; x < 15250; x += 50) {
        if ((x - 14400) % 200 == 0) {
            let terrainTemplate = {
                x: x,
                y: canvas.height - 200,
                height: 50,
                width: 50,
                topLayer: true
            };
            terrain.push(terrainTemplate);
        }
    }
    for (let y = canvas.height - 200; y < canvas.height; y += 50) {
        for (let x = 15400; x < 16000; x += 50) {
            let terrainTemplate = {
                x: x,
                y: y,
                height: 50,
                width: 50,
                topLayer: (y == canvas.height - 200) ? true : false
            };
            terrain.push(terrainTemplate);
        }
    }
}

function createEnemies() {
    enemies = [];
    let enemy1 = {
        x: 1600,
        y: canvas.height - 225,
        radius: 25,
        speedX: 2,
        type: "X",
        setPoint1: 1500,
        setPoint2: 1700
    };
    enemies.push(enemy1);
    let enemy2 = {
        x: 2500,
        y: canvas.height - 125,
        radius: 25,
        speedX: 2,
        speedY: -7,
        speedYInit: -7,
        type: "B",
        setPointX1: 2400,
        setPointX2: 2900,
        setPointY: canvas.height - 100
    };
    enemies.push(enemy2);
    let enemy3 = {
        x: 3900,
        y: 75,
        radius: 25,
        speedX: 2,
        type: "X",
        setPoint1: 3700,
        setPoint2: 4100
    };
    enemies.push(enemy3);
    let enemy4 = {
        x: 3875,
        y: canvas.height - 100,
        radius: 20,
        speedY: 1.5,
        type: "Y",
        setPoint1: canvas.height - 225,
        setPoint2: canvas.height - 50
    };
    enemies.push(enemy4);
    let enemy5 = {
        x: 6075,
        y: canvas.height - 200,
        radius: 20,
        speedY: 3,
        type: "Y",
        setPoint1: canvas.height - 350,
        setPoint2: canvas.height - 150
    };
    enemies.push(enemy5);
    let enemy6 = {
        x: 6750,
        y: canvas.height - 165,
        radius: 15,
        speedX: 1.5,
        type: "X",
        setPoint1: 6600,
        setPoint2: 6850
    };
    enemies.push(enemy6);
    let enemy7 = {
        x: 7800,
        y: canvas.height - 125,
        radius: 25,
        speedX: 2,
        speedY: -6.5,
        speedYInit: -6.5,
        type: "B",
        setPointX1: 7700,
        setPointX2: 7900,
        setPointY: canvas.height - 50
    };
    enemies.push(enemy7);
    let enemy8 = {
        x: 8150,
        y: canvas.height - 125,
        radius: 25,
        speedX: -2,
        speedY: -6.5,
        speedYInit: -6.5,
        type: "B",
        setPointX1: 8150,
        setPointX2: 8350,
        setPointY: canvas.height - 50
    };
    enemies.push(enemy8);
    let enemy9 = {
        x: 9100,
        y: canvas.height - 265,
        radius: 15,
        speedX: 1.5,
        type: "X",
        setPoint1: 8900,
        setPoint2: 9150
    };
    enemies.push(enemy9);
    let enemy10 = {
        x: 9500,
        y: canvas.height - 165,
        radius: 15,
        speedX: 2,
        type: "X",
        setPoint1: 9400,
        setPoint2: 9650
    };
    enemies.push(enemy10);
    let enemy11 = {
        x: 9975,
        y: canvas.height - 200,
        radius: 20,
        speedY: 3,
        type: "Y",
        setPoint1: canvas.height - 350,
        setPoint2: canvas.height - 150
    };
    enemies.push(enemy11);
    let enemy12 = {
        x: 10250,
        y: canvas.height - 175,
        radius: 25,
        speedX: 2,
        type: "X",
        setPoint1: 10200,
        setPoint2: 10675
    };
    enemies.push(enemy12);
    let enemy13 = {
        x: 12225,
        y: canvas.height - 300,
        radius: 20,
        speedY: 3,
        type: "Y",
        setPoint1: canvas.height - 400,
        setPoint2: canvas.height - 225
    };
    enemies.push(enemy13);
    let enemy14 = {
        x: 12425,
        y: canvas.height - 350,
        radius: 20,
        speedY: 3,
        type: "Y",
        setPoint1: canvas.height - 400,
        setPoint2: canvas.height - 225
    };
    enemies.push(enemy14);
    let enemy15 = {
        x: 12625,
        y: canvas.height - 350,
        radius: 20,
        speedY: -3,
        type: "Y",
        setPoint1: canvas.height - 400,
        setPoint2: canvas.height - 225
    };
    enemies.push(enemy15);
    let enemy16 = {
        x: 13200,
        y: canvas.height - 175,
        radius: 25,
        speedX: 4,
        type: "X",
        setPoint1: 13075,
        setPoint2: 13375
    };
    enemies.push(enemy16);
    let enemy17 = {
        x: 13600,
        y: canvas.height - 175,
        radius: 15,
        speedX: 1.75,
        type: "X",
        setPoint1: 13565,
        setPoint2: 13685
    };
    enemies.push(enemy17);
    let enemy18 = {
        x: 14425,
        y: canvas.height - 215,
        radius: 15,
        speedX: 2,
        speedY: 0,
        speedInit: 2,
        type: "CW",
        setPointTL: canvas.height - 215,
        setPointTR: 14465,
        setPointBR: canvas.height - 135,
        setPointBL: 14385,
    };
    enemies.push(enemy18);
    let enemy19 = {
        x: 14825,
        y: canvas.height - 215,
        radius: 15,
        speedX: -3,
        speedY: 0,
        speedInit: 3,
        type: "CCW",
        setPointTL: 14785,
        setPointTR: canvas.height - 215,
        setPointBR: 14865,
        setPointBL: canvas.height - 135
    };
    enemies.push(enemy19);
    let enemy20 = {
        x: 15225,
        y: canvas.height - 215,
        radius: 15,
        speedX: 2,
        speedY: 0,
        speedInit: 2,
        type: "CW",
        setPointTL: canvas.height - 215,
        setPointTR: 15265,
        setPointBR: canvas.height - 135,
        setPointBL: 15185,
    };
    enemies.push(enemy20);
    let enemy21 = {
        x: 15225,
        y: canvas.height - 135,
        radius: 15,
        speedX: -2,
        speedY: 0,
        speedInit: 2,
        type: "CW",
        setPointTL: canvas.height - 215,
        setPointTR: 15265,
        setPointBR: canvas.height - 135,
        setPointBL: 15185,
    };
    enemies.push(enemy21);
    let enemy22 = {
        x: 15700,
        y: canvas.height - 225,
        radius: 25,
        speedX: 3.5,
        type: "X",
        setPoint1: 15600,
        setPoint2: 15800
    };
    enemies.push(enemy22);
}

function getKeydown(event) {
    if (event.keyCode == 37) {
        player.left = true;
        player.right = false;
    }
    if (event.keyCode == 38) {
        player.up = true;
    }
    else if (event.keyCode == 39) {
        player.right = (player.x > (canvas.width / 2) - 50) ? false : true;
        player.left = false;
    }
}

function getKeyup(event2) {
    if (event2.keyCode == 38) {}
    else if (event2.keyCode == 37) {
        player.left = false;
    }
    else if (event2.keyCode == 39) {
        player.right = false;
    }
}

function win() {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.lineWidth = 2.5;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.left = false;
    player.right = false;
    gameStarted = false;
    let finalScore = simpleScore + (player.health * 100) + time;

    ctx.fillStyle = "#00d9ff";
    ctx.font = "72px Comic Sans MS";
    ctx.fillText("YOU WIN!!!", canvas.width / 2, (canvas.height / 2) - 125);
    ctx.strokeText("YOU WIN!!!", canvas.width / 2, (canvas.height / 2) - 125);

    ctx.fillStyle = "lightgray";
    ctx.textAlign = "right";
    ctx.font = "40px Comic Sans MS";
    ctx.fillText("Base Score = " + simpleScore, (canvas.width / 2) + 195, (canvas.height / 2) - 35);
    ctx.strokeText("Base Score = " + simpleScore, (canvas.width / 2) + 195, (canvas.height / 2) - 35);

    ctx.fillText("Health = " + player.health + " * 100 = " + (player.health * 100), (canvas.width / 2) + 195, (canvas.height / 2) + 15);
    ctx.strokeText("Health = " + player.health + " * 100 = " + (player.health * 100), (canvas.width / 2) + 195, (canvas.height / 2) + 15);

    ctx.fillText("Time = " + time, (canvas.width / 2) + 195, (canvas.height / 2) + 65);
    ctx.strokeText("Time = " + time, (canvas.width / 2) + 195, (canvas.height / 2) + 65);

    ctx.fillText("+" + "___", (canvas.width / 2) + 195, (canvas.height / 2) + 95);
    ctx.strokeText("+" + "___", (canvas.width / 2) + 195, (canvas.height / 2) + 95);

    ctx.fillStyle = "#00d9ff";
    ctx.textAlign = "center";
    ctx.font = "48px Comic Sans MS";
    ctx.fillText("Final Score = " + finalScore, canvas.width / 2, (canvas.height / 2) + 175);
    ctx.strokeText("Final Score = " + finalScore, canvas.width / 2, (canvas.height / 2) + 175);
    document.getElementById("play-button").innerHTML = "Play Again";
}

function gameOver() {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "lightblue";
    ctx.lineWidth = 2.5;
    player.health = 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();
    ctx.fillStyle = "maroon";
    ctx.fillText(player.health, 185, canvas.height - 20);
    ctx.strokeText(player.health, 185, canvas.height - 20);

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameStarted = false;
    player.left = false;
    player.right = false;

    ctx.fillStyle = "#00d9ff";
    ctx.font = "72px Comic Sans MS";
    ctx.fillText("GAME OVER", canvas.width / 2, (canvas.height / 2) - 50);
    ctx.strokeText("GAME OVER", canvas.width / 2, (canvas.height / 2) - 50);

    ctx.fillStyle = "#00d9ff";
    ctx.font = "48px Comic Sans MS";
    ctx.fillText("Final Score = " + simpleScore, canvas.width / 2, (canvas.height / 2) + 50);
    ctx.strokeText("Final Score = " + simpleScore, canvas.width / 2, (canvas.height / 2) + 50);
    document.getElementById("play-button").innerHTML = "Play Again";
}
