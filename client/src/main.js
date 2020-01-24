import { getPlayer } from './player.js';
import * as projectiles from './projectiles.js';
import * as level from "./level.js";
import * as canvas from './canvas.js';
import * as network from './network.js';

let lastFrame = performance.now();

let player;

function gameLoop(time) {
    // Calculate delta time
    let dt = time - lastFrame;
    lastFrame = time;

    // Normalize
    // dt /= 16;
    dt = 1;

    //camera
    canvas.draw(dt);

    player.move(dt);
    projectiles.move(dt);
    network.move(dt)


    canvas.clearCanvas();

    player.draw();
    projectiles.draw();
    level.draw();
    network.draw();

    window.requestAnimationFrame(gameLoop);
}

async function init() {
    player = getPlayer();
    await network.init();
    gameLoop(lastFrame);
}




document.addEventListener("DOMContentLoaded", init);
