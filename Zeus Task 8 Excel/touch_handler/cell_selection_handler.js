export default class CellSelectionHandler {
    /**
     * Initializes the CellSelectionHandler with reference to the grid.
     * 
     * @param {Grid} grid - The grid instance to manage cell selection.
     */
    constructor(grid) {
        this.grid = grid;

       // for auto-scroll during selection
       this._lastPointerEvent = null;
       this._autoScrollInterval = null;
    }

    hitTest(e) {
        // This handler is always active for cell selection, so it always returns true.
        // Only handle if pointer is on the main grid canvas
        return e.target === this.grid.canvas;
    }

    onPointerDown(e) {
        if (e.button !== 0) return; // Only left mouse button, left button ke liye its 0 mid ke liye 1 right ke liye 2 
        const cell = this.grid.getCellFromMouseEvent(e);
        if (!cell) return;
        this.grid.isSelecting = true;
        this.grid.selection.start(cell.row, cell.col);
        this.grid.scheduleRender();
    }

    onPointerMove(e) {
        if (!this.grid.isSelecting) return;
        const cell = this.grid.getCellFromMouseEvent(e);
        if (!cell) return;
        this.grid.selection.update(cell.row, cell.col);

        // Track the last pointer event for use in auto-scroll interval
        this._lastPointerEvent = e;
        this.setupAutoScroll(e);
        this.grid.scheduleRender();
    }

    onPointerUp() {
        if (!this.grid.isSelecting) return;
        this.grid.isSelecting = false;
        if (this._autoScrollInterval) {
            clearInterval(this._autoScrollInterval);
            this._autoScrollInterval = null;
        }
        this._lastPointerEvent = null;
    }

        /**
    * Handles Excel-like auto-scrolling, which happens during multi cell selection, when pointer is near the edge during selection.
    * @param {PointerEvent} e
    */
    setupAutoScroll(e) {
        if (this._autoScrollInterval) {
            clearInterval(this._autoScrollInterval);
            this._autoScrollInterval = null;
        }
        const rect = this.grid.container.getBoundingClientRect();
        const scrollZone = 30; // px near border
        const scrollSpeed = 30; // px per interval
        let dx = 0, dy = 0;
        if (e.clientY < rect.top + scrollZone) {
            dy = -scrollSpeed;
        } else if (e.clientY > rect.bottom - scrollZone) {
            dy = scrollSpeed;
        }
        if (e.clientX < rect.left + scrollZone) {
            dx = -scrollSpeed;
        } else if (e.clientX > rect.right - scrollZone) {
            dx = scrollSpeed;
        }
        if (dx === 0 && dy === 0) return;
        this._autoScrollInterval = setInterval(() => {
            // Only scroll if not already at the edge
            if (dx < 0 && this.grid.container.scrollLeft > 0) {
                this.grid.container.scrollLeft = Math.max(0, this.grid.container.scrollLeft + dx);
            } else if (dx > 0 && this.grid.container.scrollLeft < this.grid.container.scrollWidth - this.grid.container.clientWidth) {
                this.grid.container.scrollLeft = Math.min(this.grid.container.scrollWidth - this.grid.container.clientWidth, this.grid.container.scrollLeft + dx);
            }
            if (dy < 0 && this.grid.container.scrollTop > 0) {
                this.grid.container.scrollTop = Math.max(0, this.grid.container.scrollTop + dy);
            } else if (dy > 0 && this.grid.container.scrollTop < this.grid.container.scrollHeight - this.grid.container.clientHeight) {
                this.grid.container.scrollTop = Math.min(this.grid.container.scrollHeight - this.grid.container.clientHeight, this.grid.container.scrollTop + dy);
            }
            // --- Update selection to follow auto-scroll ---
            const pointerEvent = this._lastPointerEvent;
            if (!pointerEvent) return;
            const cell = this.grid.getCellFromMouseEvent(pointerEvent);
            if (!cell) return;
            this.grid.selection.update(cell.row, cell.col);
            this.grid.scheduleRender();
        }, 30); // 30ms interval
    }

}