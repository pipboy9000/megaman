import { camPosX, camPosY, halfWidth, halfHeight } from './canvas.js';

export const mouse = {
    x: 0, y: 0, dx: 0, dy: 0, leftClick: false, rightClick: false, screenX: 0, screenY: 0
}

export const keyboard = {};

export const direction = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up"
};

function onMouseMove(e) {

    let rect = canvas.getBoundingClientRect();

    mouse.screenX = ((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
    mouse.screenY = ((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)

    let x = mouse.screenX + camPosX - halfWidth;
    let y = mouse.screenY + camPosY - halfHeight;

    mouse.dx = x - mouse.x;
    mouse.dy = y - mouse.y;
    mouse.x = x;
    mouse.y = y;
}

function onMouseDown(event) {
    switch (event.which) {
        case 1:
            mouse.leftClick = true;
            break;
        case 3:
            mouse.rightClick = true;
            break;
    }
}

function onMouseUp(event) {
    switch (event.which) {
        case 1:
            mouse.leftClick = false;
            break;
        case 3:
            mouse.rightClick = false;
            break;
    }
}

function keyEventToDirection(event) {
    let result;
    switch (event.code) {
        case "ArrowUp":
        case "KeyW":
            result = direction.UP;
            break;
        case "ArrowLeft":
        case "KeyA":
            result = direction.LEFT;
            break;
        case "ArrowRight":
        case "KeyD":
            result = direction.RIGHT;
            break;
    }
    return result;
}

function keyHandler(event) {
    let direction = keyEventToDirection(event);
    if (direction) {
        keyboard[direction] = event.type === "keydown";
    }
}

function init() {
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("keyup", keyHandler);
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("mouseup", onMouseUp)
}

init();