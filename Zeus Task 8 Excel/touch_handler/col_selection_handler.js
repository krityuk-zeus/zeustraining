import Grid from "../Core/grid.js";

/**
 * Handles column resizing when the user drags near the edge of a column in the header canvas.
 */
export default class ColSelectionHandler {
    /**
     * @param {Grid} grid - The grid instance to manage column resizing.
     */
    constructor(grid) {
        /**
         * Reference to the grid instance.
         * @type {Grid}
         */
        this.grid = grid;

        /**
         * The index of the column being resized, or null if not resizing.
         * @type {number|null}
         */
        this.resizingCol = null;

        /**
         * The initial X coordinate of the pointer when resizing starts.
         * @type {number|null}
         */
        this.startX = null;

        /**
         * The initial width of the column being resized.
         * @type {number|null}
         */
        this.startWidth = null;
    }

    /**
     * Determines if the pointer event is near a column edge and should trigger resizing.
     * @param {PointerEvent} e - The pointer event.
     * @returns {boolean} True if near a column edge, false otherwise.
     */
    hitTest(e) {
        if (e.target !== this.grid.headerCanvas) return false;
        const rect = this.grid.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        // Use cached visible columns for faster lookup
        let left = this.grid.sumX - this.grid.container.scrollLeft;
        for (let j = this.grid.startCol; j < this.grid.endCol; j++) {
            const col = this.grid.columns[j];
            // Check left edge (not for first column)
            if (j > this.grid.startCol && Math.abs(x - left) < 5) {
                this.resizingCol = j - 1;
                return false;
            }
            // Check right edge (for all columns except last pixel after last col)
            if (Math.abs(x - (left + col.width)) < 5) {
                this.resizingCol = j;
                return false;
            }
            left += col.width;
        }
        return true;
    }

    /**
     * Handles the start of a column selection operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.grid.selection.type = 'col-selection'; // Set selection type to column-selection
        this.grid.input.style.display = 'none'; // Hide input to prevent focus issues
        const rect = this.grid.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scrollX = this.grid.container.scrollLeft;

        // Use cached visible columns for faster lookup
        // left is the starting X position of the first visible column. (sumX-scrollX)
        let left = this.grid.sumX - scrollX;
        let colIdx = this.grid.startCol;
        for (let j = this.grid.startCol; j < this.grid.endCol; j++) {
            const col = this.grid.columns[j];
            if (x < left + col.width) {
                colIdx = j;
                break;
            }
            left += col.width;
        }

        // this.grid.isHeaderSelecting = true;
        this.grid.headerSelectStartCol = colIdx;
        this.grid.headerSelectEndCol = colIdx;
        this.grid.selection.start(0, colIdx);
        this.grid.selection.update(this.grid.totalRows - 1, colIdx);
        this.grid.scheduleRender();
    }

    /**
     * Handles pointer movement during column selection.
     * @param {PointerEvent} e - The pointer move event.
     */
    onPointerMove(e) {
        // if (!this.grid.isHeaderSelecting) return;
        const rect = this.grid.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scrollX = this.grid.container.scrollLeft;

        // Use cached visible columns for faster lookup
        let left = this.grid.sumX - scrollX;
        let colIdx = this.grid.startCol;
        for (let j = this.grid.startCol; j < this.grid.endCol; j++) {
            const col = this.grid.columns[j];
            if (x < left + col.width) {
                colIdx = j;
                break;
            }
            left += col.width;
        }
        if (colIdx >= this.grid.totalCols) colIdx = this.grid.totalCols - 1;

        this.grid.headerSelectEndCol = colIdx;
        const minCol = Math.min(this.grid.headerSelectStartCol, this.grid.headerSelectEndCol);
        const maxCol = Math.max(this.grid.headerSelectStartCol, this.grid.headerSelectEndCol);
        this.grid.selection.start(0, minCol);
        this.grid.selection.update(this.grid.totalRows - 1, maxCol);
        this.grid.scheduleRender();
    }

    /**
     * Handles the end of a column selection operation.
     */
    onPointerUp() {
        // if (this.grid.isHeaderSelecting) {
        //     this.grid.isHeaderSelecting = false;
        // }
    }
}