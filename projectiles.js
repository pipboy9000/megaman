const lasers = [];

function initLasers() {
    for (var i = 0; i < 10; i++) {
        lasers[i] = {
            active: false,
            x: 0,
            y: 0,
            dir: 0,
            age: 0
        }
    }
}

function getLaser() {
    return lasers.find(laser => {
        return !laser.active
    })
}

function shootLaser(x, y, dir) {
    let l = getLaser();
    if (l) {
        l.x = x;
        l.y = y;
        l.dir = dir;
        l.age = 0
    }
}

export { test };

