import {React, useState} from 'react'
import './Minesweeper.css'

const MAX_BOMBS = 30;
const SIZE_OF_BOARD = 10;

function generateBombLocations(){
    let bombLocations = Array.from(Array(SIZE_OF_BOARD), () => new Array(SIZE_OF_BOARD).fill(0));
    let countBombs = 0; 

    for (let row = 0; row < SIZE_OF_BOARD; row++){
        for (let col = 0; col < SIZE_OF_BOARD; col++){
            if (countBombs < MAX_BOMBS && Math.random() >= 0.75){
                bombLocations[row][col] = 1;
                countBombs++;
            }
            
        }
    }

    return bombLocations;
}

function inBounds(row, col){
    if (row >= 0 && row < SIZE_OF_BOARD && col >= 0 && col < SIZE_OF_BOARD) return true;
    
    return false;
    
}

function generateNumBombNeighbors(bombLocations){

    let board = Array.from(Array(SIZE_OF_BOARD), () => new Array(SIZE_OF_BOARD).fill(0));;
        
        const directions = [{r_offset : -1, c_offset : -1}, 
                            {r_offset : -1, c_offset :  0}, 
                            {r_offset : -1, c_offset :  1}, 
                            {r_offset :  0, c_offset : -1}, 
                            {r_offset :  0, c_offset :  1},
                            {r_offset :  1, c_offset : -1}, 
                            {r_offset :  1, c_offset :  0}, 
                            {r_offset :  1, c_offset :  1}]
        
        for (let row = 0; row < SIZE_OF_BOARD; row++){
            for (let col = 0; col < SIZE_OF_BOARD; col++){
                if (bombLocations[row][col] === 1) continue;

                let countBombs = 0;

                directions.forEach(direction => {
                    let n_row = row + direction.r_offset;
                    let n_col = col + direction.c_offset;
                    if (inBounds(n_row, n_col) && bombLocations[n_row][n_col] === 1) countBombs++;
                });

                board[row][col] = countBombs;
            }
        }
        return board;
}


function clearBoard(){
    let b = [];
        for (let i = 0; i < SIZE_OF_BOARD; i++){
            b[i] = [];
            for (let j = 0; j < SIZE_OF_BOARD; j++){
                b[i][j] = "";
            }
        }
        return b;
}

let bombLocations = generateBombLocations();
let numBombNeighbors = generateNumBombNeighbors(bombLocations);

export default function Minesweeper () {

    //const [bombLocations, setBombLocations] = useState(initialBombLocations);
    //const [board, setBoard] = useState(initialBoard);
    
    const [isGameOver, setIsGameOver] = useState(false);
    const [board, setBoard] = useState(clearBoard);

    function reset(){
        bombLocations = generateBombLocations();
        numBombNeighbors = generateNumBombNeighbors(bombLocations);
        setIsGameOver(false);
        setBoard(clearBoard);
    }

    function onSquarePressed(r, c) {

        if (board[r][c] === "F") return;
        
         if (bombLocations[r][c] === 1){
            let b = [];
            for (let i = 0; i < SIZE_OF_BOARD; i++){
            b[i] = [];
            for (let j = 0; j < SIZE_OF_BOARD; j++){
                b[i][j] = board[i][j];
            }
            }
            b[r][c] = "💣";
            setBoard(b);
            setIsGameOver(true);
            return;
        }

        if (numBombNeighbors[r][c] !== 0){
            let b = [];
            for (let i = 0; i < SIZE_OF_BOARD; i++){
            b[i] = [];
            for (let j = 0; j < SIZE_OF_BOARD; j++){
                b[i][j] = board[i][j];
            }
            }
            b[r][c] = numBombNeighbors[r][c];
            setBoard(b);
            return;
        }
    }

    function toggleFlag(event, r, c){
        event.preventDefault();
        
        if (board[r][c] !== "" && board[r][c] !== "F") return;

        let b = [];
        for (let i = 0; i < SIZE_OF_BOARD; i++){
        b[i] = [];
        for (let j = 0; j < SIZE_OF_BOARD; j++){
            b[i][j] = board[i][j];
        }
        }

        b[r][c] = board[r][c] === "F" ? "" : "F";
        setBoard(b);
        
        

    }

    function Board(){
        
        let rows = []
        for (let r = 0; r < SIZE_OF_BOARD; r++) {
            let buttons = [];
        
            for (let c = 0; c < SIZE_OF_BOARD; c++) {
               buttons.push(<button key={`${r} + ${c}`} onContextMenu={(event) => toggleFlag(event, r, c)} onClick={() => onSquarePressed(r, c)} disabled={isGameOver ? true : false} className="matrix-button">{board[r][c]}</button>);
            }
        
            rows.push(<div key={r} id={`${r}`}className="matrix-row">{buttons}</div>);
          }
        
          return <div>{rows}</div>
    }

    return (
        <div>
            <p className={"title"}>{isGameOver ? "GAME OVER" : "MINESWEEPER"}</p>
            <Board></Board>
            <button onClick={reset}>Retry</button>
        </div>
    );
        
};





