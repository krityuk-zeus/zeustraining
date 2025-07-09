export default class RowSelectionHandler {
    constructor(grid) {
        this.grid = grid;
    }

    hitTest(e) {
        // Only handle if pointer is on the header canvas and not near a Rowumn edge
        if (e.target !== this.grid.sideCanvas) return false;
        
        // TODO : Add logic to check if pointer is near a Row edge
        // Return false if so, else true
    }

    onPointerDown(e) { /* ... */ }
    onPointerMove(e) { /* ... */ }
    onPointerUp() { /* ... */ }
}