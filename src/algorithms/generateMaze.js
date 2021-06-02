import {steps, isInRange} from "./utils";

const generateMaze = (sizeX, sizeY) => {
  const arr = [];
  for (let i = 0; i < sizeY; i++) {
    arr.push([]);
    for (let j = 0; j < sizeX; j++) {
      arr[i].push(Math.floor(Math.random() * 2));
    }
  }
  console.log(sizeX, sizeY)
  console.log(arr.length, arr[0].length);
  const start = {x: Math.floor(Math.random() * sizeX / 2), y: Math.floor(Math.random() * sizeY / 2)};
  const end = {x: Math.floor((Math.random() + 1) * sizeX / 2), y: Math.floor((Math.random() + 1) * sizeY / 2)};

  const path = [start];
  const stepsCount = steps.length;
  let current = start;
  arr[start.y][start.x] = 0;
  let percent = 0.75;
  while (current.x !== end.x || current.y !== end.y) {
    let index;
    if (Math.random() > percent) index = Math.floor(Math.random() * stepsCount);
    else {
      const offsetX = Math.sign(end.x - current.x);
      const offsetY = Math.sign(end.y - current.y);
      if (Math.random() > 0.5) index = steps.indexOf(steps.find(el => el.x === offsetX))
      else index = steps.indexOf(steps.find(el => el.y === offsetY))
    }
    const newNode = {x: current.x + steps[index].x, y: current.y + steps[index].y};
    if (isInRange(newNode, 0, 0, sizeX - 1, sizeY - 1) && !path.find(el => el.x === newNode.x && el.y === newNode.y)) {
      path.push(newNode);
      arr[newNode.y][newNode.x] = 0;
      current = newNode;
    }
    percent += 0.02;
  }

  return [arr, start, end];
};


export default generateMaze;