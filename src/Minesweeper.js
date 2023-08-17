import {React, useState, useEffect} from 'react'
import './Minesweeper.css'

const MAX_BOMBS = 40;
const NUM_COLS = 18;
const NUM_ROWS = 14;

const directions = [{r_offset : -1, c_offset : -1},  // top left
                    {r_offset : -1, c_offset :  0},  // top
                    {r_offset : -1, c_offset :  1},  // top right
                    {r_offset :  0, c_offset : -1},  // left
                    {r_offset :  0, c_offset :  1},  // right
                    {r_offset :  1, c_offset : -1},  // bottom left
                    {r_offset :  1, c_offset :  0},  // bottom
                    {r_offset :  1, c_offset :  1}]; // bottom right



function generateBombLocations(r, c){
    let bombLocations = Array.from(Array(NUM_ROWS), () => new Array(NUM_COLS).fill(0));
    let countBombs = 0; 

    while (countBombs < MAX_BOMBS){
    for (let row = 0; row < NUM_ROWS; row++){
        for (let col = 0; col < NUM_COLS; col++){
            if (row != r && c != col && countBombs < MAX_BOMBS && Math.random() >= 0.9){
                bombLocations[row][col] = 1;
                countBombs++;
            }
            
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

function getTextColor(char){
    switch (char){
        case 1 :
            return '#18a324'
        case 2 :
            return '#ffd000'
        case 3 : 
            return '#e87502'
        case 4 : 
            return '#c90404'
        default : 
            return '#8a0101'
    }
}

let bombLocations = null;
let numBombNeighbors = null;

export default function Minesweeper () {

    const [isGameOver, setIsGameOver] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [board, setBoard] = useState(clearBoard);
    const [isFirstGuess, setIsFirstGuess] = useState(true);

    useEffect(() => {
        setIsWon(checkIfWon);
    }, [board]);

    function reset(){
        
        setIsGameOver(false);
        setIsWon(false);
        setBoard(clearBoard);
        setIsFirstGuess(true);
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
           const indices = queue[0];  
           queue.shift();
           squaresToReveal.push({row : indices.r, col : indices.c});

           if (numBombNeighbors[indices.r][indices.c] !== 0) continue;
            
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

    function checkIfWon(){

        if (bombLocations == null) return false;

        for (let i = 0; i < NUM_ROWS; i++){
            for (let j = 0; j < NUM_COLS; j++){
                if (board[i][j] === "🚩" && bombLocations[i][j] !== 1) return false;
                if (board[i][j] === "" && bombLocations[i][j] !== 1) return false;
            }
        }

        return true; // only squares left are ones with bombs behind them
    }

    


    function onSquarePressed(r, c) {

        // make sure first square is never a bomb
       
        if (isFirstGuess){
            bombLocations = generateBombLocations(r, c);
            numBombNeighbors = generateNumBombNeighbors(bombLocations);
            setIsFirstGuess(false);
        }

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
        }else {
            let squaresToReveal = findSquaresToReveal(r, c);
            let row, col;
            squaresToReveal.forEach(squareToReveal => {
                row = squareToReveal.row;
                col = squareToReveal.col;
                b[row][col] = numBombNeighbors[row][col];
    
            });
        }

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
               buttons.push(<button data-testid={`${r} + ${c}`} key={`${r} + ${c}`} 
                                    onContextMenu={(event) => toggleFlag(event, r, c)} 
                                    onClick={() => onSquarePressed(r, c)} 
                                    disabled={isGameOver ? true : false} 
                                    style={{color : getTextColor(board[r][c]), fontWeight : 'bold'}}
                                    className={isGameOver ? "matrix-button matrix-disabled-button" : board[r][c] !== "" && board[r][c] !== "🚩" ? "matrix-button matrix-button-filled" : "matrix-button matrix-button-unfilled"}>{board[r][c] !== 0 ? board[r][c] : ''}</button>);
            }
        
            rows.push(<div key={r} id={`${r}`}className="matrix-row">{buttons}</div>);
          }
        
          return <div>{rows}</div>
    }

   
    return (
        <div>
            <p data-testid="state of game" className={"title"}>
                {isGameOver ? "GAME OVER" : isWon ? "YOU WIN" : "MINESWEEPER"}
            </p>
            <Board></Board>
            <button onClick={reset}> {isGameOver ? 'Retry' : 'Restart'}</button>
        </div>
    );
        
};





