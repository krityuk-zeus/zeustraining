import AppString from "../AppString/appstring.js";
import Grid from "../Core/grid.js";

/**
 * Handles column resizing when the user drags near the edge of a column in the header canvas.
 */
export default class ColResizeHandler {
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
        // left is the left edge of the starting column.
        let left = this.grid.sumX - this.grid.scrollX;
        for (let j = this.grid.startCol; j < this.grid.endCol; j++) {
            const col = this.grid.columns[j];
            // Check left edge (not for first column)
            if (j > 0 && Math.abs(x - left) < 5) {
                this.resizingCol = j - 1;
                return true;
            }
            // Check right edge (for all columns except last pixel after last col)
            if (Math.abs(x - (left + col.width)) < 5) {
                this.resizingCol = j;
                return true;
            }
            left += col.width;
        }
        return false;
    }

    /**
     * Handles the start of a column resize operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.grid.isColResizing = true;
        this.setResizeCursor();
        this.startX = e.clientX;
        this.startWidth = this.grid.columns[this.resizingCol].width;
        e.preventDefault();
    }

    /**
     * Handles pointer movement during column resizing.
     * @param {PointerEvent} e - The pointer move event.
    */
    onPointerMove(e) {
        if (this.resizingCol === null) return;
        const dx = e.clientX - this.startX;
        let newWidth = Math.max(30, this.startWidth + dx); // Minimum width 30px
        this.grid.columns[this.resizingCol].width = newWidth;
        this.grid.resizeCanvas();
    }

    /**
     * Handles the end of a column resize operation.
    */
    onPointerUp() {
        if (this.resizingCol === null) return;
        this.resetResizeCursor();
        this.grid.isColResizing = null;
        this.resizingCol = null;
        this.startX = null;
        this.startWidth = null;
    }

    setResizeCursor() {
        document.body.style.cursor = 'ew-resize';
        this.grid.headerCanvas.style.cursor = 'ew-resize';
        this.grid.canvas.style.cursor = 'ew-resize';
        this.grid.sideCanvas.style.cursor = 'ew-resize';
    }
    resetResizeCursor() {
        document.body.style.cursor = AppString.EmptyString;
        this.grid.headerCanvas.style.cursor = AppString.EmptyString;
        this.grid.canvas.style.cursor = AppString.EmptyString;
        this.grid.sideCanvas.style.cursor = AppString.EmptyString;
    }
}