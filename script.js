// Canvas Initialization and Variables
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";




// Set Intervals
setInterval(game, 10);


// Event Listeners
window.onload = function() {
    init();
    game();
}


// Functions
function init() {
    ctx.strokeRect(-5, canvas.height - 30, canvas.width + 5, 35);
}

function game() {

}
