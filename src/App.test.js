import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import Minesweeper from './Minesweeper';
import {getBombLocations, getNumBombNeighbors } from "./Minesweeper"

test('App renders Minesweeper', () => {
  render(<App/>);
  const minesweeperComponent = <Minesweeper></Minesweeper>
  expect(minesweeperComponent).toBeInTheDocument;
});

// test that the board remains the same after clicking on a square 
// make sure it isn't changing "behind the scenes"
test('board remains the same after rerender', () => {
  render(<Minesweeper />);
  
  const initialBombLocations = getBombLocations();
  const initialNeighbors = getNumBombNeighbors();

  // now click on any square, let's say board[0][0]
  const topLeftButton = screen.getByTestId(`0 + 0`);
  fireEvent.click(topLeftButton);

  const afterBombLocations = getBombLocations();
  const afterNeighbors = getNumBombNeighbors();

  expect(initialBombLocations).toEqual(afterBombLocations);
  expect(initialNeighbors).toEqual(afterNeighbors);

})

