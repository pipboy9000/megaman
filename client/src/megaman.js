import { mouse, keyboard, direction } from './input.js';
import * as canvas from './canvas.js';
import { ctx } from './canvas.js';
import * as projectiles from './projectiles.js';
import * as level from './level.js';
import * as lines from './lines.js';

//sprites
import SpritesheetLeft from './assets/spritesheet_left.png';
import SpritesheetRight from './assets/spritesheet_right.png';

export class Megaman {
    constructor() {
        this.animationCounter = 0;
        this.width = 40;
        this.height = 46;
        this.spriteDirection = direction.RIGHT;
        this.x = 300;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        this.canJump = false;
        this.aim = 0;
        this.gunOffsetX = 30;
        this.gunOffsetY = 30;
        this.recoil = 0;
        this.jetpackPush = { x: 0, y: 0 }
        this.jetpackFuel = 100;

        this.sprites = this.createSprites();
        this.NUM_SPRITES_STANDING = 3;
        this.NUM_SPRITES_RUNNING = 11;
        this.NUM_SPRITES_JUMPING = 7;
        this.ANIMATION_SPEED = 15; // How much vx it takes to go to the next frame

        this.RECOIL_TIME = 3;

        this.JETPACK_VEC = { x: 0, y: -0.3 };
        this.JETPACK_MAX = 1.3;
        this.JETPACK_FUEL_FULL = 100;

        this.physics = {
            acceleration: 1.5,
            friction: 0.8,
            gravity: 1,
            initialJumpSpeed: -15
        };

        //collision circle
        this.colRad = 25;
        this.colOffsetX = 20;
        this.colOffsetY = 20;
    }

    makeImage(src) {
        let result = new Image();
        result.src = src;
        return result;
    }

    createSprites() {
        let result = {};
        result[direction.LEFT] = this.makeImage(SpritesheetLeft);
        result[direction.RIGHT] = this.makeImage(SpritesheetRight);
        return result;
    }

    draw() {
        let row, column; // of the relevant sprite in the spritesheet
        // Row 0: standing, row 1: running, row 2: jumping

        // Calculate row/column + update animationCounter if applicable
        if (this.canJump) {
            // player is on the ground
            let numSprites;
            if (keyboard[direction.LEFT] || keyboard[direction.RIGHT]) {
                // running
                this.animationCounter += Math.abs(this.vx);
                row = 1;
                numSprites = this.NUM_SPRITES_RUNNING;
            } else {
                // standing
                this.animationCounter++;
                row = 0;
                this.numSprites = this.NUM_SPRITES_STANDING;
            }
            column = Math.floor(
                this.animationCounter / this.ANIMATION_SPEED % this.numSprites
            );
        } else {
            // player is in the air
            row = 2;
            column = Math.min(
                Math.floor(
                    (this.vy - this.physics.initialJumpSpeed) /
                    (-2 * this.physics.initialJumpSpeed / this.NUM_SPRITES_JUMPING)
                ),
                this.NUM_SPRITES_JUMPING - 1
            );
        }

        // Draw
        ctx.drawImage(
            this.sprites[this.spriteDirection],
            column * this.width,
            row * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
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
        ctx.arc(this.x + this.colOffsetX, this.y + this.colOffsetY, this.colRad, 0, Math.PI * 2);
        ctx.stroke();

        //fuel line
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.rect(this.x + 5, this.y + 50, this.jetpackFuel / 2, 5);
        ctx.fill();
    }

    move(dt) {

        // gravity
        let gravityVec = { x: 0.0001, y: 1 }; //i dunno why but if x is zero then colCheck fails sometimes

        // Choose sprite (don't care what happens if both left and right are pressed)
        if (keyboard[direction.RIGHT]) {
            this.spriteDirection = direction.RIGHT;
        } else if (keyboard[direction.LEFT]) {
            this.spriteDirection = direction.LEFT;
        }

        // Jump
        if (keyboard[direction.UP] && this.canJump) {
            this.canJump = false;
            this.vy = this.physics.initialJumpSpeed;
        }

        // Add acceleration
        this.vx += keyboard[direction.RIGHT] ? this.physics.acceleration * dt : 0;
        this.vx -= keyboard[direction.LEFT] ? this.physics.acceleration * dt : 0;

        //jet pack
        if (mouse.rightClick && jetpackFuel > 0) {
            canJump = false;
            this.jetpackPush.x += mouse.rightClick ? JETPACK_VEC.x * dt : 0;
            this.jetpackPush.y += mouse.rightClick ? JETPACK_VEC.y * dt : 0;
            if (lines.getLength(this.jetpackPush) >= JETPACK_MAX) {
                this.jetpackPush = lines.normalize(this.jetpackPush);
                this.jetpackPush.x *= JETPACK_MAX;
                this.jetpackPush.y *= JETPACK_MAX;
            }
            this.jetpackPush.x *= physics.friction;
            this.jetpackPush.y *= physics.friction;
            this.vx += this.jetpackPush.x;
            this.vy += this.jetpackPush.y;

            this.jetpackFuel -= 1;
        } else {
            if (this.jetpackFuel < this.JETPACK_FUEL_FULL && !mouse.rightClick) {
                this.jetpackFuel += 1;
            }
        }

        //gravity
        this.vx += this.physics.gravity * dt * gravityVec.x;
        this.vy += this.physics.gravity * dt * gravityVec.y;

        //friction
        this.vx *= this.physics.friction;

        //limit overall movement for 1 frame
        let maxMove = this.colRad;
        if (lines.getLength({ x: this.vx, y: this.vy }) > maxMove) {
            let nv = lines.normalize({ x: this.vx, y: this.vy });
            this.vx = nv.x * maxMove;
            this.vy = nv.y * maxMove;
        }

        // Move
        this.y += this.vy;
        this.x += this.vx;

        let vLength = lines.getLength({ x: this.vx, y: this.vy });

        //check wall collision
        let newX = this.x;
        let newY = this.y;

        // canJump = false;

        let moveBack = level.checkCol(this.x + this.colOffsetX, this.y + this.colOffsetY, this.colRad, gravityVec);
        let iterations = 0;
        while (moveBack && (moveBack.x != 0 || moveBack.y != 0) && iterations < 30) {

            iterations++;

            this.x += moveBack.x;
            this.y += moveBack.y;

            if (moveBack.isFloor) {
                this.vy = 0;
                this.canJump = true;
            }

            moveBack = level.checkCol(this.x + this.colOffsetX, this.y + this.colOffsetY, this.colRad, gravityVec);
        }

        // x = newX;
        // y = newY;

        //zoom center
        canvas.center(this.x, this.y);

        //mouse aim
        this.aim = Math.atan2(mouse.y - (this.y + this.gunOffsetY), mouse.x - (this.x + this.gunOffsetX));

        //shoot
        if (mouse.leftClick && this.recoil <= 0) {
            projectiles.shootLaser(this.x + this.gunOffsetX, this.y + this.gunOffsetY, this.aim);
            this.recoil = this.RECOIL_TIME;
        } else {
            this.recoil -= 1
        }
    }
}