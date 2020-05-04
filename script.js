// Canvas Initialization, Variables, Objects
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.fillStyle = "lightblue";
ctx.textAlign = "center";

let gameStarted;
let dx = 0;
let dy = 0;
let score;
let simpleScore;
const SLOW_DOWN = 0.2;
let winZoneX = 16000;
let time;

let player = {
    x: null,
    y: null,
    radius: 10,
    health: 3,
    left: null,
    right: null,
    up: null,
};

let terrain;

let terrainTopLayerImg = new Image();
terrainTopLayerImg.src = "images/terrain_top_layer.png";

let terrainImg = new Image();
terrainImg.src = "images/terrain.png";


// Set Intervals
setInterval(game, 10);
setInterval(function() { time = (gameStarted) ? time - 1 : time; }, 1000);


// Event Listeners
window.onload = function() {
    ctx.font = "48px Comic Sans MS";
    ctx.fillText("Jimothy the Orb's Adventure", canvas.width / 2, (canvas.height / 2) - 50);
    ctx.strokeText("Jimothy the Orb's Adventure", canvas.width / 2, (canvas.height / 2) - 50);

    ctx.font = "36px Comic Sans MS";
    ctx.fillText("Press play button to start", canvas.width / 2, (canvas.height / 2) + 50);
    ctx.strokeText("Press play button to start", canvas.width / 2, (canvas.height / 2) + 50);

    document.getElementById("play-button").onclick = init;
    game();
}

document.addEventListener("keydown", getKeydown);
document.addEventListener("keyup", getKeyup);


// Functions
function init() {
    document.getElementById("play-button").innerHTML = "Restart";

    createTerrain();

    player.x = 225;
    player.y = canvas.height / 2;

    winZoneX = 16000;
    score = 0;
    time = 100;
    gameStarted = true;
}

function game() {
    if (gameStarted) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();
        checkCollision();
        move();
        sideScroll();
        simpleScore = Math.trunc(score / 10);
        if (time < 0) {
            gameOver();
        }
        // console.log("up: " + player.up);
        // console.log("dy: " + dy);
        // console.log("dx: " + dx);
        // console.log("player.x: " + player.x);
        // console.log("simpleScore: " + simpleScore);
        // console.log("winZoneX: " + winZoneX);
        // console.log("time: " + time);
    }
}

function draw() {
    for (let i = 0; i < terrain.length; i++) {
        if (terrain[i].topLayer) {
            ctx.drawImage(terrainTopLayerImg, terrain[i].x, terrain[i].y);
        }
        else {
            ctx.drawImage(terrainImg, terrain[i].x, terrain[i].y);
        }
    }

    ctx.strokeStyle = "blue";
    ctx.strokeRect(winZoneX, 0, 100, canvas.height);

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + simpleScore, canvas.width - 125, canvas.height - 20);
    ctx.fillText("Health:", 100, canvas.height - 20);
    ctx.fillText("Time : " + time, canvas.width - 100, 40);

    ctx.fillStyle = (player.health == 1) ? "red" : (player.health == 2) ? "orange" : "#00d9ff";
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

function sideScroll() {
    if (player.x > (canvas.width / 2) - 50) {
        player.x = (canvas.width / 2) - 50;
        score += dx;
        winZoneX -= dx;
        for (let i = 0; i < terrain.length; i++) {
            terrain[i].x -= dx;
        }
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.left = false;
    player.right = false;
    gameStarted = false;
    let finalScore = simpleScore + (player.health * 100) + time;
    alert("Base Score: " + simpleScore + "\nHealth: " + player.health + " * 100 = " + (player.health * 100) + "\nTime: " + time + "\nFinal Score: " + finalScore);
    document.getElementById("play-button").innerHTML = "Play Again";
}

function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameStarted = false;
    player.left = false;
    player.right = false;
    alert("Final Score: " + simpleScore);
    document.getElementById("play-button").innerHTML = "Play Again";
}
