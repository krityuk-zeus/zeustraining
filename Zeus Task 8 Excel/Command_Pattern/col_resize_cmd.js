import Command from "./cmd_interface.js";

export default class ColResizeCommand extends Command {
    constructor(grid, colIdx, oldWidth, newWidth) {
        super();
        this.grid = grid;
        this.colIdx = colIdx;
        this.oldWidth = oldWidth;
        this.newWidth = newWidth;
    }
    execute() {
        this.grid.columns[this.colIdx].width = this.newWidth;
        this.grid.resizeCanvas();
    }
    undo() {
        this.grid.columns[this.colIdx].width = this.oldWidth;
        this.grid.resizeCanvas();
    }
}