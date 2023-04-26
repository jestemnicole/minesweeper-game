import {React, useState} from 'react'
import './Minesweeper.css'

const MAX_BOMBS = 30;
const NUM_COLS = 10;
const NUM_ROWS = 10;

const directions = [{r_offset : -1, c_offset : -1},  // top left
                    {r_offset : -1, c_offset :  0},  // top
                    {r_offset : -1, c_offset :  1},  // top right
                    {r_offset :  0, c_offset : -1},  // left
                    {r_offset :  0, c_offset :  1},  // right
                    {r_offset :  1, c_offset : -1},  // bottom left
                    {r_offset :  1, c_offset :  0},  // bottom
                    {r_offset :  1, c_offset :  1}]; // bottom right

function generateBombLocations(){
    let bombLocations = Array.from(Array(NUM_ROWS), () => new Array(NUM_COLS).fill(0));
    let countBombs = 0; 

    for (let row = 0; row < NUM_ROWS; row++){
        for (let col = 0; col < NUM_COLS; col++){
            if (countBombs < MAX_BOMBS && Math.random() >= 0.85){
                bombLocations[row][col] = 1;
                countBombs++;
            }
            
        }
    }

    return bombLocations;
}

function inBounds(row, col){
    if (row >= 0 && row < NUM_ROWS && col >= 0 && col < NUM_COLS) return true;
    
    return false;
    
}

function generateNumBombNeighbors(bombLocations){

    let board = Array.from(Array(NUM_ROWS), () => new Array(NUM_COLS).fill(0));;
        
        for (let row = 0; row < NUM_ROWS; row++){
            for (let col = 0; col < NUM_COLS; col++){
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
        for (let i = 0; i < NUM_ROWS; i++){
            b[i] = [];
            for (let j = 0; j < NUM_COLS; j++){
                b[i][j] = "";
            }
        }
        return b;
}

let bombLocations = generateBombLocations();
let numBombNeighbors = generateNumBombNeighbors(bombLocations);

export default function Minesweeper () {

    const [isGameOver, setIsGameOver] = useState(false);
    const [board, setBoard] = useState(clearBoard);

    function reset(){
        bombLocations = generateBombLocations();
        numBombNeighbors = generateNumBombNeighbors(bombLocations);
        setIsGameOver(false);
        setBoard(clearBoard);
    }

    function copyBoard(){
    
        let b = [];
        for (let i = 0; i < NUM_ROWS; i++){
            b[i] = [];
            for (let j = 0; j < NUM_COLS; j++){
                b[i][j] = board[i][j];
            }
        }
    
        return b;
    }


    function findSquaresToReveal(r,c){
        
        let queue = [];
        queue.push({r, c});
        let visited = [];
        let squaresToReveal = [];
        
        for (let i = 0; i < NUM_ROWS; i++){
            visited[i] = [];
            for (let j = 0; j < NUM_COLS; j++){
                visited[i][j] = false;
            }
        }
        visited[r][c] = true;
    
        while (queue.length > 0){
           const indices = queue[0]; // take out oldest 
           queue.shift();
           squaresToReveal.push({row : indices.r, col : indices.c});

           if (numBombNeighbors[indices.r][indices.c] !== 0) continue; // stop here
            // else keep exploring 
                
            directions.forEach(direction => {
                let n_row = indices.r + direction.r_offset;
                let n_col = indices.c + direction.c_offset;
                if (inBounds(n_row, n_col) && visited[n_row][n_col] === false){
                    if (bombLocations[n_row][n_col] !== 1){ // dont want to reveal bombs
                        queue.push({r : n_row, c : n_col});
                        visited[n_row][n_col] = true;
                        squaresToReveal.push({row : n_row, col : n_col});
                    }
                }
            });
        }

        return squaresToReveal;
    }

    function onSquarePressed(r, c) {

        // todo : check whether the user won
        if (board[r][c] === "🚩") return;
        let b = copyBoard();
         
        if (bombLocations[r][c] === 1){
            b[r][c] = "💣";
            setBoard(b);
            setIsGameOver(true);
            return;
        }

        if (numBombNeighbors[r][c] !== 0){
            b[r][c] = numBombNeighbors[r][c];
            setBoard(b);
            return;
        }

        // else no flag, no bomb, and no number
        // run a BFS to find perimeter 
        // explore each direction until we reach a position on the board
        // occupied by a number that isn't 0 and not a bomb

        let squaresToReveal = findSquaresToReveal(r, c);
        squaresToReveal.forEach(squareToReveal => {
            
            b[squareToReveal.row][squareToReveal.col] = numBombNeighbors[squareToReveal.row][squareToReveal.col];

        });

        setBoard(b);
    }

    function toggleFlag(event, r, c){
        event.preventDefault();
        
        if (board[r][c] !== "" && board[r][c] !== "🚩") return;

        let b = copyBoard();

        b[r][c] = board[r][c] === "🚩" ? "" : "🚩";
        setBoard(b);
        
    }

    function Board(){
        
        let rows = []
        for (let r = 0; r < NUM_ROWS; r++) {
            let buttons = [];
        
            for (let c = 0; c < NUM_COLS; c++) {
               buttons.push(<button key={`${r} + ${c}`} 
                                    onContextMenu={(event) => toggleFlag(event, r, c)} 
                                    onClick={() => onSquarePressed(r, c)} 
                                    disabled={isGameOver ? true : false} 
                                    className={isGameOver ? "matrix-disabled-button" : board[r][c] !== "" && board[r][c] !== "🚩" ? "matrix-button-filled" : "matrix-button"}>{board[r][c] !== 0 ? board[r][c] : ""}</button>);
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





