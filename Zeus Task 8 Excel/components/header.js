import { getGrid } from '../core/grid_manager.js';


/**
 * Creates a styled header element for the Excel UI, including title, Undo, Redo, and Upload buttons.
 * The Upload button triggers a callback when clicked.
 *
 * @param {Function} onUploadClick - The callback function to execute when the Upload button is clicked.
 * @returns {HTMLElement} The constructed header DOM element with all buttons and title.
 */



export default function createExcelHeader(onUploadClick) {
  const header = document.createElement('header');
  header.className = 'excel-header';

  const title = document.createElement('div');
  title.className = 'header-title';
  title.textContent = 'Excel UI';

  const actions = document.createElement('div');
  actions.className = 'header-actions';

  const undoBtn = document.createElement('button');
  undoBtn.textContent = 'Undo';

  const redoBtn = document.createElement('button');
  redoBtn.textContent = 'Redo';

  const uploadBtn = document.createElement('button');
  uploadBtn.textContent = 'Upload';

  uploadBtn.addEventListener('click', onUploadClick);

  actions.append(undoBtn, redoBtn, uploadBtn);
  header.append(title, actions);

  undoBtn.addEventListener('click', () => {
    const grid = getGrid();
    if (grid) grid.undo();
  });
  redoBtn.addEventListener('click', () => {
    const grid = getGrid();
    if (grid) grid.redo();
  });



  return header;
}