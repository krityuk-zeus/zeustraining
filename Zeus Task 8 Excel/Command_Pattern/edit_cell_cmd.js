import Command from "./cmd_interface.js";

export default class CellEditCommand extends Command {
    constructor(grid, row, col, oldValue, newValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    execute() {
        this.grid.setCellValue(this.row, this.col, this.newValue, false); // false: don't record again
    }
    undo() {
        this.grid.setCellValue(this.row, this.col, this.oldValue, false);
    }
}