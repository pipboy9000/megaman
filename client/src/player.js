import { Megaman } from './megaman.js';
import { mouse, keyboard, direction } from './input.js';

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
    recoil: 0,
    jetpackFuel: 100,
    jetpackPush: { x: 0, y: 0 }
}

export function getPlayer() {
    return new Megaman(player, input);
}

export function getState() {
    return { player, input }
}