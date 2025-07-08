/**
 * Command manager that handles execution, undo, and redo operations for grid commands.
 * Implements the Command pattern to provide comprehensive undo/redo functionality.
 */
class Commander {
    /**
     * Creates a new Commander instance.
     * @param {CanvasGrid} grid - The grid instance to manage commands for
     */
    constructor(grid) {
        /**
         * Stack of executed commands available for undo operations.
         * @type {Array<Command>}
         */
        this.undoStack = [];
       
        /**
         * Stack of undone commands available for redo operations.
         * @type {Array<Command>}
         */
        this.redoStack = [];
       
        /**
         * Reference to the grid instance being managed.
         * @type {CanvasGrid}
         */
        this.grid = grid;
       
        /**
         * Grid insertion helper for handling row/column insertion operations.
         * @type {GridInsertion}
         */
        this.gridInsertion = new GridInsertion(this);
    }
 
    /**
     * Executes a command and adds it to the undo stack.
     * Clears the redo stack as new operations invalidate previously undone commands.
     *
     * @param {Command} command - The command to execute
     */
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        this.grid.updateUndoRedoButtons();
    }
 
    /**
     * Checks if undo operation is available.
     *
     * @returns {boolean} True if commands are available for undo, false otherwise
     */
    canUndo() {
        return this.undoStack.length > 0;
    }
 
    /**
     * Checks if redo operation is available.
     *
     * @returns {boolean} True if commands are available for redo, false otherwise
     */
    canRedo() {
        return this.redoStack.length > 0;
    }
 
    /**
     * Undoes the last executed command.
     * Moves the command from undo stack to redo stack.
     */
    undo() {
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }
 
    /**
     * Redoes the last undone command.
     * Moves the command from redo stack back to undo stack.
     */
    redo() {
        const command = this.redoStack.pop();
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
    }
}
 
/**
 * Command for editing cell values with undo/redo support.
 * Captures the old value automatically for proper undo functionality.
 */
class EditCellCommand {
    /**
     * Creates a new EditCellCommand.
     * Automatically captures the current cell value for undo operations.
     *
     * @param {CanvasGrid} grid - The grid instance
     * @param {number} row - Row index of the cell to edit
     * @param {number} col - Column index of the cell to edit
     * @param {string} newValue - New value to set in the cell
     */
    constructor(grid, row, col, newValue) {
        /**
         * Reference to the grid instance.
         * @type {CanvasGrid}
         */
        this.grid = grid;
       
        /**
         * Row index of the cell being edited.
         * @type {number}
         */
        this.row = row;
       
        /**
         * Column index of the cell being edited.
         * @type {number}
         */
        this.col = col;
       
        /**
         * New value to set in the cell.
         * @type {string}
         */
        this.newValue = newValue;
       
        /**
         * Original value of the cell before editing (for undo).
         * @type {string}
         */
        this.oldValue = grid.getCell(row, col).getValue();
    }
 
    /**
     * Executes the cell edit operation.
     * Sets the new value in the specified cell.
     */
    execute() {
        this.grid.setCellValue(this.row, this.col, this.newValue);
    }
 
    /**
     * Undoes the cell edit operation.
     * Restores the original value in the specified cell.
     */
    undo() {
        this.grid.setCellValue(this.row, this.col, this.oldValue);
    }
}
/**
 * Command for resizing rows with proper undo/redo support.
 * Handles cache rebuilding and grid updates for consistent state.
 */
class ResizeRowCommand {
    /**
     * Creates a new ResizeRowCommand.
     * @param {CanvasGrid} grid - The grid instance
     * @param {number} rowIndex - Index of the row to resize
     * @param {number} newSize - New size for the row
     * @param {number} oldSize - Previous size for undo operation
     */
    constructor(grid, rowIndex, newSize, oldSize) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.newSize = newSize;
        this.oldSize = oldSize;
    }
 
    /**
     * Executes the resize operation.
     * Updates row size and rebuilds all necessary caches.
     */
    execute() {
        this.grid.getRow(this.rowIndex).setSize(this.newSize);
        this.rebuildGridCaches();
    }
 
    /**
     * Undoes the resize operation.
     * Reverts to old size and rebuilds all necessary caches.
     */
    undo() {
        this.grid.getRow(this.rowIndex).setSize(this.oldSize);
        this.rebuildGridCaches();
    }
 
    /**
     * Rebuilds all grid caches and updates the display.
     * Called after both execute and undo to ensure consistent state.
     */
    rebuildGridCaches() {
        // Rebuild position caches for accurate positioning
        this.grid.buildPositionCaches();
       
        // Update scroll area bounds
        this.grid.setupScrollArea();
       
        // Recalculate which cells are visible
        this.grid.calculateVisibleRange();
       
        // Update any UI displays that show grid information
        this.grid.updateInfoDisplay();
       
        // Request a complete re-render
        this.grid.requestRender();
    }
 
 
}
 
/**
 * Command for resizing columns with proper undo/redo support.
 * Handles cache rebuilding and grid updates for consistent state.
 */
