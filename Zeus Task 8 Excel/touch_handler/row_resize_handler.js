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
    hitTest(e) {
        if (e.target !== this.grid.sideCanvas) return false;
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;
        let top = 0;
        for (let i = 0; i < this.grid.rows.length; i++) {
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
            if (top - scrollY > this.grid.sideCanvas.height) break;
        }
        return false;
    }

    /**
     * Handles the start of a row resize operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.startY = e.clientY;
        this.startHeight = this.grid.rows[this.resizingRow].height;
        e.preventDefault();
    }

    /**
     * Handles pointer movement during row resizing.
     * @param {PointerEvent} e - The pointer move event.
     */
    onPointerMove(e) {
        if (this.resizingRow !== null) {
            const dy = e.clientY - this.startY;
            let newHeight = Math.max(15, this.startHeight + dy); // Minimum height 15px
            this.grid.rows[this.resizingRow].height = newHeight;
            this.grid.resizeCanvas();
        }
    }

    /**
     * Handles the end of a row resize operation.
     */
    onPointerUp() {
        if (this.resizingRow !== null) {
            this.resizingRow = null;
            this.startY = null;
            this.startHeight = null;
            this.grid.sideCanvas.style.cursor = AppString.emptyString; // this line resets it to like in style.css
        }
    }
}