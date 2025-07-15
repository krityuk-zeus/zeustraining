import Grid from "../core/grid.js";
import { getGrid, setGrid } from '../core/grid_manager.js';


/**
 * Main container for the grid.
 * This is where the grid will be rendered.
 */
const container = document.getElementById('container');

/**
 * Grid instance that will be created and managed.
 * It will be initialized with the default data or updated with user-uploaded data.
 */
// let grid = null;

/**
 * WhenEver upload button is clicked, it will call the handleUpload function,
 * which will clear the previous data of grid by container.innerHTML = '';
 * previous canvas,headerCanvas etc will be removed,
 * and inject the new canvas, headerCanvas, siderCanvas etc into container.
 * 
 * Handles the upload of a JSON file to update the grid.
 * It creates a file input element, reads the file, clears previous data of grid by container.innerHTML = ''; and updates the grid with the new data.
 */
export default async function handleUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const json = JSON.parse(await file.text());
      /**
       * One need to write container.innerHTML = ''; inside the grid class itself
       * To clear the previous data before rendering the new grid.
       *  If we wrote container.innerHTML = ''; here itself, then since grid has window.event listeners, and setTimeout inside it, so grid instance would not get cleared.
      */

      const oldGrid = getGrid();
      if (oldGrid) oldGrid.destroy();
      // container.innerHTML = '';

      const newGrid = new Grid(container, json);
      setGrid(newGrid);
    } catch (err) {
      alert(`Invalid JSON: ${err.message}`);
    }

    input.remove();
  });

  input.click();
}
