export var ctx;

export var width, height;

export function clearCanvas() {
    // ctx.fillStyle = 'black';
    ctx.fillStyle = '#000000ff';
    ctx.fillRect(0, 0, width, height);
}

function init() {
    let canvas = document.getElementById("canvas");
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext("2d");
}

init();