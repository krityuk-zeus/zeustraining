import Grid from "../core/grid.js";
import { setGrid } from '../core/grid_manager.js';



/**
 * Main container for the grid.
 * This is where the grid will be rendered.
 */
const container = document.getElementById('container');

/**
 * Grid instance that will be created and managed.
 * It will be initialized with the default data or updated with user-uploaded data.
 */
let grid = null;


/**
 * Loads the default data, from a JSON file, and calls the constructor of grid.
 * If the file is not found, it initializes an empty grid.
 * Grid object constructor is call has canvas,header, and sidebar getting injected into the container of the HTML.
 */
export default async function loadDefaultData() {
  try {
    const res = await fetch('json/data.json');
    const data = await res.json();
    grid = new Grid(container, data);

    // Calling the setter of grid here so that header actions can access the grid instance.
    setGrid(grid); // Set the grid reference for header actions
    
  } catch (err) {
    console.warn('Failed to load default data. Using empty grid.', err.message);
    grid = new Grid(container, []); // fallback
  }
}
