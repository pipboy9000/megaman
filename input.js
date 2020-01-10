export const mouse = {
    x: 0, y: 0, dx: 0, dy: 0, leftClick: false, rightClick: false
}

export const keyboard = {};

export const direction = {
    LEFT: "left",
    RIGHT: "right",
    UP: "up"
};

function onMouseMove(e) {

    var rect = canvas.getBoundingClientRect();

    let x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    let y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

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
    switch (event.key) {
        case "ArrowUp":
        case "w":
            result = direction.UP;
            break;
        case "ArrowLeft":
        case "a":
            result = direction.LEFT;
            break;
        case "ArrowRight":
        case "d":
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