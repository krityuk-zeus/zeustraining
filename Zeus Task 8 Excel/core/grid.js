import Cell from "../components/cell.js";
import Row from "../components/row.js";
import Column from "../components/column.js";

import CellEditor from '../components/cell_editor.js';

import Selection from "./Selection.js";
import AppString from '../AppString/appstring.js';


import TouchHandler from '../touch_handler/touch_handler.js';
import CellSelectionHandler from "../touch_handler/cell_selection_handler.js";
import ColResizeHandler from "../touch_handler/col_resize_handler.js";
import ColSelectionHandler from "../touch_handler/col_selection_handler.js";
import RowResizeHandler from "../touch_handler/row_resize_handler.js";
import RowSelectionHandler from "../touch_handler/row_selection_handler.js";


/**
 * Grid class represents a grid structure for displaying and interacting with data in a tabular format.
 * It includes features like json-file upload and display, cell editing, resizing, undo-redo, command-patternd and selection.
 * Its constructor injects the canvas, header, and sidebar into the container element.
 */
export default class Grid {
    /**
     * 
     * @param {HTMLDivElement} container 
     * @param {Object[]} data 
     * @param {number} totalRows 
     * @param {number} totalCols 
     */
    constructor(container, data, totalRows = 100000, totalCols = 1000) {

        /**
         * @type {HTMLDivElement} container - The HTML container element where the grid will be rendered.
         * @type {Object[]} data - The initial data to populate the grid, typically an array of objects.
         * @type {number} totalRows - The total number of rows in the grid, default is 100000.
         * @type {number} totalCols - The total number of columns in the grid, default is 1000.
         */
        this.container = container;
        this.data = data;
        this.totalRows = totalRows;
        this.totalCols = totalCols;

        /**
         * @type {HTMLCanvasElement} canvas - The main canvas element for rendering the grid.
         * @type {CanvasRenderingContext2D} ctx - The 2D rendering context for the main canvas.
         * Then giving some css to this canvas tag whivh we are creating here.
        */
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.classList.add("myCanvas");


        /**
         * @type {HTMLCanvasElement} headerCanvas - The canvas element for rendering the column headers (A, B, C, ...).
         * @type {CanvasRenderingContext2D} headerCtx - The 2D rendering context for the header canvas.
         */
        this.headerCanvas = document.createElement("canvas");
        this.headerCtx = this.headerCanvas.getContext("2d");
        this.headerCanvas.classList.add("headerCanvas"); // add css here


        /**
         * @type {HTMLCanvasElement} sideCanvas - The canvas element for rendering the row headers (1, 2, 3, ...).
         * @type {CanvasRenderingContext2D} sideCtx - The 2D rendering context for the side canvas.
         */
        this.sideCanvas = document.createElement("canvas");
        this.sideCtx = this.sideCanvas.getContext("2d");
        this.sideCanvas.classList.add("sideCanvas");


        // Selecting multiple cells feature, code is present below
        /**
         * @type {Selection} selection - The selection object for managing cell selections.
         * @property {boolean} isSelecting - Indicates if the user is currently selecting cells.
         */
        this.selection = new Selection(this);
        this.isSelecting = false;

        /**
         * @type {TouchHandler} touchHandler - An instance of TouchHandler to manage touch events and gestures.
         */
        this.touchHandler = new TouchHandler(this);

        /**
         * Unified Event Listeners of whole grid
         * Adds event listeners to the container for pointer events.
         * These listeners handle pointer down, move, and up events for cell selection, col-row selection and col-row resizing.
         * These functions of this.grid would call touchHandler methods to manage touch interactions.
         */
        this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', () => this.onPointerUp());

        // Registering handlers for touch events
        this.touchHandler.registerHandler(new CellSelectionHandler(this));
        this.touchHandler.registerHandler(new ColResizeHandler(this));
        this.touchHandler.registerHandler(new ColSelectionHandler(this));
        this.touchHandler.registerHandler(new RowSelectionHandler(this));
        this.touchHandler.registerHandler(new RowResizeHandler(this));



        this.isColResizing = null; // Initially no column is being resized
        this.isRowResizing = null; // Initially no column is being resized





        // THIS EVENT LISTENER WOULD NOT BE SHIFTED INTO TOUCHHANDLER
        // TODO : Tackle these later, these should get shifted to touchHandler how
        this.headerCanvas.addEventListener('pointermove', this.handleHeaderpointermove.bind(this));// when mouse would move over header, the cursor would change to resize-cursor, when its edge of any header cell
        this.sideCanvas.addEventListener('pointermove', this.handleSidepointermove.bind(this));



        /**
         * @type{Object} hashMap - The data structure associated to the given excel - to store cell values for quick access.
         */
        this.hashMap = {};


        /**
         * @type {number[]} columns - An array of Column objects representing the columns in the grid.
         * @property {number} width - The width of each column, default is 100 pixels.
         * @type {number[]} rows - An array of Row objects representing the rows in the grid.
         * @property {number} height - The height of each row, default is 25 pixels. 
        */
        this.columns = Array.from({ length: totalCols }, (_, i) => new Column(i, 100));
        this.rows = Array.from({ length: totalRows }, (_, i) => new Row(i, 25));
        // these two lines are just for col row size resize
        // this.columns = [];
        // for (let i = 0; i < totalCols; i++) {
        //     this.columns.push(new Column(i, this.cellWidth));
        // }


        // request Animation Frame
        /**
         * @type {boolean} needsRender - Indicates whether the grid needs to be re-rendered.
         * @property {function} scheduleRender - A function that schedules a render of the grid using requestAnimationFrame.
         */
        this.needsRender = false;
        this.scheduleRender = () => {
            console.log("scheduleRender called");
            if (!this.needsRender) {
                this.needsRender = true;
                requestAnimationFrame(() => {
                    this.renderGrid();
                    this.needsRender = false;
                });
            }
        };


        /**
         * @type {number} virtualWidth - The virtual width of the spacer, calculated based on the total number of columns.
         * @type {number} virtualHeight - The virtual height of the spacer, calculated based on the total number of rows.
         * When the grid is initialized, it creates a spacer element to enable scrolling within the container.
         * When row-resize or col-resize happens, we would be updating the the virtualWidth and virtualHeight accordingly.
         */
        let virtualWidth = totalCols * 100; // CELLWidth and cellHeight are 100 and 0 resp
        let virtualHeight = totalRows * 25;

        // Dummy spacer 
        // Its size is very-very big and is injected into the container
        // So it enables scrolling inside the container
        /**
         * @type {HTMLDivElement} spacer - A spacer element to enable scrolling in the container.
         * @property {string} style.width - The width of the spacer element, calculated based on the total width of the grid.
         * @property {string} style.height - The height of the spacer element, calculated based on the total height of the grid.
         */
        const spacer = document.createElement("div");
        spacer.style.width = virtualWidth + 50 + "px"; // 50 is sidebar width and 25 here is top-header width
        spacer.style.height = virtualHeight + 25 + "px";

        /**
         * @property {HTMLDivElement} container - The main container element for the grid.
         * @property {HTMLCanvasElement} headerCanvas - The canvas element for rendering the column headers.
         * @property {HTMLCanvasElement} sideCanvas - The canvas element for rendering the row headers.
         * @property {HTMLCanvasElement} canvas - The main canvas element for rendering the grid.
         */
        this.container.appendChild(spacer);
        this.container.appendChild(this.headerCanvas);
        this.container.appendChild(this.sideCanvas);
        this.container.appendChild(this.canvas);

        /**
         * Added event listener to the container for scroll events to trigger rendering
         */
        this.container.addEventListener("scroll", this.scheduleRender);

        /**
         * @function resizeCanvas - Resizes the canvas and header/side canvases based on the container size.
         * @property {function} bind - Binds the resizeCanvas function to the current context of the Grid instance.
         * Added event listener to the window for resize events to adjust the canvas size dynamically.
         */
        window.addEventListener("resize", this.resizeCanvas.bind(this)); // resize me .bind(this) likhna padta h warna scroller fixed ho jaega screen par


        /**
         *  At initialization, the resizeCanvas function is called to set the canvas size based on the container dimensions.
         *  Initial setup
         * i.e.. When the constructor is called, the resizeCanvas function gets called here once.
         * To set the canvas size based on the container dimensions at the time of initialization.
         */
        this.resizeCanvas();

        // ***********************************************************************************************************************************************
        // Edit any Cell in Excel UI

        this.cellEditor = new CellEditor(this);
        /**
         * * Adds event listeners to the canvas and input elements for handling cell editing.
         */
        this.canvas.addEventListener('dblclick', (e) => this.cellEditor.showEditor(e)); // adds input tag
        this.container.addEventListener('keydown', this.onKeyDown.bind(this));

    }

