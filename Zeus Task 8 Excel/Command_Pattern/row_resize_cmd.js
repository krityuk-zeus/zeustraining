export default class RowResizeCommand {
    constructor(grid, rowIdx, oldHeight, newHeight) {
        this.grid = grid;
        this.rowIdx = rowIdx;
        this.oldHeight = oldHeight;
        this.newHeight = newHeight;
    }
    execute() {
        this.grid.rows[this.rowIdx].height = this.newHeight;
        this.grid.resizeCanvas();
    }
    undo() {
        this.grid.rows[this.rowIdx].height = this.oldHeight;
        this.grid.resizeCanvas();
    }
}