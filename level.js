import { ctx } from './canvas.js';
import * as lines from './lines.js';

var walls = [
    {
        x1: 350,
        y1: 500,
        x2: 250,
        y2: 500,
    },
    {
        x1: 250,
        y1: 500,
        x2: 300,
        y2: 550,
    },
    {
        x1: 300,
        y1: 550,
        x2: 350,
        y2: 500,
    },
    {
        x1: 500,
        y1: 500,
        x2: 100,
        y2: 600,
    },
    {
        x1: 600,
        y1: 600,
        x2: 0,
        y2: 600,
    },
    {
        x1: 700,
        y1: 300,
        x2: 500,
        y2: 500,
    },
    {
        x1: 1000,
        y1: 300,
        x2: 200,
        y2: 600,
    },
    {
        x1: 200,
        y1: 600,
        x2: -1000,
        y2: 300,
    },
    {
        x1: -100,
        y1: 600,
        x2: 100,
        y2: 300,
    }
];

export function checkCol(x, y, vx, vy, rad) {
    // var dp;
    var radSqr = rad * rad;
    var colLine;
    var n = lines.normalize({
        x: vx,
        y: vy
    }); //normalized vx,vy
    var colPoint;
    var colPoints = [];
    var res = { x: 0, y: 0 };

    //check walls first
    walls.forEach(wall => {
        colLine = lines.getLine(
            x,
            y,
            x + -wall.normal.x * rad,
            y + -wall.normal.y * rad
        );

        colPoint = lines.getIntersection(wall, colLine);
        if (colPoint) {
            lines.drawPoint(colPoint);
            var moveBackX = colPoint.x - colLine.x2;
            var moveBackY = colPoint.y - colLine.y2;
            colPoints.push({
                x: moveBackX,
                y: moveBackY
            });
        }
    });

    if (colPoints.length > 0) {
        colPoints.forEach(p => {
            res.x += p.x;
            res.y += p.y;
        });
        return res;
    }

    //check vertices
    walls.forEach(wall => {
        var dx = wall.x1 - x;
        var dy = wall.y1 - y;

        if (dx * dx + dy * dy <= radSqr) {
            lines.drawPoint({ x: wall.x1, y: wall.y1 }, "red", 3);
            var l = lines.normalize({ x: dx, y: dy });
            l.x *= rad;
            l.y *= rad;
            colPoints.push({
                x: dx - l.x,
                y: dy - l.y
            });
        }
    });

    if (colPoints.length > 0) {
        colPoints.forEach(p => {
            res.x += p.x;
            res.y += p.y;
        });
    }
    return res;
}

export function draw() {
    walls.forEach(wall => {
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();

        //normal
        ctx.beginPath();
        ctx.moveTo(wall.midX, wall.midY);
        ctx.lineTo(
            wall.midX + wall.normal.x * 20,
            wall.midY + wall.normal.y * 20
        );
        ctx.stroke();
    });
}

function init() {
    walls = walls.map(wall => {
        return lines.getLine(
            wall.x1,
            wall.y1,
            wall.x2,
            wall.y2
        );
    });
}

init();