    /**
     * destroys the grid instance by removing event listeners, clearing timeouts, and nullifying references.
     */
    destroy() {
        // Remove event listeners
        // Clear timeouts
        // Nullify references
        this.container.innerHTML = AppString.EmptyString; // Clear the container
    }


    /**
     * Resizes thE canvas and header/sideR canvases based on the container size.
     */
    resizeCanvas() {
        const headerHeight = 25;
        const sideWidth = 50;
        const visibleWidth = this.container.clientWidth;
        const visibleHeight = this.container.clientHeight;

        // For image quality while zooming
        let dpr = window.devicePixelRatio || 1;
        if (dpr < 1) dpr = 1;
        // Header Canvas
        this.headerCanvas.width = (visibleWidth - sideWidth) * dpr;
        this.headerCanvas.height = headerHeight * dpr;
        this.headerCanvas.style.width = (visibleWidth - sideWidth) + 'px';
        this.headerCanvas.style.height = headerHeight + 'px';
        this.headerCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.headerCtx.scale(dpr, dpr);

        // Side Canvas
        this.sideCanvas.width = sideWidth * dpr;
        this.sideCanvas.height = (visibleHeight - headerHeight) * dpr;
        this.sideCanvas.style.width = sideWidth + 'px';
        this.sideCanvas.style.height = (visibleHeight - headerHeight) + 'px';
        this.sideCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.sideCtx.scale(dpr, dpr);

        // Main Grid Canvas
        this.canvas.width = (visibleWidth - sideWidth) * dpr;
        this.canvas.height = (visibleHeight - headerHeight) * dpr;
        this.canvas.style.width = (visibleWidth - sideWidth) + 'px';
        this.canvas.style.height = (visibleHeight - headerHeight) + 'px';
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);


