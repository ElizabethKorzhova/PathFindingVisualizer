import {isInRange, steps, sleep, getDistance} from "./utils";
import PriorityQueue from "js-priority-queue";

const comparator = (end) => (a, b) => getDistance(a, end) - getDistance(b, end);

const GBFS = async (initialGrid, start, end, changeCellVisited, speed) => {
    const grid = initialGrid.map(el => el.map(val => ({val, visited: false})));
    const frontier = new PriorityQueue({comparator: comparator(end)});
    const xMax = grid[0].length - 1;
    const yMax = grid.length - 1;
    const delay = Math.floor(100 / speed);
    frontier.queue({...start, prev: null});
    grid[start.y][start.x].visited = true;
    changeCellVisited(start.y, start.x, "visited");
    while (frontier.length) {
        const current = frontier.dequeue()
        for (let step of steps) {
            const newPoint = {x: current.x + step.x, y: current.y + step.y, prev: current}
            if (isInRange(newPoint, 0, 0, xMax, yMax) &&
                grid[newPoint.y][newPoint.x].val !== 1) {
                const cell = grid[newPoint.y][newPoint.x];
                if (cell.visited === false) {
                    frontier.queue(newPoint);
                    cell.visited = true;
                    await sleep(delay);
                    changeCellVisited(newPoint.y, newPoint.x, "visited");
                    if (!getDistance(newPoint, end)) {
                        const path = [newPoint];
                        while (path[0].prev) path.unshift(path[0].prev);
                        for (let node of path) {
                            await sleep(delay);
                            changeCellVisited(node.y, node.x, "path");
                        }
                        return path.length;
                    }
                }
            }
        }
    }
    return false;
};

export default GBFS;