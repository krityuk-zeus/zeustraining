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

  

  return header;
}