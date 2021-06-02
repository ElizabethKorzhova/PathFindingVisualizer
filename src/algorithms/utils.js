export const isInRange = (point, xMin, yMin, xMax, yMax) => {
    const {x, y} = point;
    return xMin <= x && x <= xMax && yMin <= y && y <= yMax;
};

export const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const steps = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};