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
        player.sprites = this.createSprites();
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
        ctx.arc(player.x + player.colOffsetX, player.y + player.colOffsetY, player.colRad, 0, Math.PI * 2);
        ctx.stroke();

        //fuel line
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.rect(player.x + 5, player.y + 50, player.jetpackFuel / 2, 5);
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
        player.vx += keyboard[direction.RIGHT] ? physics.acceleration * dt : 0;
        player.vx -= keyboard[direction.LEFT] ? physics.acceleration * dt : 0;

        //jet pack
        if (mouse.rightClick && player.jetpackFuel > 0) {
            player.canJump = false;
            player.jetpackPush.x += mouse.rightClick ? player.JETPACK_VEC.x * dt : 0;
            player.jetpackPush.y += mouse.rightClick ? player.JETPACK_VEC.y * dt : 0;
            if (lines.getLength(player.jetpackPush) >= player.JETPACK_MAX) {
                player.jetpackPush = lines.normalize(player.jetpackPush);
                player.jetpackPush.x *= player.JETPACK_MAX;
                player.jetpackPush.y *= player.JETPACK_MAX;
            }
            player.jetpackPush.x *= player.physics.friction;
            player.jetpackPush.y *= player.physics.friction;
            player.vx += player.jetpackPush.x;
            player.vy += player.jetpackPush.y;

            player.jetpackFuel -= 1;
        } else {
            if (player.jetpackFuel < player.JETPACK_FUEL_FULL && !mouse.rightClick) {
                player.jetpackFuel += 1;
            }
        }

        //gravity
        player.vx += physics.gravity * dt * gravityVec.x;
        player.vy += physics.gravity * dt * gravityVec.y;

        //friction
        player.vx *= physics.friction;

        //limit overall movement for 1 frame
        let maxMove = player.colRad;
        if (lines.getLength({ x: player.vx, y: player.vy }) > maxMove) {
            let nv = lines.normalize({ x: player.vx, y: player.vy });
            player.vx = nv.x * maxMove;
            player.vy = nv.y * maxMove;
        }

        // Move
        player.y += player.vy;
        player.x += player.vx;

        let vLength = lines.getLength({ x: player.vx, y: player.vy });

        //check wall collision
        let newX = player.x;
        let newY = player.y;

        // canJump = false;

        let moveBack = level.checkCol(player.x + player.colOffsetX, player.y + player.colOffsetY, player.colRad, gravityVec);
        let iterations = 0;
        while (moveBack && (moveBack.x != 0 || moveBack.y != 0) && iterations < 30) {

            iterations++;

            player.x += moveBack.x;
            player.y += moveBack.y;

            if (moveBack.isFloor) {
                player.vy = 0;
                player.canJump = true;
            }

            moveBack = level.checkCol(player.x + player.colOffsetX, player.y + player.colOffsetY, player.colRad, gravityVec);
        }

        // x = newX;
        // y = newY;

        //zoom center
        canvas.center(player.x, player.y);

        //mouse aim
        player.aim = Math.atan2(mouse.y - (player.y + player.gunOffsetY), mouse.x - (player.x + player.gunOffsetX));

        //shoot
        if (mouse.leftClick && player.recoil <= 0) {
            projectiles.shootLaser(player.x + player.gunOffsetX, player.y + player.gunOffsetY, player.aim);
            player.recoil = player.RECOIL_TIME;
        } else {
            player.recoil -= 1
        }
    }
}