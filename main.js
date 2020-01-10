import * as megaman from './megaman.js';
import * as projectiles from './projectiles.js';
import { clearCanvas } from './canvas.js';

let lastFrame = performance.now();

function gameLoop(time) {
    // Calculate delta time
    let dt = time - lastFrame;
    lastFrame = time;

    // Normalize
    dt /= 16;

    megaman.move(dt);
    projectiles.move(dt);

    clearCanvas();

    megaman.draw();
    projectiles.draw();

    window.requestAnimationFrame(gameLoop);
}

function init() {
    gameLoop(lastFrame);
}




document.addEventListener("DOMContentLoaded", init);
