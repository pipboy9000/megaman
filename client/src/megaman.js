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
    constructor(player, input) {
        this.player = player;
        this.input = input;
        this.sprites = this.createSprites();
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
        let { player, physics } = { player: this.player, physics: this.player.physics }
        let { keyboard, mouse, direction } = { keyboard: this.input.keyboard, mouse: this.input.mouse, direction: this.input.direction };

        let row, column; // of the relevant sprite in the spritesheet
        // Row 0: standing, row 1: running, row 2: jumping

        // Calculate row/column + update animationCounter if applicable
        if (player.canJump) {
            // player is on the ground
            let numSprites;
            if (keyboard[direction.LEFT] || keyboard[direction.RIGHT]) {
                // running
                player.animationCounter += Math.abs(player.vx);
                row = 1;
                numSprites = player.NUM_SPRITES_RUNNING;
            } else {
                // standing
                player.animationCounter++;
                row = 0;
                player.numSprites = player.NUM_SPRITES_STANDING;
            }
            column = Math.floor(
                player.animationCounter / player.ANIMATION_SPEED % player.numSprites
            );
        } else {
            // player is in the air
            row = 2;
            column = Math.min(
                Math.floor(
                    (player.vy - physics.initialJumpSpeed) /
                    (-2 * physics.initialJumpSpeed / player.NUM_SPRITES_JUMPING)
                ),
                player.NUM_SPRITES_JUMPING - 1
            );
        }

        // Draw
        ctx.drawImage(
            player.sprites[player.spriteDirection],
            column * player.width,
            row * player.height,
            player.width,
            player.height,
            player.x,
            player.y,
            player.width,
            player.height
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
        let { player, physics } = { player: this.player, physics: this.player.physics }
        let { keyboard, mouse, direction } = { keyboard: this.input.keyboard, mouse: this.input.mouse, direction: this.input.direction };

        // gravity
        let gravityVec = { x: 0.0001, y: 1 }; //i dunno why but if x is zero then colCheck fails sometimes

        // Choose sprite (don't care what happens if both left and right are pressed)
        if (keyboard[direction.RIGHT]) {
            player.spriteDirection = direction.RIGHT;
        } else if (keyboard[direction.LEFT]) {
            player.spriteDirection = direction.LEFT;
        }

        // Jump
        if (keyboard[direction.UP] && player.canJump) {
            player.canJump = false;
            player.vy = physics.initialJumpSpeed;
        }

        // Add acceleration
        this.vx += keyboard[direction.RIGHT] ? this.physics.acceleration * dt : 0;
        this.vx -= keyboard[direction.LEFT] ? this.physics.acceleration * dt : 0;

        //jet pack
        if (mouse.rightClick && this.jetpackFuel > 0) {
            this.canJump = false;
            this.jetpackPush.x += mouse.rightClick ? this.JETPACK_VEC.x * dt : 0;
            this.jetpackPush.y += mouse.rightClick ? this.JETPACK_VEC.y * dt : 0;
            if (lines.getLength(this.jetpackPush) >= this.JETPACK_MAX) {
                this.jetpackPush = lines.normalize(this.jetpackPush);
                this.jetpackPush.x *= this.JETPACK_MAX;
                this.jetpackPush.y *= this.JETPACK_MAX;
            }
            this.jetpackPush.x *= this.physics.friction;
            this.jetpackPush.y *= this.physics.friction;
            this.vx += this.jetpackPush.x;
            this.vy += this.jetpackPush.y;

            this.jetpackFuel -= 1;
        } else {
            if (this.jetpackFuel < this.JETPACK_FUEL_FULL && !mouse.rightClick) {
                this.jetpackFuel += 1;
            }
        }

        //gravity
        player.vx += physics.gravity * dt * gravityVec.x;
        player.vy += physics.gravity * dt * gravityVec.y;

        //friction
        player.vx *= physics.friction;

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