class ResizeColCommand {
    /**
     * Creates a new ResizeColCommand.
     * @param {CanvasGrid} grid - The grid instance
     * @param {number} colIndex - Index of the column to resize
     * @param {number} newSize - New size for the column
     * @param {number} oldSize - Previous size for undo operation
     */
    constructor(grid, colIndex, newSize, oldSize) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.newSize = newSize;
        this.oldSize = oldSize;
    }
 
    /**
     * Executes the resize operation.
     * Updates column size and rebuilds all necessary caches.
     */
    execute() {
        this.grid.getColumn(this.colIndex).setSize(this.newSize);
        this.rebuildGridCaches();
    }
 
    /**
     * Undoes the resize operation.
     * Reverts to old size and rebuilds all necessary caches.
     */
    undo() {
        this.grid.getColumn(this.colIndex).setSize(this.oldSize);
        this.rebuildGridCaches();
    }
 
    /**
     * Rebuilds all grid caches and updates the display.
     * Called after both execute and undo to ensure consistent state.
     */
    rebuildGridCaches() {
        // Rebuild position caches for accurate positioning
        this.grid.buildPositionCaches();
       
        // Update scroll area bounds
        this.grid.setupScrollArea();
       
        // Recalculate which cells are visible
        this.grid.calculateVisibleRange();
       
        // Update any UI displays that show grid information
        this.grid.updateInfoDisplay();
       
        // Request a complete re-render
        this.grid.requestRender();
    }
 
}
 
 
class InsertRowCommand {
    /**
     * Creates a new InsertRowCommand.
     *
     * @param {CanvasGrid} grid - The grid instance
     * @param {number} rowIndex - Index where to insert the row(s)
     * @param {string} [position='above'] - 'above' or 'below' the specified index
     * @param {boolean} [useSelectionCount=false] - Whether to insert multiple rows based on selection
     */
    constructor(grid, rowIndex, position = 'above', useSelectionCount = false) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.position = position;
        this.useSelectionCount = useSelectionCount;
        this.actualInsertIndex = position === 'above' ? rowIndex : rowIndex + 1;
       
        // Determine how many rows to insert
        this.insertCount = 1;
        if (useSelectionCount) {
            const selection = grid.selection.getCurrentSelection();
            const selectionType = grid.selection.activeSelection.selectionType;
           
            switch (selectionType) {
                case 'row':
                    this.insertCount = grid.selection.rowSelection.selectedRows.size;
                    break;
                case 'cell':
                    if (selection) {
                        this.insertCount = selection.endRow - selection.startRow + 1;
                    }
                    break;
                default:
                    this.insertCount = 1;
            }
        }
    }
 
    /**
     * Executes the row insertion command.
     */
    execute() {
        if (this.useSelectionCount) {
            // Use selection-based insertion with direction
            this.grid.gridInsertion.insertRowsBasedOnSelection(this.actualInsertIndex, this.position);
        } else {
            // Single row insertion
            this.grid.gridInsertion.insertMultipleRows(this.actualInsertIndex, this.insertCount, this.position);
        }
    }
 
    /**
     * Undoes the row insertion command.
     */
    undo() {
        if (this.insertCount > 1) {
            this.grid.gridInsertion.deleteMultipleRows(this.actualInsertIndex, this.insertCount);
        } else {
            this.grid.deleteRow(this.actualInsertIndex);
        }
    }
 
 
}
 
class InsertColCommand {
    /**
     * Creates a new InsertColCommand.
     *
     * @param {CanvasGrid} grid - The grid instance
     * @param {number} colIndex - Index where to insert the column(s)
     * @param {string} [position='left'] - 'left' or 'right' of the specified index
     * @param {boolean} [useSelectionCount=false] - Whether to insert multiple columns based on selection
     */
    constructor(grid, colIndex, position = 'left', useSelectionCount = false) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.position = position;
        this.useSelectionCount = useSelectionCount;
        this.actualInsertIndex = position === 'left' ? colIndex : colIndex + 1;
       
        // Determine how many columns to insert
        this.insertCount = 1;
        if (useSelectionCount) {
            const selection = grid.selection.getCurrentSelection();
            const selectionType = grid.selection.activeSelection.selectionType;
           
            switch (selectionType) {
                case 'column':
                    this.insertCount = grid.selection.columnSelection.selectedColumns.size;
                    break;
                case 'cell':
                    if (selection) {
                        this.insertCount = selection.endCol - selection.startCol + 1;
                    }
                    break;
                default:
                    this.insertCount = 1;
            }
        }
    }
 
    /**
     * Executes the column insertion command.
     */
    execute() {
        if (this.useSelectionCount) {
            // Use selection-based insertion with direction
            this.grid.gridInsertion.insertColumnsBasedOnSelection(this.actualInsertIndex, this.position);
        } else {
            // Single column insertion
            this.grid.gridInsertion.insertMultipleColumns(this.actualInsertIndex, this.insertCount, this.position);
        }
    }
 
    /**
     * Undoes the column insertion command.
     */
    undo() {
        if (this.insertCount > 1) {
            this.grid.gridInsertion.deleteMultipleColumns(this.actualInsertIndex, this.insertCount);
        } else {
            this.grid.deleteColumn(this.actualInsertIndex);
        }
    }
 
 
}
 