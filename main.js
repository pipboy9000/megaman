var canvas;
var ctx;

const FPS = 10;
var interval = 1000 / FPS;
var width, height;

var lastFrame = performance.now();

var sheetRight = new Image();
sheetRight.src = 'spritesheet_right.png';

var sheetLeft = new Image();
sheetLeft.src = 'spritesheet_left.png';

var input = {
    37: false, //right
    39: false, //left
    38: false //up
}

var megaman = {
    animationCounter: 0,
    width: 40,
    height: 46,
    direction: true, //true = right, false = left
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    canJump: false
}

//move
function move(dt) {

    if (input[39])
        megaman.direction = true;

    if (input[37])
        megaman.direction = false;

    megaman.vx += input[39] ? 2 * dt : 0;
    megaman.vx -= input[37] ? 2 * dt : 0;

    if (input[38] && megaman.canJump) {
        megaman.canJump = false;
        megaman.vy = -30;
    }

    //friction
    megaman.vx *= 0.80;
    megaman.vy *= 0.995;

    //move
    megaman.y += megaman.vy;
    megaman.x += megaman.vx;

    //midair
    if (megaman.y + megaman.height < (height)) {
        megaman.vy += 1.5 * dt;
    } else {
        megaman.vy = 0;
        megaman.y = height - megaman.height;
        megaman.canJump = true;
    }
}

//draw
function draw() {

    clearCanvas()

    var sheet = megaman.direction ? sheetRight : sheetLeft;
    var frame;

    if (megaman.canJump && (input[37] || input[39])) { //player is on the ground running
        var move = Math.abs(megaman.vx);
        megaman.animationCounter += move;
        frame = Math.round((megaman.animationCounter / 30) % 10);
        ctx.drawImage(sheet, frame * 40, 46, 40, 46, megaman.x, megaman.y, 40, 46);

    } else if (megaman.canJump) { //on the ground standing
        megaman.animationCounter += 0.01
        frame = Math.round((megaman.animationCounter) % 2);
        ctx.drawImage(sheet, frame * 40, 0, 40, 46, megaman.x, megaman.y, 40, 46);

    } else { //jumping
        if (megaman.vy < 0) { //going up
            var frame = 2 - Math.round(megaman.vy / -30 * 2);
            ctx.drawImage(sheet, frame * 40, 92, 40, 46, megaman.x, megaman.y, 40, 46);

        } else { //going down
            if (megaman.vy < 5) {
                frame = 2
            } else {
                frame = Math.round(((megaman.vy - 5) / 25) * 2) + 3;
            }
            ctx.drawImage(sheet, frame * 40, 92, 40, 46, megaman.x, megaman.y, 40, 46);
        }
    }
}

//clear canvas
function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
}

function initInput() {
    document.addEventListener('keydown', function (event) {
        input[event.keyCode] = true;
    });

    document.addEventListener('keyup', function (event) {
        input[event.keyCode] = false;
    });
}

function gameLoop(time) {

    //calculate delta time
    var dt = time - lastFrame
    lastFrame = time;

    dt /= 16; //normalize

    move(dt);

    draw();

    window.requestAnimationFrame(gameLoop)
}

function init() {
    canvas = document.getElementById('canvas');
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 600, 600);

    initInput();

    gameLoop();
}

