import {isInRange, steps} from "./utils";

export default (initialGrid, start, end, changeCellVisited, speed) => {
    const grid = initialGrid.map(el => el.map(val => ({val})));
    const xMax = grid[0].length - 1;
    const yMax = grid.length - 1;
    const delay = Math.floor(100 / speed);
    let counter = 0;
    let queue = [{...start, prev: null, visited: true}];
    setTimeout(() => changeCellVisited(start.y, start.x, "visited"), counter * delay);
    while (queue.length) {
        const current = queue[queue.length - 1];
        if (current.color === "black") {
            queue.pop();
            continue;
        }
        current.color = "black";
        const {x, y} = current;
        for (let step of steps) {
            const newPoint = {x: x + step.x, y: y + step.y, prev: current};
            if (isInRange(newPoint, 0, 0, xMax, yMax) &&
                grid[newPoint.y][newPoint.x].val !== 1 &&
                !grid[newPoint.y][newPoint.x].visited) {
                setTimeout(() => changeCellVisited(newPoint.y, newPoint.x, "visited"), counter * delay);
                if (newPoint.x !== end.x || newPoint.y !== end.y) {
                    grid[newPoint.y][newPoint.x].visited = true;
                    counter++;
                    queue.push(newPoint);
                    current.color = "gray";
                    break;
                } else {
                    const path = [newPoint];
                    while (path[0].prev) path.unshift(path[0].prev)
                    for (let node of path) {
                        counter++;
                        setTimeout(() => changeCellVisited(node.y, node.x, "path"), counter * delay);
                    }
                    return path.length;
                }
            }
        }
    }
    return false;
}