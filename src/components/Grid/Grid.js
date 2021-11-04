import React, {useCallback, useEffect, useState} from "react";
import styles from "./Grid.module.css";
import Cell from "../Cell/Cell";
import BFS from "../../algorithms/bfs";
import DFS from "../../algorithms/dfs";
import GBFS from "../../algorithms/gbfs";
import DijkstraAndAStar from "../../algorithms/dijkstraAndA*";
import Header from "../Header/Header";
import generateMaze from "../../algorithms/generateMaze";
import throttle from 'lodash.throttle';

const initialArr = [];
const availableWidth = window.innerWidth - 360;
const availableHeight = window.innerHeight - 180
const n = Math.ceil(availableHeight / 30);
const m = Math.ceil(availableWidth / 30);
for (let i = 0; i < n; i++) {
  initialArr.push(new Array(m).fill(0));
}

const cellTypes = {
  cell: 0,
  wall: 1,
  queued: 3,
  visited: 4,
  path: 5,
}

const initialStart = {x: 10, y: 5}
const initialEnd = {x: 10, y: 10}


const Grid = () => {
  const [arr, setArr] = useState(initialArr);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [chosenAlgorithm, setChosenAlgorithm] = useState("gbfs");
  const [cellSettingType, setCellSettingType] = useState("cell");
  const [visualizeButtonDisabled, setVisualizeButtonDisabled] = useState(false);
  const [weights, setWeights] = useState([]);
  const [weightCost, setWeightCost] = useState(3);
  const [mouseClicked, setMouseClicked] = useState(false);
  const [pathLengthMessage, setPathLengthMessage] = useState("Start visualization");
  const [speed, setSpeed] = useState(5);
  const [gridStyles, setGridStyles] = useState({
    gridTemplateColumns: new Array(m).fill(1).map(() => "30px").join(" ")
  });
  const [xSize, setXSize] = useState(m);
  const [ySize, setYSize] = useState(n);
  useEffect(() => {
    const newArr = [];
    for (let i = 0; i < ySize; i++) {
      newArr.push(new Array(xSize).fill(0));
    }
    setArr(newArr);
    const newStart = {x: Math.min(start.x, xSize - 1), y: Math.min(start.y, ySize - 1)};
    setStart(newStart);
    const newEnd = {x: Math.min(end.x, xSize - 1), y: Math.min(end.y, ySize - 1)};
    if (newEnd.x === newStart.x && newEnd.y === newStart.y) setEnd({x: newStart.x - 1, y: newStart.y});
    else setEnd(newEnd);
    setGridStyles({
      gridTemplateColumns: new Array(xSize).fill(1).map(() => "30px").join(" ")
    });
  }, [xSize, ySize]);
  const onCellClick = (rowIndex, columnIndex, type = "wall") => {
    setArr(prevArr => prevArr.map((row, i) =>
      row.map((el, j) => {
        if (rowIndex === i && columnIndex === j) {
          if (type === "queued") return cellTypes.queued;
          if (type === "visited") return cellTypes.visited;
          if (type === "path") return cellTypes.path;
          if (cellSettingType === "start") {
            setStart({x: j, y: i});
            resetSetting();
            return cellTypes.cell;
          }
          if (cellSettingType === "end") {
            setEnd({x: j, y: i});
            resetSetting();
            return cellTypes.cell;
          }
          if (cellSettingType === "weight" || type === "weight") {
            setWeights(prevWeights => {
              const el = prevWeights.find(node => node.x === j && node.y === i);
              if (el) {
                const newWeights = [...prevWeights];
                newWeights.splice(newWeights.indexOf(el), 1);
                return newWeights;
              }
              return [...prevWeights, {x: j, y: i}]
            });
            return cellTypes.cell;
          }
          if (el === cellTypes.wall) return cellTypes.cell;
          if ((i !== start.y || j !== start.x) && (i !== end.x || j !== end.y))
            return cellTypes.wall;
          return el;
        } else {
          return el;
        }
      })))
  };

  const removeVisualizationFromGrid = () => {
    setArr(prevArr => prevArr.map((row) =>
      row.map((el) => {
        if (el === cellTypes.visited || el === cellTypes.path || el === cellTypes.queued) return cellTypes.cell;
        return el;
      }))
    );
  };

  const clearField = () => {
    setWeights([]);
    setArr(prevArr => prevArr.map((row) =>
      row.map(() => {
        return cellTypes.cell;
      }))
    );
  };

  const resetSetting = () => {
    setCellSettingType("wall")
  };

  const visualizeButtonClickHandler = async () => {
    setVisualizeButtonDisabled(true);
    removeVisualizationFromGrid();
    let pathLength = 0;
    switch (chosenAlgorithm) {
      case "bfs":
        pathLength = await BFS(arr, start, end, onCellClick, speed);
        break;
      case "dfs":
        pathLength = await DFS(arr, start, end, onCellClick, speed);
        break;
      case "dijkstra":
      case "astar":
        pathLength = await DijkstraAndAStar(arr, start, end, weights, weightCost, onCellClick, chosenAlgorithm, speed);
        break;
      case "gbfs":
        pathLength = await GBFS(arr, start, end, onCellClick, speed);
        break;
      default:
        break;
    }
    if (pathLength) setPathLengthMessage(`Length: ${pathLength}`);
    else setPathLengthMessage("There is no path");
    setVisualizeButtonDisabled(false);
  };

  const genMaze = throttle(() => {
    clearField();
    const func = chosenAlgorithm === "dijkstra" || chosenAlgorithm === "astar" ? onCellClick : null;
    const maze = generateMaze(xSize, ySize, func);
    setArr(maze[0]);
    setStart(maze[1]);
    setEnd(maze[2]);
  }, 2000);
  const onGenerateMaze = useCallback(genMaze, [xSize, ySize]);

  return (
    <div>
      <Header/>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <button
                type="button"
                className={`${styles.button} ${cellSettingType === "start" && styles.activeButton}`}
                onClick={() => setCellSettingType("start")}>
                <svg width="32" height="30" viewBox="0 0 32 30" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0)">
                    <path
                      d="M15.6125 6.75C15.0949 6.75 14.5985 6.55246 14.2325 6.20083C13.8666 5.84919 13.6609 5.37228 13.6609 4.875V1.875C13.6609 1.37772 13.8666 0.900806 14.2325 0.549175C14.5985 0.197544 15.0949 0 15.6125 0C16.1301 0 16.6265 0.197544 16.9925 0.549175C17.3585 0.900806 17.5641 1.37772 17.5641 1.875V4.875C17.5641 5.37228 17.3585 5.84919 16.9925 6.20083C16.6265 6.55246 16.1301 6.75 15.6125 6.75Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M21.6857 9.16496C21.5042 8.9913 21.3601 8.7849 21.2618 8.5576C21.1635 8.33031 21.1129 8.0866 21.1129 7.84046C21.1129 7.59432 21.1635 7.35061 21.2618 7.12332C21.3601 6.89602 21.5042 6.68962 21.6857 6.51596L23.8933 4.39196C24.2594 4.04028 24.7558 3.84271 25.2735 3.84271C25.7911 3.84271 26.2876 4.04028 26.6536 4.39196C27.0197 4.74364 27.2253 5.22061 27.2253 5.71796C27.2253 6.21531 27.0197 6.69228 26.6536 7.04396L24.4429 9.16496C24.2621 9.33939 24.0473 9.4778 23.8107 9.57224C23.5742 9.66668 23.3205 9.7153 23.0643 9.7153C22.8081 9.7153 22.5545 9.66668 22.3179 9.57224C22.0813 9.4778 21.8665 9.33939 21.6857 9.16496V9.16496Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M24.1993 15C24.1993 14.5027 24.405 14.0258 24.7709 13.6742C25.1369 13.3225 25.6333 13.125 26.1509 13.125H29.2734C29.791 13.125 30.2874 13.3225 30.6534 13.6742C31.0194 14.0258 31.225 14.5027 31.225 15C31.225 15.4973 31.0194 15.9742 30.6534 16.3258C30.2874 16.6775 29.791 16.875 29.2734 16.875H26.1509C25.6333 16.875 25.1369 16.6775 24.7709 16.3258C24.405 15.9742 24.1993 15.4973 24.1993 15Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M21.6857 20.835C21.8665 20.6606 22.0813 20.5222 22.3179 20.4277C22.5545 20.3333 22.8081 20.2847 23.0643 20.2847C23.3205 20.2847 23.5742 20.3333 23.8107 20.4277C24.0473 20.5222 24.2621 20.6606 24.4429 20.835L26.6536 22.956C27.0197 23.3077 27.2253 23.7847 27.2253 24.282C27.2253 24.7794 27.0197 25.2563 26.6536 25.608C26.2876 25.9597 25.7911 26.1573 25.2735 26.1573C24.7558 26.1573 24.2594 25.9597 23.8933 25.608L21.6857 23.484C21.5042 23.3104 21.3601 23.1039 21.2618 22.8767C21.1635 22.6494 21.1129 22.4056 21.1129 22.1595C21.1129 21.9134 21.1635 21.6697 21.2618 21.4424C21.3601 21.2151 21.5042 21.0087 21.6857 20.835V20.835Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M15.6125 23.25C16.1301 23.25 16.6265 23.4475 16.9925 23.7992C17.3585 24.1508 17.5641 24.6277 17.5641 25.125V28.125C17.5641 28.6223 17.3585 29.0992 16.9925 29.4508C16.6265 29.8025 16.1301 30 15.6125 30C15.0949 30 14.5985 29.8025 14.2325 29.4508C13.8666 29.0992 13.6609 28.6223 13.6609 28.125V25.125C13.6609 24.6277 13.8666 24.1508 14.2325 23.7992C14.5985 23.4475 15.0949 23.25 15.6125 23.25Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M9.5392 20.835C9.72075 21.0087 9.86482 21.2151 9.96311 21.4424C10.0614 21.6697 10.112 21.9134 10.112 22.1595C10.112 22.4056 10.0614 22.6494 9.96311 22.8767C9.86482 23.1039 9.72075 23.3104 9.5392 23.484L7.3316 25.608C6.96556 25.9597 6.46911 26.1573 5.95145 26.1573C5.4338 26.1573 4.93735 25.9597 4.57131 25.608C4.20527 25.2563 3.99963 24.7794 3.99963 24.282C3.99963 23.7847 4.20527 23.3077 4.57131 22.956L6.78204 20.835C6.96279 20.6606 7.17762 20.5222 7.41419 20.4277C7.65077 20.3333 7.90443 20.2847 8.16062 20.2847C8.41681 20.2847 8.67047 20.3333 8.90705 20.4277C9.14362 20.5222 9.35845 20.6606 9.5392 20.835V20.835Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M7.02562 15C7.02562 15.4973 6.82001 15.9742 6.45402 16.3258C6.08803 16.6775 5.59165 16.875 5.07406 16.875H1.95156C1.43397 16.875 0.937588 16.6775 0.571599 16.3258C0.20561 15.9742 0 15.4973 0 15C0 14.5027 0.20561 14.0258 0.571599 13.6742C0.937588 13.3225 1.43397 13.125 1.95156 13.125H5.07406C5.59165 13.125 6.08803 13.3225 6.45402 13.6742C6.82001 14.0258 7.02562 14.5027 7.02562 15Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M9.5392 9.16496C9.35845 9.33939 9.14362 9.4778 8.90705 9.57224C8.67047 9.66668 8.41681 9.7153 8.16062 9.7153C7.90443 9.7153 7.65077 9.66668 7.41419 9.57224C7.17762 9.4778 6.96279 9.33939 6.78204 9.16496L4.57131 7.04396C4.20527 6.69228 3.99963 6.21531 3.99963 5.71796C3.99963 5.22061 4.20527 4.74364 4.57131 4.39196C4.93735 4.04028 5.4338 3.84271 5.95145 3.84271C6.46911 3.84271 6.96556 4.04028 7.3316 4.39196L9.5392 6.51596C9.72075 6.68962 9.86482 6.89602 9.96311 7.12332C10.0614 7.35061 10.112 7.59432 10.112 7.84046C10.112 8.0866 10.0614 8.33031 9.96311 8.5576C9.86482 8.7849 9.72075 8.9913 9.5392 9.16496V9.16496Z"
                      fill={cellSettingType === "start" ? "#F191DC" : "#160F17"}/>
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect width="31.225" height="30" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                start
              </button>
            </li>
            <li>
              <button type="button" className={`${styles.button} ${cellSettingType === "end" && styles.activeButton}`}
                      onClick={() => setCellSettingType("end")}>
                <svg width="32" height="30" viewBox="0 0 32 30" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0)">
                    <path
                      d="M10.9288 15C10.9288 16.1935 11.4222 17.3381 12.3006 18.182C13.179 19.0259 14.3703 19.5 15.6125 19.5C16.8547 19.5 18.0461 19.0259 18.9244 18.182C19.8028 17.3381 20.2963 16.1935 20.2963 15C20.2963 13.8065 19.8028 12.6619 18.9244 11.818C18.0461 10.9741 16.8547 10.5 15.6125 10.5C14.3703 10.5 13.179 10.9741 12.3006 11.818C11.4222 12.6619 10.9288 13.8065 10.9288 15Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M15.6125 6.75C15.0949 6.75 14.5985 6.55246 14.2325 6.20083C13.8666 5.84919 13.6609 5.37228 13.6609 4.875V1.875C13.6609 1.37772 13.8666 0.900806 14.2325 0.549175C14.5985 0.197544 15.0949 0 15.6125 0C16.1301 0 16.6265 0.197544 16.9925 0.549175C17.3585 0.900806 17.5641 1.37772 17.5641 1.875V4.875C17.5641 5.37228 17.3585 5.84919 16.9925 6.20083C16.6265 6.55246 16.1301 6.75 15.6125 6.75Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M21.6857 9.16496C21.5042 8.9913 21.3601 8.7849 21.2618 8.5576C21.1635 8.33031 21.1129 8.0866 21.1129 7.84046C21.1129 7.59432 21.1635 7.35061 21.2618 7.12332C21.3601 6.89602 21.5042 6.68962 21.6857 6.51596L23.8933 4.39196C24.2594 4.04028 24.7558 3.84271 25.2735 3.84271C25.7911 3.84271 26.2876 4.04028 26.6536 4.39196C27.0197 4.74364 27.2253 5.22061 27.2253 5.71796C27.2253 6.21531 27.0197 6.69228 26.6536 7.04396L24.4429 9.16496C24.2621 9.33939 24.0473 9.4778 23.8107 9.57224C23.5742 9.66668 23.3205 9.7153 23.0643 9.7153C22.8081 9.7153 22.5545 9.66668 22.3179 9.57224C22.0813 9.4778 21.8665 9.33939 21.6857 9.16496V9.16496Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M24.1993 15C24.1993 14.5027 24.405 14.0258 24.7709 13.6742C25.1369 13.3225 25.6333 13.125 26.1509 13.125H29.2734C29.791 13.125 30.2874 13.3225 30.6534 13.6742C31.0194 14.0258 31.225 14.5027 31.225 15C31.225 15.4973 31.0194 15.9742 30.6534 16.3258C30.2874 16.6775 29.791 16.875 29.2734 16.875H26.1509C25.6333 16.875 25.1369 16.6775 24.7709 16.3258C24.405 15.9742 24.1993 15.4973 24.1993 15Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M21.6857 20.835C21.8665 20.6606 22.0813 20.5222 22.3179 20.4277C22.5545 20.3333 22.8081 20.2847 23.0643 20.2847C23.3205 20.2847 23.5742 20.3333 23.8107 20.4277C24.0473 20.5222 24.2621 20.6606 24.4429 20.835L26.6536 22.956C27.0197 23.3077 27.2253 23.7847 27.2253 24.282C27.2253 24.7794 27.0197 25.2563 26.6536 25.608C26.2876 25.9597 25.7911 26.1573 25.2735 26.1573C24.7558 26.1573 24.2594 25.9597 23.8933 25.608L21.6857 23.484C21.5042 23.3104 21.3601 23.1039 21.2618 22.8767C21.1635 22.6494 21.1129 22.4056 21.1129 22.1595C21.1129 21.9134 21.1635 21.6697 21.2618 21.4424C21.3601 21.2151 21.5042 21.0087 21.6857 20.835V20.835Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M15.6125 23.25C16.1301 23.25 16.6265 23.4475 16.9925 23.7992C17.3585 24.1508 17.5641 24.6277 17.5641 25.125V28.125C17.5641 28.6223 17.3585 29.0992 16.9925 29.4508C16.6265 29.8025 16.1301 30 15.6125 30C15.0949 30 14.5985 29.8025 14.2325 29.4508C13.8666 29.0992 13.6609 28.6223 13.6609 28.125V25.125C13.6609 24.6277 13.8666 24.1508 14.2325 23.7992C14.5985 23.4475 15.0949 23.25 15.6125 23.25Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M9.5392 20.835C9.72075 21.0087 9.86482 21.2151 9.96311 21.4424C10.0614 21.6697 10.112 21.9134 10.112 22.1595C10.112 22.4056 10.0614 22.6494 9.96311 22.8767C9.86482 23.1039 9.72075 23.3104 9.5392 23.484L7.3316 25.608C6.96556 25.9597 6.46911 26.1573 5.95145 26.1573C5.4338 26.1573 4.93735 25.9597 4.57131 25.608C4.20527 25.2563 3.99963 24.7794 3.99963 24.282C3.99963 23.7847 4.20527 23.3077 4.57131 22.956L6.78204 20.835C6.96279 20.6606 7.17762 20.5222 7.41419 20.4277C7.65077 20.3333 7.90443 20.2847 8.16062 20.2847C8.41681 20.2847 8.67047 20.3333 8.90705 20.4277C9.14362 20.5222 9.35845 20.6606 9.5392 20.835V20.835Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M7.02562 15C7.02562 15.4973 6.82001 15.9742 6.45402 16.3258C6.08803 16.6775 5.59165 16.875 5.07406 16.875H1.95156C1.43397 16.875 0.937588 16.6775 0.571599 16.3258C0.20561 15.9742 0 15.4973 0 15C0 14.5027 0.20561 14.0258 0.571599 13.6742C0.937588 13.3225 1.43397 13.125 1.95156 13.125H5.07406C5.59165 13.125 6.08803 13.3225 6.45402 13.6742C6.82001 14.0258 7.02562 14.5027 7.02562 15Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                    <path
                      d="M9.5392 9.16496C9.35845 9.33939 9.14362 9.4778 8.90705 9.57224C8.67047 9.66668 8.41681 9.7153 8.16062 9.7153C7.90443 9.7153 7.65077 9.66668 7.41419 9.57224C7.17762 9.4778 6.96279 9.33939 6.78204 9.16496L4.57131 7.04396C4.20527 6.69228 3.99963 6.21531 3.99963 5.71796C3.99963 5.22061 4.20527 4.74364 4.57131 4.39196C4.93735 4.04028 5.4338 3.84271 5.95145 3.84271C6.46911 3.84271 6.96556 4.04028 7.3316 4.39196L9.5392 6.51596C9.72075 6.68962 9.86482 6.89602 9.96311 7.12332C10.0614 7.35061 10.112 7.59432 10.112 7.84046C10.112 8.0866 10.0614 8.33031 9.96311 8.5576C9.86482 8.7849 9.72075 8.9913 9.5392 9.16496V9.16496Z"
                      fill={cellSettingType === "end" ? "#F191DC" : "#160F17"}/>
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect width="31.225" height="30" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                end
              </button>
            </li>
            <li>
              <button type="button" className={`${styles.button} ${cellSettingType === "wall" && styles.activeButton}`}
                      onClick={() => setCellSettingType("wall")}>
                <svg width="32" height="30" viewBox="0 0 32 30" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <rect width="31.225" height="30" fill={cellSettingType === "wall" ? "#F191DC" : "#160F17"}/>
                </svg>
                wall
              </button>
            </li>
            <li>
              <button className={styles.button} onClick={onGenerateMaze}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M30 13.5C30 13.1022 29.842 12.7206 29.5607 12.4393C29.2794 12.158 28.8978 12 28.5 12H19.5C19.1022 12 18.7206 12.158 18.4393 12.4393C18.158 12.7206 18 13.1022 18 13.5V19.5C18 19.8978 18.158 20.2794 18.4393 20.5607C18.7206 20.842 19.1022 21 19.5 21H28.5C28.8978 21 29.2794 20.842 29.5607 20.5607C29.842 20.2794 30 19.8978 30 19.5V13.5ZM27 17.25C27 17.4489 26.921 17.6397 26.7803 17.7803C26.6397 17.921 26.4489 18 26.25 18H21.75C21.5511 18 21.3603 17.921 21.2197 17.7803C21.079 17.6397 21 17.4489 21 17.25V15.75C21 15.5511 21.079 15.3603 21.2197 15.2197C21.3603 15.079 21.5511 15 21.75 15H26.25C26.4489 15 26.6397 15.079 26.7803 15.2197C26.921 15.3603 27 15.5511 27 15.75V17.25Z"
                    fill="#160F17"/>
                  <path
                    d="M1.5 7.5C1.89782 7.5 2.27936 7.34196 2.56066 7.06066C2.84196 6.77936 3 6.39782 3 6V3.75C3 3.55109 3.07902 3.36032 3.21967 3.21967C3.36032 3.07902 3.55109 3 3.75 3H6C6.39782 3 6.77936 2.84196 7.06066 2.56066C7.34196 2.27936 7.5 1.89782 7.5 1.5C7.5 1.10218 7.34196 0.720644 7.06066 0.43934C6.77936 0.158035 6.39782 0 6 0L1.5 0C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5L0 6C0 6.39782 0.158035 6.77936 0.43934 7.06066C0.720644 7.34196 1.10218 7.5 1.5 7.5Z"
                    fill="#160F17"/>
                  <path
                    d="M30 1.5C30 1.10218 29.842 0.720644 29.5607 0.43934C29.2794 0.158035 28.8978 0 28.5 0L24 0C23.6022 0 23.2206 0.158035 22.9393 0.43934C22.658 0.720644 22.5 1.10218 22.5 1.5C22.5 1.89782 22.658 2.27936 22.9393 2.56066C23.2206 2.84196 23.6022 3 24 3H26.25C26.4489 3 26.6397 3.07902 26.7803 3.21967C26.921 3.36032 27 3.55109 27 3.75V6C27 6.39782 27.158 6.77936 27.4393 7.06066C27.7206 7.34196 28.1022 7.5 28.5 7.5C28.8978 7.5 29.2794 7.34196 29.5607 7.06066C29.842 6.77936 30 6.39782 30 6V1.5Z"
                    fill="#160F17"/>
                  <path
                    d="M6 27H3.75C3.55109 27 3.36032 26.921 3.21967 26.7803C3.07902 26.6397 3 26.4489 3 26.25V24C3 23.6022 2.84196 23.2206 2.56066 22.9393C2.27936 22.658 1.89782 22.5 1.5 22.5C1.10218 22.5 0.720644 22.658 0.43934 22.9393C0.158035 23.2206 0 23.6022 0 24L0 28.5C0 28.8978 0.158035 29.2794 0.43934 29.5607C0.720644 29.842 1.10218 30 1.5 30H6C6.39782 30 6.77936 29.842 7.06066 29.5607C7.34196 29.2794 7.5 28.8978 7.5 28.5C7.5 28.1022 7.34196 27.7206 7.06066 27.4393C6.77936 27.158 6.39782 27 6 27Z"
                    fill="#160F17"/>
                  <path
                    d="M28.5 22.5C28.1022 22.5 27.7206 22.658 27.4393 22.9393C27.158 23.2206 27 23.6022 27 24V26.25C27 26.4489 26.921 26.6397 26.7803 26.7803C26.6397 26.921 26.4489 27 26.25 27H24C23.6022 27 23.2206 27.158 22.9393 27.4393C22.658 27.7206 22.5 28.1022 22.5 28.5C22.5 28.8978 22.658 29.2794 22.9393 29.5607C23.2206 29.842 23.6022 30 24 30H28.5C28.8978 30 29.2794 29.842 29.5607 29.5607C29.842 29.2794 30 28.8978 30 28.5V24C30 23.6022 29.842 23.2206 29.5607 22.9393C29.2794 22.658 28.8978 22.5 28.5 22.5Z"
                    fill="#160F17"/>
                  <path
                    d="M18 27H15.75C15.5511 27 15.3603 26.921 15.2197 26.7803C15.079 26.6397 15 26.4489 15 26.25V19.5C15 19.1022 14.842 18.7206 14.5607 18.4393C14.2794 18.158 13.8978 18 13.5 18H7.5C7.10218 18 6.72064 18.158 6.43934 18.4393C6.15804 18.7206 6 19.1022 6 19.5C6 19.8978 6.15804 20.2794 6.43934 20.5607C6.72064 20.842 7.10218 21 7.5 21H11.25C11.4489 21 11.6397 21.079 11.7803 21.2197C11.921 21.3603 12 21.5511 12 21.75V28.5C12 28.8978 12.158 29.2794 12.4393 29.5607C12.7206 29.842 13.1022 30 13.5 30H18C18.3978 30 18.7794 29.842 19.0607 29.5607C19.342 29.2794 19.5 28.8978 19.5 28.5C19.5 28.1022 19.342 27.7206 19.0607 27.4393C18.7794 27.158 18.3978 27 18 27Z"
                    fill="#160F17"/>
                  <path
                    d="M1.5 15H7.5C7.89782 15 8.27936 14.842 8.56066 14.5607C8.84196 14.2794 9 13.8978 9 13.5C9 13.1022 8.84196 12.7206 8.56066 12.4393C8.27936 12.158 7.89782 12 7.5 12H1.5C1.10218 12 0.720644 12.158 0.43934 12.4393C0.158035 12.7206 0 13.1022 0 13.5C0 13.8978 0.158035 14.2794 0.43934 14.5607C0.720644 14.842 1.10218 15 1.5 15V15Z"
                    fill="#160F17"/>
                  <path
                    d="M9 7.5C9 7.89782 9.15804 8.27936 9.43934 8.56066C9.72064 8.84196 10.1022 9 10.5 9H19.5C19.8978 9 20.2794 8.84196 20.5607 8.56066C20.842 8.27936 21 7.89782 21 7.5C21 7.10218 20.842 6.72064 20.5607 6.43934C20.2794 6.15804 19.8978 6 19.5 6H17.25C17.0511 6 16.8603 5.92098 16.7197 5.78033C16.579 5.63968 16.5 5.44891 16.5 5.25V1.5C16.5 1.10218 16.342 0.720644 16.0607 0.43934C15.7794 0.158035 15.3978 0 15 0C14.6022 0 14.2206 0.158035 13.9393 0.43934C13.658 0.720644 13.5 1.10218 13.5 1.5V5.25C13.5 5.44891 13.421 5.63968 13.2803 5.78033C13.1397 5.92098 12.9489 6 12.75 6H10.5C10.1022 6 9.72064 6.15804 9.43934 6.43934C9.15804 6.72064 9 7.10218 9 7.5Z"
                    fill="#160F17"/>
                </svg>
                generate maze
              </button>
            </li>
            <li className={styles.weightForm}>
              <button type="button"
                      className={`${styles.button} ${cellSettingType === "weight" && styles.activeButton}`}
                      onClick={() => setCellSettingType("weight")}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M29.904 16.515L25.317 4.27201L26.13 3.97201C26.3779 3.90267 26.6089 3.78304 26.8085 3.62055C27.0081 3.45807 27.1722 3.25622 27.2904 3.02757C27.4087 2.79893 27.4785 2.54839 27.4957 2.29155C27.5129 2.03472 27.4771 1.7771 27.3904 1.53474C27.3036 1.29237 27.168 1.07046 26.9918 0.882814C26.8156 0.69517 26.6026 0.545817 26.3662 0.444057C26.1297 0.342298 25.8749 0.290311 25.6175 0.291336C25.3601 0.29236 25.1056 0.346374 24.87 0.450013L16.875 3.30001V2.21701C16.875 1.71973 16.6775 1.24282 16.3258 0.891188C15.9742 0.539557 15.4973 0.342013 15 0.342013C14.5027 0.342013 14.0258 0.539557 13.6742 0.891188C13.3225 1.24282 13.125 1.71973 13.125 2.21701V4.64701L3.87 7.95001C3.48587 8.09104 3.15842 8.35387 2.93762 8.69838C2.71681 9.0429 2.61477 9.45019 2.64706 9.85811C2.67936 10.266 2.84421 10.6522 3.11648 10.9577C3.38874 11.2632 3.75346 11.4712 4.155 11.55L0.096 22.383C0.0328742 22.5509 0.000359623 22.7287 0 22.908C0 24.6982 0.711159 26.4151 1.97703 27.681C3.2429 28.9469 4.95979 29.658 6.75 29.658C8.54021 29.658 10.2571 28.9469 11.523 27.681C12.7888 26.4151 13.5 24.6982 13.5 22.908C13.4996 22.7287 13.4671 22.5509 13.404 22.383L8.82 10.164L20.544 5.96401L16.596 16.515C16.533 16.6839 16.5005 16.8627 16.5 17.043C16.5 18.8332 17.2112 20.5501 18.477 21.816C19.7429 23.0819 21.4598 23.793 23.25 23.793C25.0402 23.793 26.7571 23.0819 28.023 21.816C29.2888 20.5501 30 18.8332 30 17.043C29.9995 16.8627 29.967 16.6839 29.904 16.515ZM3.549 21.717L6.75 13.185L9.951 21.717H3.549ZM20.097 15.717L23.25 7.29901L26.4 15.717H20.097Z"
                    fill={cellSettingType === "weight" ? "#F191DC" : "#160F17"}/>
                </svg>
                weight
              </button>
              <input
                className={styles.inputWeight}
                type="number"
                value={weightCost}
                min="1"
                onChange={(e) =>
                  setWeightCost(e.target.value ? +e.target.value : 1)}/>
            </li>
            <li>
              <select
                value={chosenAlgorithm}
                onChange={(e) => setChosenAlgorithm(e.target.value)}
                className={styles.chooseAlgorithm}>
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
                <option value="dijkstra">Dijkstra</option>
                <option value="astar">A*</option>
                <option value="gbfs">Greedy Best First Search</option>
              </select>
            </li>
            <li className={styles.gap}>
                <input value={xSize}
                       className={styles.inputWeight}
                       onInput={e =>
                         setXSize(Math.max(+e.target.value, 2))}
                       type="number" min="2"/>
                <input value={ySize}
                       className={styles.inputWeight}
                       onInput={e =>
                         setYSize(Math.max(+e.target.value, 2))}
                       type="number" min="2"/>
            </li>
            <li>
              <label className={styles.df}>
              Speed
              <input value={speed}
                     onInput={e =>
                       setSpeed(Math.min(Math.max(+e.target.value, 1), 10))}
                     className={styles.inputWeight}
                     type="number" min="1" max="10"/>
            </label></li>
            <li>{pathLengthMessage}</li>
          </ul>
          <div className={styles.navDiv}>
            <button type="button" className={styles.navDivButton} disabled={visualizeButtonDisabled}
                    onClick={clearField}>
              clear field
            </button>
            <button type="button" className={`${styles.navDivButton} ${styles.visual_button}`}
                    disabled={visualizeButtonDisabled}
                    onClick={visualizeButtonClickHandler}>
              visualize
            </button>
          </div>
        </nav>
        <div onMouseDown={() => setMouseClicked(true)}
             onMouseUp={() => setMouseClicked(false)}
             className={styles.grid} style={gridStyles}>
          {arr.map((row, rowIndex) =>
            row.map((el, colIndex) => <Cell key={`${rowIndex}${colIndex}`}
                                            mouseClicked={mouseClicked}
                                            onClick={onCellClick}
                                            type={rowIndex === start.y && colIndex === start.x ? "start" : (
                                              rowIndex === end.y && colIndex === end.x ? "end" : (
                                                weights.find(({x, y}) =>
                                                  rowIndex === y && colIndex === x) ? "weight" : "cell"
                                              )
                                            )}
                                            rowIndex={rowIndex}
                                            columnIndex={colIndex}
                                            state={arr[rowIndex][colIndex]}/>))}
        </div>
      </div>
    </div>
  )
};

export default Grid;