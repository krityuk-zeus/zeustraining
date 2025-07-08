import Grid from './grid.js';


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
 * Handles user-uploaded JSON to update the grid.
 * /**
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
      container.innerHTML = '';
      grid = new Grid(container, json);
    } catch (err) {
      alert(`Invalid JSON: ${err.message}`);
    }

    input.remove();
  });

  input.click();
}
