import {isInRange, steps, sleep} from "./utils";

const BFS = async (initialGrid, start, end, changeCellVisited) => {
    const grid = initialGrid.map(el => el.map(val => ({val})));
    const xMax = grid[0].length - 1;
    const yMax = grid.length - 1;
    const delay = 20;
    let queue = [{...start, prev: null, visited: true}];
    await sleep(delay);
    changeCellVisited(start.y, start.x, "visited");
    while (queue.length) {
        const current = queue.shift();
        const {x, y} = current;
        for (let step of steps) {
            const newPoint = {x: x + step.x, y: y + step.y, prev: current};
            if (isInRange(newPoint, 0, 0, xMax, yMax) &&
                grid[newPoint.y][newPoint.x].val !== 1 &&
                !grid[newPoint.y][newPoint.x].visited) {
                await sleep(delay);
                changeCellVisited(newPoint.y, newPoint.x, "visited");
                if (newPoint.x !== end.x || newPoint.y !== end.y) {
                    grid[newPoint.y][newPoint.x].visited = true;
                    queue.push(newPoint);
                } else {
                    const path = [newPoint];
                    while (path[0].prev) path.unshift(path[0].prev)
                    for (let node of path) {
                        await sleep(delay);
                        changeCellVisited(node.y, node.x, "path");
                    }
                    return;
                }

            }
        }
    }
};

export default BFS;
