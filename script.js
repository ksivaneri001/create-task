// Canvas Initialization, Variables, Objects
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";

let gameStarted;
let dx = 0;
let dy = 0;
const SLOW_DOWN = 0.2;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 10,
    health: 3,
    left: null,
    right: null,
    up: null,
    down: null,
    state: "Grounded"
};


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
    gameStarted = true;
}

function game() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
        checkCollision();
        move();
        console.log(dx);
    }

}

function draw() {
    ctx.strokeRect(-5, canvas.height - 30, canvas.width + 5, 35);

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function checkCollision() {

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

    player.x += dx;
}

function getKeydown(event) {
    if (event.keyCode == 37) {
        player.left = true;
        player.right = false;
    }
    else if (event.keyCode == 39) {
        player.right = true;
        player.left = false;
    }
}

function getKeyup(event2) {
    if (event2.keyCode == 37 || event2.keyCode == 39) {
        player.left = false;
        player.right = false;
    }
    else {
        player.left = false;
        player.right = false;
    }
}
