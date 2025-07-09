import Grid from "../Core/grid.js";

/**
 * Handles row selection (not resizing) when the user drags on the side canvas.
 */
export default class RowSelectionHandler {
    /**
     * @param {Grid} grid - The grid instance to manage row selection.
     */
    constructor(grid) {
        /**
         * Reference to the grid instance.
         * @type {Grid}
         */
        this.grid = grid;
    }

    /**
     * Determines if the pointer event is on the side canvas and NOT near a row edge.
     * @param {PointerEvent} e - The pointer event.
     * @returns {boolean} True if in side canvas and not near edge, false otherwise.
     */
    hitTest(e) {
        if (e.target !== this.grid.sideCanvas) return false;
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;
        let top = 0;
        for (let i = 0; i < this.grid.rows.length; i++) {
            const row = this.grid.rows[i];
            // If near top or bottom edge, don't handle (let resize handler take it)
            if ((i > 0 && Math.abs(y - top) < 5) ||
                (Math.abs(y - (top + row.height)) < 5)) {
                return false;
            }
            top += row.height;
            if (top - scrollY > this.grid.sideCanvas.height) break;
        }
        return true;
    }

    /**
     * Handles the start of a row selection operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.grid.selection.type = 'row-selection'; // Set selection type to row-selection
        this.grid.input.style.display = 'none'; // Hide input to prevent focus issues
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;
        let rowIdx = 0, sumY = 0;
        for (const row of this.grid.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.grid.totalRows) return;
        this.grid.isSideSelecting = true;
        this.grid.sideSelectStartRow = rowIdx;
        this.grid.sideSelectEndRow = rowIdx;
        this.grid.selection.start(rowIdx, 0);
        this.grid.selection.update(rowIdx, this.grid.totalCols - 1);
        this.grid.scheduleRender();
    }

    /**
     * Handles pointer movement during row selection.
     * @param {PointerEvent} e - The pointer move event.
     */
    onPointerMove(e) {
        if (!this.grid.isSideSelecting) return;
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;
        let rowIdx = 0, sumY = 0;
        for (const row of this.grid.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.grid.totalRows) rowIdx = this.grid.totalRows - 1;
        this.grid.sideSelectEndRow = rowIdx;
        const minRow = Math.min(this.grid.sideSelectStartRow, this.grid.sideSelectEndRow);
        const maxRow = Math.max(this.grid.sideSelectStartRow, this.grid.sideSelectEndRow);
        this.grid.selection.start(minRow, 0);
        this.grid.selection.update(maxRow, this.grid.totalCols - 1);
        this.grid.scheduleRender();
    }

    /**
     * Handles the end of a row selection operation.
     */
    onPointerUp() {
        if (this.grid.isSideSelecting) {
            this.grid.isSideSelecting = false;
        }
    }
}