import { ctx } from "./canvas.js";

export function getLine(x1, y1, x2, y2) {
  var m = (y2 - y1) / (x2 - x1);
  var b = y1 - m * x1;
  var midX = x1 + (x2 - x1) / 2;
  var midY = y1 + (y2 - y1) / 2;
  var normal = {
    x: -(y2 - y1),
    y: x2 - x1
  };
  var vec = {
    x: x2 - x1,
    y: y2 - y1
  };
  normal = normalize(normal);
  return {
    x1,
    y1,
    x2,
    y2,
    m,
    b,
    normal,
    midX,
    midY,
    vec
  };
}

// x = (y-b) / m
function getX(line, y) {
  return y - line.b / line.m;
}

// y = mx + b
function getY(line, x) {
  return line.m * x + line.b;
}

function getOrthogonal(vec) {
  return {
    x: -vec.y,
    y: vec.x
  };
}

export function normalize(vec) {
  var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  if (len) {
    return {
      x: vec.x / len,
      y: vec.y / len
    };
  } else {
    return {
      x: 0,
      y: 0
    };
  }
}

function getVec(line) {
  return {
    x: line.x2 - line.x1,
    y: line.y2 - line.y1
  };
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

export function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function getProj(v1, v2) {
  var a = getVec(v1);
  var b = getVec(v2);
  var dp = dotProduct(a, b);
  var x = dp / (b.x * b.x + b.y * b.y) * b.x;
  var y = dp / (b.x * b.x + b.y * b.y) * b.y;

  //   var proj = getLine(v2.x1, v2.y1, v2.x1 + x, v2.y1 + y);
  var proj = getLine(0, 0, x, y);
  return proj;
}

export function drawLine(line, color, width) {
  if (color) ctx.strokeStyle = color;
  if (width) ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
}

export function drawPoint(p, color, width) {
  if (color) ctx.strokeStyle = color;
  if (width) ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
  ctx.stroke();
}

function drawVec(vec, x, y, line, color, width) {
  if (color) ctx.strokeStyle = color;
  if (width) ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + vec.x, y + vec.y);
  ctx.stroke();
}

function isAbove(line, x, y) {
  return getX(line, y) <= x;
}

export function getLength(vec) {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

export function getIntersection(line1, line2) {
  //lines ar orthogonal
  if (line1.m === Infinity && line2.m === 0) {
    var l = line1;
    line1 = line2;
    line2 = l;
  }

  if (line1.m === 0 && line2.m === Infinity) {
    var intersectX = line2.x1;
    var intersectY = line1.y1;
    if (
      ((intersectY < line2.y2 && intersectY >= line2.y1) ||
        (intersectY > line2.y2 && intersectY <= line2.y1)) &&
      ((intersectX > line1.x1 && intersectX <= line1.x2) ||
        (intersectX < line1.x1 && intersectX >= line1.x2))
    ) {
      return {
        x: intersectX,
        y: intersectY
      };
    }
    return null;
  }

  if (line1.m === -Infinity && line2.m === 0) {
    var l = line1;
    line1 = line2;
    line2 = l;
  }

  if (line1.m === 0 && line2.m === -Infinity) {
    var intersectX = line2.x1;
    var intersectY = line1.y1;
    if (
      ((intersectY < line2.y2 && intersectY >= line2.y1) ||
        (intersectY > line2.y2 && intersectY <= line2.y1)) &&
      ((intersectX > line1.x1 && intersectX <= line1.x2) ||
        (intersectX < line1.x1 && intersectX >= line1.x2))
    ) {
      return {
        x: intersectX,
        y: intersectY
      };
    }
    return null;
  }

  var a1 = line1.y2 - line1.y1;
  var b1 = line1.x1 - line1.x2;
  var c1 = a1 * line1.x1 + b1 * line1.y1;

  var a2 = line2.y2 - line2.y1;
  var b2 = line2.x1 - line2.x2;
  var c2 = a2 * line2.x1 + b2 * line2.y1;

  var denominator = a1 * b2 - b1 * a2;
  if (denominator === 0) return false;

  var intersectX = (b2 * c1 - b1 * c2) / denominator;
  var intersectY = (a1 * c2 - a2 * c1) / denominator;

  if (
    ((intersectX >= line1.x1 && intersectX <= line1.x2) ||
      (intersectX <= line1.x1 && intersectX >= line1.x2)) &&
    ((intersectX >= line2.x1 && intersectX <= line2.x2) ||
      (intersectX <= line2.x1 && intersectX >= line2.x2))
  ) {
    return {
      x: intersectX,
      y: intersectY
    };
  }
  return null;
}