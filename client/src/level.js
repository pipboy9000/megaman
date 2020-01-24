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
        x1: 700,
        y1: 300,
        x2: 500,
        y2: 500,
    },
    {
        x1: 100,
        y1: 600,
        x2: -500,
        y2: 500,
    },
    // {
    //     x1: 1000,
    //     y1: 300,
    //     x2: 200,
    //     y2: 600,
    // },
    // {
    //     x1: 200,
    //     y1: 600,
    //     x2: -1000,
    //     y2: 300,
    // },
    // {
    //     x1: -100,
    //     y1: 600,
    //     x2: 100,
    //     y2: 300,
    // }
];

// gravity vector is used to determine if the wall we hit is considered a floor
export function checkCol(x, y, rad, gravityVec) {

    // var dp;
    var radSqr = rad * rad;
    var colLine;
    var colPoint;
    var colPoints = [];
    var res = { x: 0, y: 0, isFloor: false };

    //check walls first
    // for (let i = 0; i < walls.length; i++) {
    //     let wall = walls[i];

    walls.forEach(wall => {

        //line from the center of the player perpendicular to the current wall with length of rad
        colLine = lines.getLine(
            x,
            y,
            x + -wall.normal.x * rad,
            y + -wall.normal.y * rad
        );

        colPoint = lines.getIntersection(wall, colLine);

        //is this line intersects with a wall?
        if (colPoint) {

            let dp = lines.dotProduct(wall.normal, gravityVec);

            //is this wall a floor?
            if (dp < -0.85) {

                //to calculate next position we need to make a new line from colLine.x2,colLine.x2 in the opposite direction of gravity
                //make sure gravity vec is normalized
                let newColLine = lines.getLine(colLine.x2, colLine.y2, colLine.x2 + (-gravityVec.x * rad), colLine.y2 + (-gravityVec.y * rad))
                let newColPoint = lines.getIntersection(wall, newColLine);

                if (newColPoint) {
                    var moveBackX = newColPoint.x - newColLine.x1;
                    var moveBackY = newColPoint.y - newColLine.y1;

                    res.isFloor = true;

                    colPoints.push({
                        x: moveBackX,
                        y: moveBackY
                    });
                }

            } else {

                var moveBackX = colPoint.x - colLine.x2;
                var moveBackY = colPoint.y - colLine.y2;

                colPoints.push({
                    x: moveBackX,
                    y: moveBackY
                });
            }
        }
    });

    //check vertices
    // for (let i = 0; i < walls.length; i++) {
    //  let wall = walls[i];
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