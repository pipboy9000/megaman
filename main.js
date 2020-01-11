import * as megaman from './megaman.js';
import * as projectiles from './projectiles.js';
import * as level from "./level.js";
import * as canvas from './canvas.js';

let lastFrame = performance.now();

function gameLoop(time) {
    // Calculate delta time
    let dt = time - lastFrame;
    lastFrame = time;

    // Normalize
    dt /= 16;

    //camera
    canvas.draw();

    megaman.move(1);
    projectiles.move(1);

    canvas.clearCanvas();

    megaman.draw();
    projectiles.draw();
    level.draw();

    window.requestAnimationFrame(gameLoop);
}

function init() {
    gameLoop(lastFrame);
}




document.addEventListener("DOMContentLoaded", init);
