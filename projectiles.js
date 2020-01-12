import { ctx } from './canvas.js';

const lasers = [];

const LASER_SPEED = 15;

function init() {
    for (var i = 0; i < 25; i++) {
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
            l.x += Math.cos(l.dir) * LASER_SPEED * dt * (l.age / 30);
            l.y += Math.sin(l.dir) * LASER_SPEED * dt * (l.age / 30)
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

            ctx.lineJoin = "round";

            ctx.lineWidth = 7;
            ctx.strokeStyle = "red"

            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + Math.cos(l.dir) * 25, l.y + Math.sin(l.dir) * 25);
            ctx.stroke();

            ctx.lineWidth = 5 + l.age % 3;
            ctx.strokeStyle = "orange"

            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + Math.cos(l.dir) * 25, l.y + Math.sin(l.dir) * 25);
            ctx.stroke();

            ctx.lineWidth = 3;
            ctx.strokeStyle = "white"

            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + Math.cos(l.dir) * 25, l.y + Math.sin(l.dir) * 25);
            ctx.stroke();
        }
    })
}

init();

