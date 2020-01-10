import { ctx } from './canvas.js';

const lasers = [];

const LASER_SPEED = 30;

function init() {
    for (var i = 0; i < 10; i++) {
        lasers[i] = {
            active: false,
            x: 0,
            y: 0,
            dir: 0,
            age: 0
        }
    }
}

function getLaser() {
    return lasers.find(laser => {
        return !laser.active
    })
}

export function shootLaser(x, y, dir) {
    let l = getLaser();
    if (l) {
        l.x = x;
        l.y = y;
        l.dir = dir;
        l.age = 0
        l.active = true;
    }
}

export function move(dt) {
    lasers.forEach(l => {
        if (l.active) {
            l.x += Math.cos(l.dir) * LASER_SPEED * dt;
            l.y += Math.sin(l.dir) * LASER_SPEED * dt;
            l.age += dt;

            if (l.age > 50) {
                l.active = false;
            }
        }
    })
}

export function draw() {
    lasers.forEach(l => {
        if (l.active) {
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + Math.cos(l.dir) * 10, l.y + Math.sin(l.dir) * 10);
            ctx.stroke();
        }
    })
}

init();

