import { mouse, keyboard, direction } from './input.js';
import * as canvas from './canvas.js';
import { ctx } from './canvas.js';
import * as projectiles from './projectiles.js';
import * as level from './level.js';
import * as lines from './lines.js';


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
    gravity: 1,
    initialJumpSpeed: -15
};

//collision circle
const colRad = 20;
const colOffsetX = 20;
const colOffsetY = 30;

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

    //draw aim

    // ctx.strokeStyle = "white";
    // ctx.beginPath();
    // ctx.moveTo(x + gunOffsetX, y + gunOffsetY);
    // ctx.lineTo(x + gunOffsetX + Math.cos(aim) * 50, y + gunOffsetY + Math.sin(aim) * 50);
    // ctx.stroke();


    //draw collision circle;
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x + colOffsetX, y + colOffsetY, colRad, 0, Math.PI * 2);
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

    // gravity
    vy += physics.gravity * dt;

    // Move
    y += vy;
    x += vx;

    //check wall collision
    let newX = x;
    let newY = y;

    canJump = false;

    let moveBack = level.checkCol(newX + colOffsetX, newY + colOffsetY, vx, vy, colRad);
    let iterations = 0;
    while ((moveBack.x != 0 || moveBack.y != 0) && iterations < 5) {

        iterations++;

        newX += moveBack.x;
        newY += moveBack.y;

        moveBack = level.checkCol(newX + colOffsetX, newY + colOffsetY, vx, vy, colRad);
    }

    let upVec = { x: 0, y: -1 };

    let dp = lines.dotProduct(lines.normalize(upVec), lines.normalize(moveBack));

    console.log(dp);

    if (newY < y) { //are we on a floor?
        vy = 0;
        canJump = true;
        y = newY;

        //after moving the player up we need to check again for wall collision
        moveBack = level.checkCol(x + colOffsetX, y + colOffsetY, vx, vy, colRad);
        x += moveBack.x;
        y += moveBack.y;

    } else {
        x = newX;
        y = newY;
    }


    //zoom camera
    canvas.center(x, y);

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