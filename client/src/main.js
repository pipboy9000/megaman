import { getPlayer } from './player.js';
import * as projectiles from './projectiles.js';
import * as level from "./level.js";
import * as canvas from './canvas.js';
import * as network from './network.js';

let lastFrame = performance.now();

let player = getPlayer();

function gameLoop(time) {
    // Calculate delta time
    let dt = time - lastFrame;
    lastFrame = time;

    // Normalize
    dt /= 16;

    //camera
    canvas.draw();

    player.move(1);
    projectiles.move(1);

    canvas.clearCanvas();

    player.draw();
    projectiles.draw();
    level.draw();

    window.requestAnimationFrame(gameLoop);
}

async function init() {
    await network.init();
    gameLoop(lastFrame);
}




document.addEventListener("DOMContentLoaded", init);
