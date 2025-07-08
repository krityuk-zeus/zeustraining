import createExcelHeader from './header.js';
import Grid from './grid.js';

const container = document.getElementById('container');
let grid = null;

/**
 * Loads the default data, from a JSON file, and calls the constructor of grid.
 * If the file is not found, it initializes an empty grid.
 */
async function loadDefaultData() {
  const res = await fetch('data/data.json');
  const data = await res.json();
  grid = new Grid(container, data);
}

/**
 * Handles the upload of a JSON file to update the grid.
 * It creates a file input element, reads the file, clears previous data of grid by container.innerHTML = ''; and updates the grid with the new data.
 */
async function handleUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  document.body.appendChild(input);

  /**
   * Event listener which would continue to listen for changes in the file input after the execution of input.click() function.
   * When a file is selected, it reads the file as text, parses it as JSON, and updates the grid.
   * If the JSON is invalid, it alerts the user with an error message.
   * The input element is removed after the upload is complete.
   * @param {Event} e - The change event triggered when a file is selected.
   */
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const json = JSON.parse(await file.text());
      container.innerHTML = ''; // Clear the container before creating a new grid
      grid = new Grid(container, json);
    } catch (err) {
      alert(`Invalid JSON: ${err.message}`);
    }

    input.remove();
  });

  input.click(); // Trigger the pop-up, trigger the file input dialog
}

/**
 * Creates the header for the Excel-like grid interface.
 * It includes a button to upload a JSON file to update the grid.
 */
const header = createExcelHeader(handleUpload);
document.body.prepend(header);
loadDefaultData();