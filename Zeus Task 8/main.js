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

async function handleUpload() {
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

const header = createExcelHeader(handleUpload);
document.body.prepend(header);
loadDefaultData();