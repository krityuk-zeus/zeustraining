export default class Selection {
    constructor(grid) {
        this.clear();
        this.type = 'cell'; // Default selection type // its values can be --> cell or col-selection or row-selection
        this.grid = grid;
    }

    // Start selection at (row, col)
    start(row, col) {
        this.anchor = { row, col };
        this.focus = { row, col };
    }

    // Update selection focus (e.g., on mouse drag)
    update(row, col) {
        this.focus = { row, col };
    }

    // Clear selection
    clear() {
        this.anchor = null;
        this.focus = null;
    }

    // Get all selected cell coordinates as array of {row, col}
    getSelectedCells() {
        if (!this.anchor || !this.focus) return [];
        const minRow = Math.min(this.anchor.row, this.focus.row);
        const maxRow = Math.max(this.anchor.row, this.focus.row);
        const minCol = Math.min(this.anchor.col, this.focus.col);
        const maxCol = Math.max(this.anchor.col, this.focus.col);
        const cells = [];
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                cells.push({ row: r, col: c });
            }
        }
        return cells;
    }

    // Check if a cell is selected
    isSelected(row, col) {
        if (!this.anchor || !this.focus) return false;
        const minRow = Math.min(this.anchor.row, this.focus.row);
        const maxRow = Math.max(this.anchor.row, this.focus.row);
        const minCol = Math.min(this.anchor.col, this.focus.col);
        const maxCol = Math.max(this.anchor.col, this.focus.col);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    }
    // Handle keydown events for selection
    onKeyDown(e) {
        console.log("Key down event of selection.js called");

        let row = this.anchor.row;
        let col = this.anchor.col;

        // Shift+Arrow for multi-cell selection
        if (e.shiftKey) {
            switch (e.key) {
                case 'ArrowUp':
                    if (row > 0) this.focus = { row: this.anchor-1, col };
                    break;
                case 'ArrowDown':
                    if (row < this.grid.rows.length - 1) this.focus = { row: row + 1, col };
                    break;
                case 'ArrowLeft':
                    if (col > 0) this.focus = { row, col: col - 1 };
                    break;
                case 'ArrowRight':
                    if (col < this.grid.columns.length - 1) this.focus = { row, col: col + 1 };
                    break;
                default:
                    return;
            }
            // Anchor stays, focus moves, so selection expands/contracts
        } else {
            // Arrow keys, Enter, Tab: move to single cell, clear previous selection
            // this.grid.cellEditor.saveEdit();
            switch (e.key) {
                case 'ArrowUp':
                    if (row > 0) row--;
                    break;
                case 'ArrowDown':
                    if (row < this.grid.rows.length - 1) row++;
                    break;
                case 'ArrowLeft':
                    if (col > 0) col--;
                    break;
                case 'ArrowRight':
                    if (col < this.grid.columns.length - 1) col++;
                    break;
                case 'Enter':
                    if (row < this.grid.rows.length - 1) row++;
                    break;
                case 'Tab':
                    if (col < this.grid.columns.length - 1) col++;
                    break;
                case 'Escape':
                    this.clear();
                    e.preventDefault();
                    this.grid.scheduleRender();
                    return;
                default:
                    return;
            }
            this.anchor = { row, col };
            this.focus = { row, col };
        }

        e.preventDefault();

    }
}
