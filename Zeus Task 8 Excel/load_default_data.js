import Grid from './grid.js';

const container = document.getElementById('container');
let grid = null;

/**
 * Loads the default data, from a JSON file, and calls the constructor of grid.
 * If the file is not found, it initializes an empty grid.
 * Grid object constructor is call has canvas,header, and sidebar getting injected into the container of the HTML.
 */
export default async function loadDefaultData() {
  try {
    const res = await fetch('data/data.json');
    const data = await res.json();
    grid = new Grid(container, data);
  } catch (err) {
    console.warn('Failed to load default data. Using empty grid.', err.message);
    grid = new Grid(container, []); // fallback
  }
}
