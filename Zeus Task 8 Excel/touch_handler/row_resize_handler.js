import AppString from "../AppString/appstring.js";
import Grid from "../Core/grid.js";

/**
 * Handles row resizing when the user drags near the edge of a row in the side canvas.
 */
export default class RowResizeHandler {
    /**
     * @param {Grid} grid - The grid instance to manage row resizing.
     */
    constructor(grid) {
        /**
         * Reference to the grid instance.
         * @type {Grid}
         */
        this.grid = grid;

        /**
         * The index of the row being resized, or null if not resizing.
         * @type {number|null}
         */
        this.resizingRow = null;

        /**
         * The initial Y coordinate of the pointer when resizing starts.
         * @type {number|null}
         */
        this.startY = null;

        /**
         * The initial height of the row being resized.
         * @type {number|null}
         */
        this.startHeight = null;
    }

    /**
     * Determines if the pointer event is near a row edge and should trigger resizing.
     * @param {PointerEvent} e - The pointer event.
     * @returns {boolean} True if near a row edge, false otherwise.
     */

    // ** TODO   BELOW HAS SOME PROBLEM,  SCROLL DOWN KRO THEN ROW-RESIZE NAHI HORHA
    hitTest(e) {
        if (e.target !== this.grid.sideCanvas) return false;
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        let top = this.grid.sumY - this.grid.scrollY;
        for (let i = this.grid.startRow; i < this.grid.endRow; i++) {
            const row = this.grid.rows[i];
            // Check top edge (not for first row)
            if (i > 0 && Math.abs(y - top) < 5) {
                this.resizingRow = i - 1;
                return true;
            }
            // Check bottom edge (all rows)
            if (Math.abs(y - (top + row.height)) < 5) {
                this.resizingRow = i;
                return true;
            }
            top += row.height;
            console.log("This is funciton htiTest of RowResizeHandler");
            console.log("top: " + top + " scrollY: " + this.grid.scrollY + " height: " + this.grid.sideCanvas.height);
        }
        return false;
    }

    /**
     * Handles the start of a row resize operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.grid.isRowResizing = true; // Set resizing state
        this.setResizeCursor(); // Set cursor to resizing state
        this.startY = e.clientY;
        this.startHeight = this.grid.rows[this.resizingRow].height;
        e.preventDefault();
    }

    /**
     * Handles pointer movement during row resizing.
     * @param {PointerEvent} e - The pointer move event.
    */
    onPointerMove(e) {
        if (this.resizingRow == null) return;
        const dy = e.clientY - this.startY;
        let newHeight = Math.max(15, this.startHeight + dy); // Minimum height 15px
        this.grid.rows[this.resizingRow].height = newHeight;
        this.grid.resizeCanvas();
    }

    /**
     * Handles the end of a row resize operation.
    */
    onPointerUp() {
        if (this.resizingRow == null) return;
        this.resetResizeCursor(); // Reset cursor to default
        this.grid.isRowResizing = null; // Set resizing state
        this.resizingRow = null;
        this.startY = null;
        this.startHeight = null;
        
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