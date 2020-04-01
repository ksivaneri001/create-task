// Canvas Initialization, Variables, Objects
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";

let gameStarted;
let dx = 0;
let dy = 0;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 20,
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

document.addEventListener("keydown", getKeys);


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
        dx = -3;
    }
    else if (player.right) {
        dx = 3;
    }
    else {
        dx = 0;
    }

    player.x += dx;
}

function getKeys(event) {
    if (event.keyCode == 37) {
        player.left = true;
        player.right = false;
        console.log(player.left + " " + player.right);
    }
    else if (event.keyCode == 39) {
        player.right = true;
        player.left = false;
        console.log(player.left + " " + player.right);
    }
    else {
        player.left = false;
        player.right = false;
    }
}
