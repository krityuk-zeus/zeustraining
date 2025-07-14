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
        // Use cached visible rows for faster lookup
        let top = this.grid.sumY - this.grid.container.scrollTop;
        for (let i = this.grid.startRow; i < this.grid.endRow; i++) {
            const row = this.grid.rows[i];
            // If near top or bottom edge, don't handle (let resize handler take it)
            if ((i > this.grid.startRow && Math.abs(y - top) < 5) ||
                (Math.abs(y - (top + row.height)) < 5)) {
                return false;
            }
            top += row.height;
        }
        return true;
    }

    /**
     * Handles the start of a row selection operation.
     * @param {PointerEvent} e - The pointer down event.
     */
    onPointerDown(e) {
        this.grid.selection.type = 'row-selection'; // Set selection type to row-selection
        this.grid.cellEditor.input.style.display = 'none'; // Hide input to prevent focus issues
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;

        // Use cached visible rows for faster lookup
        let top = this.grid.sumY - scrollY;
        let rowIdx = this.grid.startRow;
        for (let i = this.grid.startRow; i < this.grid.endRow; i++) {
            const row = this.grid.rows[i];
            if (y < top + row.height) {
                rowIdx = i;
                break;
            }
            top += row.height;
        }
        if (rowIdx >= this.grid.totalRows) return;

        // this.grid.isSideSelecting = true;
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
        // if (!this.grid.isSideSelecting) return;
        const rect = this.grid.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.grid.container.scrollTop;

        // Use cached visible rows for faster lookup
        let top = this.grid.sumY - scrollY;
        let rowIdx = this.grid.startRow;
        for (let i = this.grid.startRow; i < this.grid.endRow; i++) {
            const row = this.grid.rows[i];
            if (y < top + row.height) {
                rowIdx = i;
                break;
            }
            top += row.height;
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
        // if (this.grid.isSideSelecting) {
            // this.grid.isSideSelecting = false;
        // }
    }
}