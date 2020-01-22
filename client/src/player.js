import megaman, { Megaman } from './megaman.js';
import { mouse, keyboard, direction } from './input.js';
import * as canvas from './canvas.js';
import { ctx } from './canvas.js';
import * as projectiles from './projectiles.js';
import * as level from './level.js';
import * as lines from './lines.js';

let input = { mouse, keyboard, direction }

let player = {
    animationCounter: 0,
    width: 40,
    height: 46,
    spriteDirection: direction.RIGHT,
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    canJump: false,
    aim: 0,
    gunOffsetX: 30,
    gunOffsetY: 30,
    recoil: 0,
    jetpackPush: { x: 0, y: 0 },
    jetpackFuel: 100,

    sprites: null,
    NUM_SPRITES_STANDING: 3,
    NUM_SPRITES_RUNNING: 11,
    NUM_SPRITES_JUMPING: 7,
    ANIMATION_SPEED: 15, // How much vx it takes to go to the next frame

    RECOIL_TIME: 3,

    JETPACK_VEC: { x: 0, y: -0.3 },
    JETPACK_MAX: 1.3,
    JETPACK_FUEL_FULL: 100,

    physics: {
        acceleration: 1.5,
        friction: 0.8,
        gravity: 1,
        initialJumpSpeed: -15
    },

    //collision circle
    colRad: 20,
    colOffsetX: 20,
    colOffsetY: 30,
}

export function getPlayer() {
    return new Megaman(player, input);
} 