        this.scheduleRender();
    }

    renderGrid() {
        const scrollX = this.container.scrollLeft; // left towards right kitna scroll kra ha, starting me ye zero rhega
        const scrollY = this.container.scrollTop;  // top se kitna scroll kra h neeche ke taraf / simply means top-left pixel of scroll-container

        let startCol = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > scrollX) break; // const startCol = Math.floor(scrollX / 100);
            sumX += col.width;
            startCol++;
        }
        // const endCol = Math.min(startCol + 20, this.totalCols); //at most 20col on screen possible
        let endCol = startCol;
        let visibleWidth = this.canvas.width / (window.devicePixelRatio || 1); // in CSS pixels
        let xSum = 0;
        for (let j = startCol; j < this.totalCols; j++) {
            xSum += this.columns[j].width;
            if (xSum > visibleWidth) {
                endCol = j + 1; // endCol is enclusive in my whole code, so j+1 is used
                break;
            }
        }
        if (xSum <= visibleWidth) {
            endCol = this.totalCols;
        }
        // const endCol = Math.min(startCol + 20, this.totalCols); //at most 20col on screen possible

        let startRow = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > scrollY) break;
            sumY += row.height;
            startRow++;
        }
        // const endRow = Math.min(startRow + 40, this.totalRows);
        let endRow = startRow;
        let visibleHeight = this.canvas.height / (window.devicePixelRatio || 1); // in CSS pixels
        let ySum = 0;
        for (let i = startRow; i < this.totalRows; i++) {
            ySum += this.rows[i].height;
            if (ySum > visibleHeight) {
                endRow = i + 1; // include the partially visible row
                break;
            }
        }
        if (ySum <= visibleHeight) {
            endRow = this.totalRows;
        }
        // const endRow = Math.min(startRow + 40, this.totalRows);

        // Save to instance
        /**
         * 
         * @param {number} startCol - The starting column index for rendering cells.
         * @param {number} endCol - The ending column index for rendering cells. : endCol and endRow are exclusive in my grid class
         * @param {number} startRow - The starting row index for rendering cells.
         * @param {number} endRow  - The ending row index for rendering cells.
         * @param {number} sumX - The cumulative width of columns up to the starting column.
         * @param {number} sumY - The cumulative height of rows up to the starting row.
         * @param {number} scrollX - The horizontal scroll position of the grid.
         * @param {number} scrollY - The vertical scroll position of the grid.
         */
        this.startCol = startCol;
        this.endCol = endCol;
        this.sumX = sumX;
        this.startRow = startRow;
        this.endRow = endRow;
        this.sumY = sumY;
        this.scrollX = scrollX;
        this.scrollY = scrollY;

        this.renderCells();
        this.renderHeader();
        this.renderSider();

    }


    /**
     * Renders the cells in the grid based on the current viewport.
     * Also painting the selected cells with a different background color.
     */
    renderCells() {
        // Draw Cells
        this.ctx.clearRect(0.5, 0.5, this.canvas.width, this.canvas.height);
        this.ctx.font = "13px Arial";

        let y = this.sumY - this.scrollY;
        for (let i = this.startRow; i < this.endRow; i++) {
            let x = this.sumX - this.scrollX;
            let drawHeight = this.rows[i].height;
            // Clip last visible row if needed
            if (i === this.endRow - 1) {
                let maxVisibleY = this.canvas.height / (window.devicePixelRatio || 1);
                let remainingHeight = maxVisibleY - (y - (this.sumY - this.scrollY));
                drawHeight = Math.max(0, Math.min(drawHeight, remainingHeight));
            }
            for (let j = this.startCol; j < this.endCol; j++) {
                const colKey = AppString.Col + j;
                if (!this.hashMap[i]) this.hashMap[i] = {};
                if (this.hashMap[i][colKey] === undefined) {
                    if (i > 0 && this.data[i - 1] && Object.values(this.data[i - 1])[j] !== undefined) {
                        this.hashMap[i][colKey] = Object.values(this.data[i - 1])[j];
                    } else {
                        this.hashMap[i][colKey] = AppString.emptyString;
                    }
                }
                let cellData = AppString.emptyString;
                if (i === 0) {
                    if (this.data[0]) {
                        const keys = Object.keys(this.data[0]);
                        cellData = keys[j] ? keys[j].toUpperCase() : AppString.emptyString;
                    }
                } else {
                    cellData = this.hashMap[i][colKey];
                }

                // Clip last visible column if needed
                let drawWidth = this.columns[j].width;
                if (j === this.endCol - 1) {
                    let maxVisibleX = this.canvas.width / (window.devicePixelRatio || 1);
                    let remainingWidth = maxVisibleX - (x - (this.sumX - this.scrollX));
                    drawWidth = Math.max(0, Math.min(drawWidth, remainingWidth));
                }

                // --- Selecting multiple cells feature ---
                if (this.selection && this.selection.isSelected(i, j)) {
                    if (!(i === this.selection.anchor.row && j === this.selection.anchor.col)) {
                        this.ctx.fillStyle = "#E7F1EC";
                        this.ctx.fillRect(x, y, drawWidth, drawHeight);
                    }
                }

                const cell = new Cell(this.rows[i], this.columns[j]);
                cell.drawCell(this.ctx, x, y, drawWidth, drawHeight, cellData);

                x += this.columns[j].width;
            }
            y += this.rows[i].height;
        }

        // --- Selecting multiple cells feature ---
        // Draw green border around selection (like Excel)
        if (this.selection && this.selection.anchor && this.selection.focus) {
            const minRow = Math.min(this.selection.anchor.row, this.selection.focus.row);
            const maxRow = Math.max(this.selection.anchor.row, this.selection.focus.row);
            const minCol = Math.min(this.selection.anchor.col, this.selection.focus.col);
            const maxCol = Math.max(this.selection.anchor.col, this.selection.focus.col);

            // Clamp selection to visible viewport
            const visibleMinRow = Math.max(minRow, this.startRow);
            const visibleMaxRow = Math.min(maxRow, this.endRow - 1);
            const visibleMinCol = Math.max(minCol, this.startCol);
            const visibleMaxCol = Math.min(maxCol, this.endCol - 1);

            if (visibleMinRow < this.endRow && visibleMaxRow >= this.startRow && visibleMinCol < this.endCol && visibleMaxCol >= this.startCol) {
                let borderX = this.sumX - this.scrollX;
                for (let j = this.startCol; j < visibleMinCol; j++)
                    borderX += this.columns[j].width;
                let borderY = this.sumY - this.scrollY;
                for (let i = this.startRow; i < visibleMinRow; i++)
                    borderY += this.rows[i].height;
                let borderW = 0;
                for (let j = visibleMinCol; j <= visibleMaxCol; j++)
                    borderW += this.columns[j].width;
                let borderH = 0;
                for (let i = visibleMinRow; i <= visibleMaxRow; i++)
                    borderH += this.rows[i].height;

                this.ctx.save();
                this.ctx.strokeStyle = "#107C41"; // Excel green
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(borderX - 1, borderY - 1, borderW + 2, borderH + 2);
                // Draw the one small green square at the bottom-right of the green border of selected cells grp
                const handleSize = 8;
                this.ctx.fillStyle = "#107C41";
                this.ctx.fillRect(borderX + borderW - 3, borderY + borderH - 3, handleSize, handleSize);
                this.ctx.restore();
            }
        }
    }


    /**
     * 
     * @param {number} startCol - The starting column index for rendering the header.
     * @param {number} endCol - The ending column index for rendering the header.
     * @param {number} sumX - The cumulative width of columns up to the starting column.
     * @param {number} scrollX - The horizontal scroll position of the grid.
     * Renders the header row of the grid, displaying column labels (A, B, C, ...).
     * It calculates the visible columns based on the current scroll position and draws the headers accordingly.
     * It also handles column selection's highlighting of selected columns.
     */
    renderHeader() {
        // const scrollX = this.container.scrollLeft;
        this.headerCtx.clearRect(0.5, 0.5, this.headerCanvas.width, this.headerCanvas.height);
        this.headerCtx.font = '13px Arial';
        this.headerCtx.textAlign = 'center';
        this.headerCtx.textBaseline = 'middle';

        /**
         * x is for drawRect function to draw the header cells, at the correct horizontal position
         */
        let x = this.sumX - this.scrollX;
        for (let j = this.startCol; j < this.endCol; j++) {
            const colLabel = this.colToLetter(j);
            const colWidth = this.columns[j].width;

            // 1. Check if header selection is active for this column
            let isColumnSelection = false;
            if (this.selection.type === "col-selection" && this.headerSelectStartCol !== undefined && this.headerSelectEndCol !== undefined) {
                const minCol = Math.min(this.headerSelectStartCol, this.headerSelectEndCol);
                const maxCol = Math.max(this.headerSelectStartCol, this.headerSelectEndCol);
                if (j >= minCol && j <= maxCol) isColumnSelection = true;
            }

            // 2. Check if cell selection is active for this column
            let isCellColSelection = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minCol = Math.min(this.selection.anchor.col, this.selection.focus.col);
                const maxCol = Math.max(this.selection.anchor.col, this.selection.focus.col);
                if (j >= minCol && j <= maxCol)
                    isCellColSelection = true;
            }

            // 3. Paint header cell
            if (isColumnSelection) {
                this.headerCtx.fillStyle = '#107C41'; // dark green
                this.headerCtx.fillRect(x, 0, colWidth, 25);
                this.headerCtx.fillStyle = '#fff'; // white text
                this.headerCtx.fillText(colLabel, x + colWidth / 2, 12.5);
            } else if (isCellColSelection) {
                this.headerCtx.fillStyle = '#CAEAD8'; // light green
                this.headerCtx.fillRect(x, 0, colWidth, 25);
                this.headerCtx.fillStyle = '#222';
                this.headerCtx.fillText(colLabel, x + colWidth / 2, 12.5);
            } else {
                this.headerCtx.fillStyle = '#fff'; // default background
                this.headerCtx.fillRect(x, 0, colWidth, 25);
                this.headerCtx.fillStyle = '#222';
                this.headerCtx.fillText(colLabel, x + colWidth / 2, 12.5);
            }

            // Rectangular Border of header cell
            this.headerCtx.lineWidth = 1;
            this.headerCtx.strokeStyle = '#b0b0b0';
            this.headerCtx.strokeRect(x + 0.5, 0.5, colWidth, 25);

            // Bottom Dark-Green border for selected columns
            if (isColumnSelection || isCellColSelection) {
                this.headerCtx.beginPath();
                this.headerCtx.moveTo(x - 2, 23.5);
                this.headerCtx.lineTo(x + 2 + colWidth, 23.5);
                this.headerCtx.lineWidth = 2;
                this.headerCtx.strokeStyle = '#107C41';
                this.headerCtx.stroke();
            }
            x += colWidth;
            // x is for drawRect function to draw the header cells, at the correct horizontal position
        }
    }


    /**
     * 
     * @param {number} index - The index of the column to convert to a letter.
     * * Converts a column index (0-based) to a letter representation (A, B, C, ...).
     * * For example, 0 -> A, 1 -> B, 26 -> AA, 27 -> AB, etc.
     * @returns {String} - The letter representation of the column index.
     * This function is used only in renderHeader() function to convert column index to letter
     */
    colToLetter(index) {
        let str = AppString.EmptyString;
        do {
            str = String.fromCharCode(65 + (index % 26)) + str;
            index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        return str;
    }

    /**
     * Renders the side header of the grid, displaying row labels (1, 2, 3, ...).
     * It draws only the visible rows based on the current scroll position and viewport.
     * It also handles row selection's highlighting of selected rows.
     *
     * @param {number} startRow - The starting row index for rendering the side header.
     * @param {number} endRow - The ending row index for rendering the side header.
     * @param {number} sumY - The cumulative height of rows up to the starting row.
     * @param {number} scrollY - The vertical scroll position of the grid.
     */
    renderSider() {
        // const scrollY = this.container.scrollTop;
        this.sideCtx.clearRect(0.5, 0.5, this.sideCanvas.width, this.sideCanvas.height);
        this.sideCtx.font = '13px Arial';
        this.sideCtx.textAlign = 'center';
        this.sideCtx.textBaseline = 'middle';


        /**
         * y is for drawRect function to draw the side header cells, at the correct vertical position
         */
        let y = this.sumY - this.scrollY;
        for (let i = this.startRow; i < this.endRow; i++) {
            const rowLabel = (i + 1).toString();
            const rowHeight = this.rows[i].height;

            // Highlight if this row is in the selection is below
            // 1. Check if side selection is active for this row
            let isRowSelection = false;
            if (this.selection.type === "row-selection" && this.sideSelectStartRow !== undefined && this.sideSelectEndRow !== undefined) {
                const minRow = Math.min(this.sideSelectStartRow, this.sideSelectEndRow);
                const maxRow = Math.max(this.sideSelectStartRow, this.sideSelectEndRow);
                if (i >= minRow && i <= maxRow) isRowSelection = true;
            }
            // 2. Check if cell selection is active for this row
            let isCellRowSelection = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minRow = Math.min(this.selection.anchor.row, this.selection.focus.row);
                const maxRow = Math.max(this.selection.anchor.row, this.selection.focus.row);
                if (i >= minRow && i <= maxRow) isCellRowSelection = true;
            }

            // 3. Paint side cell
            if (isRowSelection) {
                this.sideCtx.fillStyle = '#107C41'; // dark green
                this.sideCtx.fillRect(0, y, 50, rowHeight);
                this.sideCtx.fillStyle = '#fff'; // white text
                this.sideCtx.fillText(rowLabel, 25, y + rowHeight / 2);
            } else if (isCellRowSelection) {
                this.sideCtx.fillStyle = '#CAEAD8'; // light green
                this.sideCtx.fillRect(0, y, 50, rowHeight);
                this.sideCtx.fillStyle = '#222';
                this.sideCtx.fillText(rowLabel, 25, y + rowHeight / 2);
            } else {
                this.sideCtx.fillStyle = '#fff'; // default background
                this.sideCtx.fillRect(0, y, 50, rowHeight);
                this.sideCtx.fillStyle = '#222';
                this.sideCtx.fillText(rowLabel, 25, y + rowHeight / 2);
            }

            // Rectangular border of side header cell
            // Draw light gray border around each side header cell
            this.sideCtx.lineWidth = 1;
            this.sideCtx.strokeStyle = '#b0b0b0';
            this.sideCtx.strokeRect(0.5, y + 0.5, 50, rowHeight); // 0.5 is anti-aliasing of canvas drawing


            // Draw dark green right border
            // Right dark green border for selected rows
            // If the row is selected in the side header or in the cell selection
            // then draw a dark green line on the right side of the side header cell
            if (isRowSelection || isCellRowSelection) {
                this.sideCtx.beginPath();
                this.sideCtx.moveTo(48.5, y - 2);
                this.sideCtx.lineTo(48.5, y + rowHeight + 2); // +2 px extra size of dark green line
                this.sideCtx.strokeStyle = '#107C41';
                this.sideCtx.lineWidth = 2;
                this.sideCtx.stroke();
            }

            y += rowHeight;
            // y is for drawRect function to draw the side header cells, at the correct vertical position

        }
    }


    // Functions for editing any cell in excel UI
    /**
     * 
     * @param {*} e 
     * @returns 
     */

    onKeyDown(e) {
        console.log("Key down event of grid.js called");
        if (!this.selection.anchor || !this.selection.focus) return;
        this.selection.onKeyDown(e);
        if (e.key !== 'Escape')
            this.cellEditor.showEditor();
    }



    /**
     * 
     * POINTER HANDLER FUNCTIONS
     * Handles pointer down events on the canvas,headerCanvas and siderCanvas.
     * @param {PointerEvent} e - The pointer event object.
     * 
     */
    onPointerDown(e) {
        this.touchHandler.onPointerDown(e);
    }
    onPointerMove(e) {
        this.touchHandler.onPointerMove(e);
    }
    onPointerUp() {
        this.touchHandler.onPointerUp();
    }


    /**
     * 
     * @param {PointerEvent} e 
     * @returns {null|{row: number, col: number}}
     * This function calculates the row and column indices based on the mouse event coordinates.
     * This func iS for send the mouse event as argument and get row,col number in return
     */
    getCellFromMouseEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        // Find col
        let colIdx = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > x + scrollX) break;
            sumX += col.width;
            colIdx++;
        }
        if (colIdx >= this.totalCols) return null;

        // Find row
        let rowIdx = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.totalRows) return null;

        return { row: rowIdx, col: colIdx };
    }


    /**
     * 
     * @param {PointerEvent} e - Current pointer value where the user is hovering.
     * This function checks if the pointer is near the, left or right edge, of any column, in the header canvas.
     * If it is, it changes the cursor to 'col-resize'.
     * @returns 
     * handleHeaderpointermove wont run if isColResizing is on
     */
    handleHeaderpointermove(e) {
        if (this.isColResizing) return; // Don't change cursor if resizing is on
        if (this.isRowResizing) return; // Don't change cursor if resizing is on
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let left = this.sumX - this.scrollX;
        for (let j = this.startCol; j < this.endCol; j++) {
            const col = this.columns[j];
            if (j > 0 && Math.abs(x - left) < 5 || Math.abs(x - (left + col.width)) < 5) {
                this.headerCanvas.style.cursor = 'ew-resize';
                return;
            }
            left += col.width;
        }
        this.headerCanvas.style.cursor = AppString.emptyString;
    }

    /**
     * 
     * @param {PointerEvent} e - Current pointer value where the user is hovering.
     * This function checks if the pointer is near the top or bottom edge of any row in the side canvas.
     * If it is, it changes the cursor to 'row-resize'.
     */
    handleSidepointermove(e) {
        if (this.isColResizing) return; // Don't change cursor if resizing is on
        if (this.isRowResizing) return; // Don't change cursor if resizing is on
        const rect = this.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        let top = this.sumY - this.scrollY;
        for (let i = this.startRow; i < this.endRow; i++) {
            const row = this.rows[i];
            // Check both top and bottom edges of each row
            if (
                (i > 0 && Math.abs(y - top) < 5) || // top edge (not for first row)
                (Math.abs(y - (top + row.height)) < 5) // bottom edge
            ) {
                this.sideCanvas.style.cursor = 'ns-resize';
                return;
            }
            top += row.height;
        }
        this.sideCanvas.style.cursor = AppString.emptyString;
    }


}