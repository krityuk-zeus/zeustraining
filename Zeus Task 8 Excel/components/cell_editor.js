import AppString from '../AppString/appstring.js';
import CellEditCommand from '../Command_Pattern/edit_cell_cmd.js';


export default class CellEditor {
    constructor(grid) {
        this.grid = grid;
        this.input = document.createElement('input');
        this.input.className = 'cell-editor';
        this.input.style.display = 'none';
        this.grid.container.appendChild(this.input);

        this.input.addEventListener('blur', () => this.saveEdit());

        //This line makes the container focusable by JavaScript or keyboard.
        this.grid.container.tabIndex = 0;
        // tabIndex is an HTML attribute (or JS property) that controls whether an element can be focused or not, and the order in which elements receive focus when the user presses the Tab key.

        this.grid.container.focus();
        this.editingCell = null;
    }

    showEditor() {
        // Calculate cell position

        const colIdx = this.grid.selection.anchor.col;
        const rowIdx = this.grid.selection.anchor.row;
        if (colIdx == null || rowIdx == null) return;
        console.log("showEditor called with rowIdx:", rowIdx, "colIdx:", colIdx);

        let sumX = this.grid.sumX - this.grid.scrollX;
        for (let j = this.grid.startCol; j < colIdx; j++) sumX += this.grid.columns[j].width;
        let sumY = this.grid.sumY - this.grid.scrollY;
        for (let i = this.grid.startRow; i < rowIdx; i++) sumY += this.grid.rows[i].height;

        const headerHeight = 25;
        const sideWidth = 50;
        const exelHeaderHeight = 50;
        this.input.style.left = (sumX + sideWidth) + 'px';
        this.input.style.top = (sumY + headerHeight + exelHeaderHeight + 1) + 'px';
        this.input.style.width = this.grid.columns[colIdx].width - 3 + 'px';
        this.input.style.height = this.grid.rows[rowIdx].height - 1 + 'px';
        this.input.style.display = 'block';

        // Set value
        const keys = Object.keys(this.grid.data[0] || {});
        let key = keys[colIdx];
        const colKey = AppString.Col + colIdx;
        let value = AppString.emptyString;
        if (rowIdx === 0) {
            value = key ? key.toUpperCase() : AppString.emptyString;
        } else if (this.grid.hashMap[rowIdx] && this.grid.hashMap[rowIdx][colKey] !== undefined) {
            value = this.grid.hashMap[rowIdx][colKey];
        }
        this.input.value = value;
        this.input.focus();

        this.editingCell = { rowIdx, colIdx, key };
        this.grid.scheduleRender();
    }

    saveEdit() {
    if (!this.editingCell) return;
    const { rowIdx, colIdx } = this.editingCell;
    const colKey = AppString.Col + colIdx;
    const newValue = this.input.value; // <-- define newValue here

    if (rowIdx === 0) {
        // For header row, update the key in data[0]
        const keys = Object.keys(this.grid.data[0] || {});
        const oldKey = keys[colIdx];
        if (oldKey && newValue && oldKey !== newValue) {
            for (let i = 0; i < this.grid.data.length; i++) {
                if (this.grid.data[i][oldKey] !== undefined) {
                    this.grid.data[i][newValue] = this.grid.data[i][oldKey];
                    delete this.grid.data[i][oldKey];
                }
            }
        }
    } else {
        if (!this.grid.hashMap[rowIdx]) this.grid.hashMap[rowIdx] = {};
        const oldValue = this.grid.hashMap[rowIdx][colKey] || AppString.emptyString;

        // Create a command to save the edit
        const cmd = new CellEditCommand(this.grid, rowIdx, colIdx, oldValue, newValue);
        this.grid.executeCommand(cmd);
    }

    this.input.style.display = 'none';
    this.editingCell = null;
}

    cancelEdit() {
        this.input.style.display = 'none';
        this.editingCell = null;
        this.grid.scheduleRender();
    }
}