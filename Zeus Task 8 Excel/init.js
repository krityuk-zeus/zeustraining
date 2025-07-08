import createExcelHeader from './header.js';
import handleUpload from './uploader.js';
import loadDefaultData from './load_default_data.js';

/**
 * Initializes the Excel-like grid UI:
 * - Adds header with Upload button.
 * - Loads default data to initialize the grid.
 */
export default function initializeApp() {
  const header = createExcelHeader(handleUpload);
  document.body.prepend(header);
  loadDefaultData();
}