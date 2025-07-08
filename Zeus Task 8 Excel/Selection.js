export default class Selection {
    constructor() {
        this.clear();
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
}
