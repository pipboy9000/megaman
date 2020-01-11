export var ctx;

export var width, height, halfWidth, halfHeight;

var camPosX = 0;
var targetCamPosX = 0;

var camPosY = 0;
var targetCamPosY = 0;

export function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(-halfWidth + camPosX, -halfHeight + camPosY, width, height);
}

export function center(x, y) {
    targetCamPosX = x;
    targetCamPosY = y;
}

export function draw() {
    camPosX += (targetCamPosX - camPosX) / 5;
    camPosY += (targetCamPosY - camPosY) / 5;

    ctx.setTransform(
        1,
        0,
        0,
        1,
        -camPosX + halfWidth,
        -camPosY + halfHeight
    );
}

function init() {
    let canvas = document.getElementById("canvas");
    width = canvas.width;
    height = canvas.height;
    halfWidth = canvas.width / 2;
    halfHeight = canvas.height / 2;
    ctx = canvas.getContext("2d");
}

init();