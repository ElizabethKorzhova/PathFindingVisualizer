import {isInRange, steps, sleep, getDistance} from "./utils";
import PriorityQueue from "js-priority-queue";

const comparatorDijkstra = (grid) => (p1, p2) => grid[p1.y][p1.x].cost - grid[p2.y][p2.x].cost
const comparatorAStart = (grid, end) => (p1, p2) => grid[p1.y][p1.x].cost - grid[p2.y][p2.x].cost +
                                        getDistance(p1, end) - getDistance(p2, end);

const DijkstraAndA = async (initialGrid, start, end, weights, weightCost, changeCellVisited, name, speed) => {
    const grid = initialGrid.map(el => el.map(val => ({val, cost: Infinity})));
    grid[start.y][start.x].cost = 0;
    const xMax = grid[0].length - 1;
    const yMax = grid.length - 1;
    const comparator = name === "dijkstra" ? comparatorDijkstra(grid) : comparatorAStart(grid, end);
    const frontier = new PriorityQueue({comparator});
    frontier.queue({...start, prev: null})
    const delay = Math.floor(100 / speed);

    while (frontier.length) {
        const current = frontier.dequeue()
        await sleep(delay);
        changeCellVisited(current.y, current.x, "visited");
        for (let step of steps) {
            const newPoint = {x: current.x + step.x, y: current.y + step.y}
            if (isInRange(newPoint, 0, 0, xMax, yMax) &&
                grid[newPoint.y][newPoint.x].val !== 1) {
                const cell = grid[newPoint.y][newPoint.x]
                const cellCost = weights.find(w => w.y === newPoint.y && w.x === newPoint.x) ? weightCost : 1;
                const newCost = cellCost + grid[current.y][current.x].cost;
                if (newCost < cell.cost) {
                    cell.cost = newCost;
                    await sleep(delay);
                    changeCellVisited(newPoint.y, newPoint.x, "queued");
                    newPoint.prev = current;
                    if (newPoint.y === end.y && newPoint.x === end.x) {
                        const path = [newPoint];
                        while (path[0].prev) path.unshift(path[0].prev);
                        for (let node of path) {
                            await sleep(delay);
                            changeCellVisited(node.y, node.x, "path");
                        }
                        return path.length;
                    }
                    frontier.queue(newPoint);
                }
            }
        }
    }
    return false;
};

export default DijkstraAndA;