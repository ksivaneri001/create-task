// Canvas Initialization, Variables, Objects
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.fillStyle = "lightblue";

let gameStarted;
let dx = 0;
let dy = 0;
let score;
const SLOW_DOWN = 0.2;

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


// Set Intervals
setInterval(game, 10);


// Event Listeners
window.onload = function() {
    init();
    game();
}

document.addEventListener("keydown", getKeydown);
document.addEventListener("keyup", getKeyup);


// Functions
function init() {
    createTerrain();

    player.x = 225;
    player.y = canvas.height / 2;

    score = 0;
    gameStarted = true;
}

function game() {
    if (gameStarted) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();
        checkCollision();
        move();
        sideScroll();
        // console.log("up: " + player.up);
        // console.log("dy: " + dy);
        // console.log("dx: " + dx);
        // console.log("player.x: " + player.x);
        // console.log("score: " + Math.trunc(score / 25));
    }
}

function draw() {
    // ctx.strokeRect(0, canvas.height - 30, canvas.width - 200, 35);

    for (let i = 0; i < terrain.length; i++) {
        ctx.strokeStyle = (terrain[i].topLayer) ? "green" : "black";
        ctx.strokeRect(terrain[i].x, terrain[i].y, terrain[i].width, terrain[i].height);
    }

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function checkCollision() {
    for (let i = 0; i < terrain.length; i++) {
        if (player.x + player.radius >= terrain[i].x - 4 && player.x + player.radius < terrain[i].x && player.y + player.radius >= terrain[i].y + 0.5 && player.y - player.radius < terrain[i].y + terrain[i].height) {
            dx = 0;
            player.x = terrain[i].x - 4 - player.radius;
        }
        else if (player.x - player.radius <= terrain[i].x + terrain[i].width + 4 && player.x - player.radius > terrain[i].x + terrain[i].width && player.y + player.radius >= terrain[i].y + 0.5 && player.y - player.radius < terrain[i].y + terrain[i].height) {
            dx = 0;
            player.x = terrain[i].x + terrain[i].width + 4 + player.radius;
        }
        else if (player.y + player.radius >= terrain[i].y && player.y - player.radius < terrain[i].y + terrain[i].height && player.x + player.radius > terrain[i].x && player.x - player.radius < terrain[i].x + terrain[i].width) {
            player.up = (dy >= 0 && dy <= 0.1) ? player.up : false;
            player.y = terrain[i].y - player.radius;
            dy = 0;
        }
    }

    if (player.x - player.radius < 0) {
        dx = 0;
        player.x = player.radius;
    }
    if (player.y - player.radius > canvas.height) {
        init();
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
        for (let x = 800; x < 900; x += 50) {
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
