import { mouse, keyboard, direction } from './input.js';
import * as canvas from './canvas.js';
import { ctx } from './canvas.js';
import * as projectiles from './projectiles.js';

var animationCounter = 0;
var width = 40;
var height = 46;
var spriteDirection = direction.RIGHT;
var x = 300;
var y = 300;
var vx = 0;
var vy = 0;
var canJump = false;
var aim = 0;
var gunOffsetX = 30;
var gunOffsetY = 30;
var recoil = 0;

const sprites = createSprites();
const NUM_SPRITES_STANDING = 3;
const NUM_SPRITES_RUNNING = 11;
const NUM_SPRITES_JUMPING = 7;
const ANIMATION_SPEED = 15; // How much vx it takes to go to the next frame

const RECOIL_TIME = 5;

const physics = {
    acceleration: 1.5,
    friction: 0.8,
    gravity: 2,
    initialJumpSpeed: -30
};

function makeImage(src) {
    let result = new Image();
    result.src = src;
    return result;
}

function createSprites() {
    let result = {};
    result[direction.LEFT] = makeImage("spritesheet_left.png");
    result[direction.RIGHT] = makeImage("spritesheet_right.png");
    return result;
}

export function draw() {
    let row, column; // of the relevant sprite in the spritesheet
    // Row 0: standing, row 1: running, row 2: jumping

    // Calculate row/column + update animationCounter if applicable
    if (canJump) {
        // player is on the ground
        let numSprites;
        if (keyboard[direction.LEFT] || keyboard[direction.RIGHT]) {
            // running
            animationCounter += Math.abs(vx);
            row = 1;
            numSprites = NUM_SPRITES_RUNNING;
        } else {
            // standing
            animationCounter++;
            row = 0;
            numSprites = NUM_SPRITES_STANDING;
        }
        column = Math.floor(
            animationCounter / ANIMATION_SPEED % numSprites
        );
    } else {
        // player is in the air
        row = 2;
        column = Math.min(
            Math.floor(
                (vy - physics.initialJumpSpeed) /
                (-2 * physics.initialJumpSpeed / NUM_SPRITES_JUMPING)
            ),
            NUM_SPRITES_JUMPING - 1
        );
    }

    // Draw
    ctx.drawImage(
        sprites[spriteDirection],
        column * width,
        row * height,
        width,
        height,
        x,
        y,
        width,
        height
    );

    ctx.strokeStyle = "white";

    //draw aim
    ctx.beginPath();
    ctx.moveTo(x + gunOffsetX, y + gunOffsetY);
    ctx.lineTo(x + gunOffsetX + Math.cos(aim) * 50, y + gunOffsetY + Math.sin(aim) * 50);
    ctx.stroke();
}

export function move(dt) {
    // Choose sprite (don't care what happens if both left and right are pressed)
    if (keyboard[direction.RIGHT]) {
        spriteDirection = direction.RIGHT;
    } else if (keyboard[direction.LEFT]) {
        spriteDirection = direction.LEFT;
    }

    // Jump
    if (keyboard[direction.UP] && canJump) {
        canJump = false;
        vy = physics.initialJumpSpeed;
    }

    // Add acceleration
    vx += keyboard[direction.RIGHT] ? physics.acceleration * dt : 0;
    vx -= keyboard[direction.LEFT] ? physics.acceleration * dt : 0;

    // Add friction
    vx *= physics.friction;

    // Move
    y += vy;
    x += vx;

    // Handle gravity/landing
    if (y + height < canvas.height) {
        // midair
        vy += physics.gravity * dt; // gravity
    } else {
        // on the ground
        vy = 0;
        y = canvas.height - height;
        canJump = true;
    }

    //mouse aim
    aim = Math.atan2(mouse.y - (y + gunOffsetY), mouse.x - (x + gunOffsetX));

    //shoot
    if (mouse.leftClick && recoil <= 0) {
        projectiles.shootLaser(x + gunOffsetX, y + gunOffsetY, aim);
        recoil = RECOIL_TIME;
    } else {
        recoil -= 1
    }
}