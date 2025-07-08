import createExcelHeader from './components/header.js';
import handleUpload from './services/uploader.js';
import loadDefaultData from './services/load_default_data.js';

/**
 * Initializes the Excel-like UI:
 * - Creates a header object and appends it into body.
 * - Loads default data to initialize the grid.
 * NOTE : loadDefaultData function would call the constructor of grid,
 * and grid-constructor is having the canvas, header, and sidebar etc injected into the container.
 */
export default function initializeApp() {
  const header = createExcelHeader(handleUpload);
  document.body.prepend(header); // Conatainer is already injected into body in index.html, So we would have to prepend the header.
  loadDefaultData();
}