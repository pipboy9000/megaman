let ctx;

let width, height;

let lastFrame = performance.now();

const direction = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up"
}

const physics = {
    acceleration: 0.4,
    friction: 0.9,
    gravity: 2,
    initialJumpSpeed: -30
}

const sprites = createSprites();
const NUM_SPRITES_STANDING = 3;
const NUM_SPRITES_RUNNING = 11;
const NUM_SPRITES_JUMPING = 7;
const ANIMATION_SPEED = 15; // How much vx it takes to go to the next frame

let input = {};

let megaman = {
    animationCounter: 0,
    width: 40,
    height: 46,
    spriteDirection: direction.RIGHT,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    canJump: false
}

function move(dt) {

    // Choose sprite (don't care what happens if both left and right are pressed)
    if (input[direction.RIGHT]) {
        megaman.spriteDirection = direction.RIGHT;
    } else if (input[direction.LEFT]) {
        megaman.spriteDirection = direction.LEFT;
    }

    // Jump
    if (input[direction.UP] && megaman.canJump) {
        megaman.canJump = false;
        megaman.vy = physics.initialJumpSpeed;
    }

    // Add acceleration
    megaman.vx += input[direction.RIGHT] ? physics.acceleration * dt : 0;
    megaman.vx -= input[direction.LEFT] ? physics.acceleration * dt : 0;

    // Add friction
    megaman.vx *= physics.friction;

    // Move
    megaman.y += megaman.vy;
    megaman.x += megaman.vx;

    // Handle gravity/landing
    if (megaman.y + megaman.height < height) { // midair
        megaman.vy += physics.gravity * dt; // gravity
    } else { // on the ground
        megaman.vy = 0;
        megaman.y = height - megaman.height;
        megaman.canJump = true;
    }
}

function draw() {
    let row, column; // of the relevant sprite in the spritesheet
                     // Row 0: standing, row 1: running, row 2: jumping

    // Calculate row/column + update animationCounter if applicable
    if (megaman.canJump) { // player is on the ground
        let numSprites;
        if (input[direction.LEFT] || input[direction.RIGHT]) { // running
            megaman.animationCounter += Math.abs(megaman.vx);
            row = 1;
            numSprites = NUM_SPRITES_RUNNING;
        } else { // standing
            megaman.animationCounter++;
            row = 0;
            numSprites = NUM_SPRITES_STANDING;
        }
        column = Math.floor((megaman.animationCounter / ANIMATION_SPEED) % numSprites);
    } else { // player is in the air
        row = 2;
        column = Math.min(Math.floor((megaman.vy - physics.initialJumpSpeed) / (-2 * physics.initialJumpSpeed / NUM_SPRITES_JUMPING)), NUM_SPRITES_JUMPING - 1);
    }

    // Draw
    clearCanvas();
    ctx.drawImage(sprites[megaman.spriteDirection], column * megaman.width, row * megaman.height, megaman.width, megaman.height, megaman.x, megaman.y, megaman.width, megaman.height);
}

function clearCanvas() {
    // ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
}

function initInput() {
    document.addEventListener('keydown', keyHandler(true));
    document.addEventListener('keyup', keyHandler(false));
}

function gameLoop(time) {

    // Calculate delta time
    let dt = time - lastFrame;
    lastFrame = time;

    // Normalize
    dt /= 16;

    move(dt);
    draw();

    window.requestAnimationFrame(gameLoop);
}

function init() {
    let canvas = document.getElementById('canvas');
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext('2d');
    initInput();
    clearCanvas();
    gameLoop(lastFrame);
}

function makeImage(src) {
    let result = new Image();
    result.src = src;
    return result;
}

function createSprites() {
    let result = {};
    result[direction.LEFT] = makeImage('spritesheet_left.png');
    result[direction.RIGHT] = makeImage('spritesheet_right.png');
    return result;
}

function keyEventToDirection(event) {
    let result;
    switch(event.key) {
        case "ArrowUp":
            result = direction.UP;
            break;
        case "ArrowLeft":
            result = direction.LEFT;
            break;
        case "ArrowRight":
            result = direction.RIGHT;
            break;
    }
    return result;
}

function keyHandler(state) {
    return event => {
        let direction = keyEventToDirection(event);
        if (direction) {
            input[direction] = state;
        }
    }
}