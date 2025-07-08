import Cell from "./cell.js";
import Row from "./row.js";
import Column from "./column.js";
import Selection from "./Selection.js";
import AppString from './appstring.js';


/**
 * Grid class represents a grid structure for displaying and interacting with data in a tabular format.
 * It includes features like json-file upload and display, cell editing, resizing, undo-redo, command-patternd and selection.
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
        */
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");


        this.canvas.classList.add("myCanvas"); // give some css to this canvas tag whivh we are creating here, yahi canvas ele baar baar inject krenge onrender me

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
        this.selection = new Selection();
        this.isSelecting = false;

        /**
         * Handles the start of a cell selection when the user presses down on the main grid canvas.
         * brings border at selected-cell
         * Handles cell selection movement as the user moves the pointer.
         * Handles the end of a cell selection when the user releases the pointer.
         */
        this.canvas.addEventListener('pointerdown', this.handleSelectionStart.bind(this));
        window.addEventListener('pointermove', this.handleSelectionMove.bind(this));
        window.addEventListener('pointerup', this.handleSelectionEnd.bind(this));


        // CODE FOR RESIZING: RESIZE WHEN DRAGGED AT HEADER OR SIDEBAR, CODE IS PRESENT BELOW -----------------
        /**
         * Handles the start of a cell selection when the user presses down on the header canvas.
         * @type{number} resizingCol - The index of the column being resized.
         * @type{number} resizingRow - The index of the row being resized.
         * @property {number} startX - The initial X coordinate of the pointer when resizing starts.
         * @property {number} startY - The initial Y coordinate of the pointer when resizing starts.
         * @property {number} startWidth - The initial width of the column being resized.
         * @property {number} startHeight - The initial height of the row being resized.
         */
        this.resizingCol = null;
        this.resizingRow = null;
        this.startX = null;
        this.startY = null;
        this.startWidth = null;
        this.startHeight = null;

        /**
         * Column resize events
         * Handles pointer movement over the header canvas to change the cursor style when hovering over resizable edges.
         */
        this.headerCanvas.addEventListener('pointermove', this.handleHeaderpointermove.bind(this));// when mouse would move over header, the cursor would change to resize-cursor, when its edge of any header cell
        this.headerCanvas.addEventListener('pointerdown', this.handleHeaderResizeStart.bind(this));
        window.addEventListener('pointermove', this.handleHeaderResizeMove.bind(this));
        window.addEventListener('pointerup', this.handleHeaderResizeEnd.bind(this));

        // Row resize events
        this.sideCanvas.addEventListener('pointermove', this.handleSidepointermove.bind(this));
        this.sideCanvas.addEventListener('pointerdown', this.handleSideResizeStart.bind(this));
        window.addEventListener('pointermove', this.handleSideResizeMove.bind(this));
        window.addEventListener('pointerup', this.handleSideResizeEnd.bind(this));

        // CODE FOR CELL RESIZING: RESIZE WHEN DRAGGED AT HEADER OR SIDEBAR, CODE IS PRESENT ABOVE ---------------





        // MULTIPLE ROW COLUMN SELECTION CODE IS PRESENT BELOW ---------------------------------------
        /**
         * Handles the start of a MULTI ROW COLUMN selection when the user presses down on the header canvas.
        */
        this.headerCanvas.addEventListener('pointerdown', this.handleHeaderSelectStart.bind(this));
        window.addEventListener('pointermove', this.handleHeaderSelectMove.bind(this));
        window.addEventListener('pointerup', this.handleHeaderSelectEnd.bind(this));

        this.sideCanvas.addEventListener('pointerdown', this.handleSideSelectStart.bind(this));
        window.addEventListener('pointermove', this.handleSideSelectMove.bind(this));
        window.addEventListener('pointerup', this.handleSideSelectEnd.bind(this));

        // MULTIPLE ROW COLUMN SELECTION CODE IS PRESENT ABOVE ---------------------------------------


        /**
         * @type{Object} hashMap - The data structure associated to the given excel - to store cell values for quick access.
         */
        this.hashMap = {};



        this.columns = Array.from({ length: totalCols }, (_, i) => new Column(i, 100));
        this.rows = Array.from({ length: totalRows }, (_, i) => new Row(i, 25));
        // these two lines are just for col row size resize
        // this.columns = [];
        // for (let i = 0; i < totalCols; i++) {
        //     this.columns.push(new Column(i, this.cellWidth));
        // }

        // request Animation Frame
        this.needsRender = false;
        this.scheduleRender = () => {
            if (!this.needsRender) {
                this.needsRender = true;
                requestAnimationFrame(() => {
                    this.renderGrid();
                    this.renderHeader();
                    this.renderSide();
                    this.needsRender = false;
                });
            }
        };

        const virtualWidth = totalCols * 100; // CELLWidth and cellHeight are 100 and 0 resp
        const virtualHeight = totalRows * 25;

        // Dummy spacer to enable scrolling
        const spacer = document.createElement("div");
        spacer.style.width = virtualWidth + 50 + "px"; // 50 is sidebar width and 25 here is top-header width
        spacer.style.height = virtualHeight + 25 + "px";

        this.container.appendChild(spacer);
        this.container.appendChild(this.headerCanvas);
        this.container.appendChild(this.sideCanvas);
        this.container.appendChild(this.canvas);

        this.container.addEventListener("scroll", this.scheduleRender);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        window.addEventListener("resize", this.resizeCanvas); // resize me .bind(this) likhna padta h warna scroller fixed ho jaega screen par

        // Initial setup
        this.resizeCanvas();

        // **************************************************************************************************************
        // Edit any Cell in Excel UI
        this.input = document.createElement('input');
        this.input.id = 'cell-editor';
        this.container.appendChild(this.input);
        this.input.className = 'cell-editor';

        this.canvas.addEventListener('pointerdown', (e) => this.handleCellEdit(e)); // adds input tag
        // this.canvas.addEventListener('dblclick', (e) => this.handleCellEdit(e, true));
        this.input.addEventListener('blur', () => this.saveEdit());// blur event runs on any tag when focus is loosed on that tag
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.cancelEdit();
        });
        // Hide input and save edit when scrolling (like Excel)
        this.container.addEventListener('scroll', () => {
            if (this.input.style.display === 'block') {
                this.saveEdit();
            }
        });

        // **************************************************************************************************************
    }

    //
    resizeCanvas() {
        const headerHeight = 25;
        const sideWidth = 50;
        const visibleWidth = this.container.clientWidth;
        const visibleHeight = this.container.clientHeight;

        // this.headerCanvas.width = visibleWidth - sideWidth;
        // this.headerCanvas.height = headerHeight;

        // this.sideCanvas.width = sideWidth;
        // this.sideCanvas.height = visibleHeight - headerHeight;

        // this.canvas.width = visibleWidth - sideWidth;
        // this.canvas.height = visibleHeight - headerHeight;

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

        this.ctx.clearRect(0.5, 0.5, this.canvas.width, this.canvas.height); // sbse pehle pura visible page part mita diya
        this.ctx.font = "13px Arial";

        let startCol = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > scrollX) break; // const startCol = Math.floor(scrollX / 100);
            sumX += col.width;
            startCol++;
        }
        const endCol = Math.min(startCol + 20, this.totalCols); //at most 20col on screen possible

        let startRow = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > scrollY) break;
            sumY += row.height;
            startRow++;
        }
        const endRow = Math.min(startRow + 40, this.totalRows);

        // Draw Cells
        let y = sumY - scrollY;
        for (let i = startRow; i < endRow; i++) {
            let x = sumX - scrollX;
            for (let j = startCol; j < endCol; j++) {
                const colKey = "col" + j;
                if (!this.hashMap[i]) this.hashMap[i] = {};
                if (this.hashMap[i][colKey] === undefined) { // Only initialize if not already set
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

                // --- Selecting multiple cells feature --- (below 3 lines are its part) // 
                if (this.selection && this.selection.isSelected(i, j)) {
                    // Only skip fill if this is the anchor cell
                    if (!(i === this.selection.anchor.row && j === this.selection.anchor.col)) { // 1 cell is not colored
                        this.ctx.fillStyle = "#E7F1EC";
                        this.ctx.fillRect(x, y, this.columns[j].width, this.rows[i].height);
                    }
                }

                const cell = new Cell(this.rows[i], this.columns[j]);
                cell.drawCell(this.ctx, x, y, this.columns[j].width, this.rows[i].height, cellData
                ); // x,y = top-left point of cell taki cell draw ho paye

                x += this.columns[j].width;
            }
            y += this.rows[i].height;
        }

        // --- Selecting multiple cells feature --- //
        // Draw green border around selection (like Excel)
        if (this.selection && this.selection.anchor && this.selection.focus) {
            const minRow = Math.min(this.selection.anchor.row, this.selection.focus.row);
            const maxRow = Math.max(this.selection.anchor.row, this.selection.focus.row);
            const minCol = Math.min(this.selection.anchor.col, this.selection.focus.col);
            const maxCol = Math.max(this.selection.anchor.col, this.selection.focus.col);

            // Clamp selection to visible viewport
            // Clamping reqd because canvas is fixed and does not scroll without clamping,
            // the green border of selected canvas cell were not going outside the screen when scrolled, they remain like fixed at screen
            const visibleMinRow = Math.max(minRow, startRow);
            const visibleMaxRow = Math.min(maxRow, endRow - 1);
            const visibleMinCol = Math.max(minCol, startCol);
            const visibleMaxCol = Math.min(maxCol, endCol - 1);

            // Only draw if selection is visible in current viewport
            if (visibleMinRow < endRow && visibleMaxRow >= startRow && visibleMinCol < endCol && visibleMaxCol >= startCol) {
                // Calculate top-left and bottom-right in canvas coordinates
                let borderX = sumX - scrollX;
                for (let j = startCol; j < visibleMinCol; j++)
                    borderX += this.columns[j].width;
                let borderY = sumY - scrollY;
                for (let i = startRow; i < visibleMinRow; i++)
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
                this.ctx.strokeRect(borderX - 1, borderY - 1, borderW + 2, borderH + 2); // -1, +2 kiya to make it present at out-edge of cell insted of in-edge of cell
                // Draw the one small green square at the bottom-right of the green border of selected cells grp
                const handleSize = 8; // size of the square in px
                this.ctx.fillStyle = "#107C41";
                this.ctx.fillRect(borderX + borderW - 3, borderY + borderH - 3, handleSize, handleSize); // 8*8 small green square
                this.ctx.restore();
            }
        }

    }

    //
    renderHeader() {
        const scrollX = this.container.scrollLeft;
        this.headerCtx.clearRect(0.5, 0.5, this.headerCanvas.width, this.headerCanvas.height);
        this.headerCtx.font = '13px Arial';
        this.headerCtx.textAlign = 'center';
        this.headerCtx.textBaseline = 'middle';

        let startCol = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > scrollX) break;
            sumX += col.width;
            startCol++;
        }
        const endCol = Math.min(startCol + 20, this.totalCols);

        let x = sumX - scrollX;
        for (let j = startCol; j < endCol; j++) {
            const colLabel = this.colToLetter(j);
            const colWidth = this.columns[j].width;

            // 1. Check if header selection is active for this column
            let isHeaderSelected = false;
            if (this.isHeaderSelecting && this.headerSelectStartCol !== undefined && this.headerSelectEndCol !== undefined) {
                const minCol = Math.min(this.headerSelectStartCol, this.headerSelectEndCol);
                const maxCol = Math.max(this.headerSelectStartCol, this.headerSelectEndCol);
                if (j >= minCol && j <= maxCol) isHeaderSelected = true;
            }

            // 2. Check if cell selection is active for this column
            let isColSelected = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minCol = Math.min(this.selection.anchor.col, this.selection.focus.col);
                const maxCol = Math.max(this.selection.anchor.col, this.selection.focus.col);
                if (j >= minCol && j <= maxCol)
                    isColSelected = true;
            }

            // 3. Paint header cell
            if (isHeaderSelected) {
                this.headerCtx.fillStyle = '#107C41'; // dark green
                this.headerCtx.fillRect(x, 0, colWidth, 25);
                this.headerCtx.fillStyle = '#fff'; // white text
                this.headerCtx.fillText(colLabel, x + colWidth / 2, 12.5);
            } else if (isColSelected) {
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

            // Border
            this.headerCtx.lineWidth = 1;
            this.headerCtx.strokeStyle = '#b0b0b0';
            this.headerCtx.strokeRect(x + 0.5, 0.5, colWidth, 25);

            // Bottom border for selected columns
            if (isHeaderSelected || isColSelected) {
                this.headerCtx.beginPath();
                this.headerCtx.moveTo(x - 2, 23.5);
                this.headerCtx.lineTo(x + 2 + colWidth, 23.5);
                this.headerCtx.lineWidth = 2;
                this.headerCtx.strokeStyle = '#107C41';
                this.headerCtx.stroke();
            }
            x += colWidth;
        }
    }
    colToLetter(index) {
        let str = AppString.emptyString;
        do {
            str = String.fromCharCode(65 + (index % 26)) + str;
            index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        return str;
    }

    renderSide() {
        const scrollY = this.container.scrollTop;
        this.sideCtx.clearRect(0.5, 0.5, this.sideCanvas.width, this.sideCanvas.height);
        this.sideCtx.font = '13px Arial';
        this.sideCtx.textAlign = 'center';
        this.sideCtx.textBaseline = 'middle';

        let startRow = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > scrollY) break;
            sumY += row.height;
            startRow++;
        }
        const endRow = Math.min(startRow + 40, this.totalRows);

        let y = sumY - scrollY;
        for (let i = startRow; i < endRow; i++) {
            const rowLabel = (i + 1).toString();
            const rowHeight = this.rows[i].height;

            // Highlight if this row is in the selection is below
            // 1. Check if side selection is active for this row
            let isSideSelected = false;
            if (this.isSideSelecting && this.sideSelectStartRow !== undefined && this.sideSelectEndRow !== undefined) {
                const minRow = Math.min(this.sideSelectStartRow, this.sideSelectEndRow);
                const maxRow = Math.max(this.sideSelectStartRow, this.sideSelectEndRow);
                if (i >= minRow && i <= maxRow) isSideSelected = true;
            }
            // 2. Check if cell selection is active for this row
            let isRowSelected = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minRow = Math.min(this.selection.anchor.row, this.selection.focus.row);
                const maxRow = Math.max(this.selection.anchor.row, this.selection.focus.row);
                if (i >= minRow && i <= maxRow) isRowSelected = true;
            }

            // 3. Paint side cell
            if (isSideSelected) {
                this.sideCtx.fillStyle = '#107C41'; // dark green
                this.sideCtx.fillRect(0, y, 50, rowHeight);
                this.sideCtx.fillStyle = '#fff'; // white text
                this.sideCtx.fillText(rowLabel, 25, y + rowHeight / 2);
            } else if (isRowSelected) {
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

            // Border
            this.sideCtx.lineWidth = 1;
            this.sideCtx.strokeStyle = '#b0b0b0';
            this.sideCtx.strokeRect(0.5, y + 0.5, 50, rowHeight); // 0.5 is anti-aliasing of canvas drawing


            // Draw dark green right border
            if (isSideSelected || isRowSelected) {
                this.sideCtx.beginPath();
                this.sideCtx.moveTo(48.5, y - 2);
                this.sideCtx.lineTo(48.5, y + rowHeight + 2); // +2 px extra size of dark green line
                this.sideCtx.strokeStyle = '#107C41';
                this.sideCtx.lineWidth = 2;
                this.sideCtx.stroke();
            }

            y += rowHeight;
        }
    }
    // Functions for editing any cell in excel UI

    /**
     * 
     * @param {*} e 
     * @param {*} shouldFocusOrNot 
     * @returns 
     */
    handleCellEdit(e) {
        // this function injects input tag at first selected cell
        // also it re-renders 
        this.saveEdit(); // ensures that any previous cell's edit is saved before starting a new edit, single click me data save nai ho rha tha.
        const rect = this.canvas.getBoundingClientRect();
        const headerHeight = 25; // for 25 height of top-header having A,B,C,etc written
        const sideWidth = 50;// for 50 width of side-header
        const exelHeaderHeight = 50; // excel ka header
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;// coordinates of where user clicked wrt top-left of canvas tag

        const scrollX = this.container.scrollLeft;
        const scrollY = this.container.scrollTop;

        // Find col
        let colIdx = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > x + scrollX) break;
            sumX += col.width;
            colIdx++;
        }
        if (colIdx >= this.totalCols) return;

        // Find row
        let rowIdx = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.totalRows) return;

        // Calculate cell's top-left in canvas
        const cellX = sumX - scrollX;
        const cellY = sumY - scrollY;

        // Position input
        this.input.style.left = (cellX + sideWidth) + 'px';
        this.input.style.top = (cellY + headerHeight + exelHeaderHeight + 1) + 'px';
        this.input.style.width = this.columns[colIdx].width - 3 + 'px'; // Here I did -3 because input tag was hiding the small green square associated at bottom-down, so input tag ki width kam kr di, -3 kr di
        this.input.style.height = this.rows[rowIdx].height - 1 + 'px';
        this.input.style.display = 'block';

        // Set value
        const keys = Object.keys(this.data[0] || {});
        let key = keys[colIdx];


        const colKey = "col" + colIdx;
        let value = AppString.emptyString;
        if (this.hashMap[rowIdx] && this.hashMap[rowIdx][colKey] !== undefined) {
            value = this.hashMap[rowIdx][colKey];
        }
        this.input.value = value; // loads the associated cell value into the input tag


        // Store editing cell
        this.editingCell = { rowIdx, colIdx, key };
        this.scheduleRender(); // highlight the corresponding cell from header and sider

    }

    saveEdit() {
        if (!this.editingCell) return;
        const { rowIdx, colIdx } = this.editingCell;
        const colKey = "col" + colIdx;
        if (!this.hashMap[rowIdx]) this.hashMap[rowIdx] = {};
        this.hashMap[rowIdx][colKey] = this.input.value;
        this.input.style.display = 'none';
        this.editingCell = null;
        this.scheduleRender();
    }

    cancelEdit() {
        this.input.style.display = 'none';
        this.editingCell = null;
        //when cell ko edit kiya to render the header and sidebar as well as we need to remove the highlighted associated header cell and sidebar cell
        this.scheduleRender();
    }

    // --- Selecting multiple cells feature --- //
    getCellFromMouseEvent(e) { // this func if for send the mouse event and get row,col number in return
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

    handleSelectionStart(e) {
        if (e.button !== 0) return; // Only left mouse button, left button ke liye its 0 mid ke liye 1 right ke liye 2 
        const cell = this.getCellFromMouseEvent(e);
        if (!cell) return;
        this.isSelecting = true;
        this.selection.start(cell.row, cell.col);
        this.scheduleRender();
    }

    handleSelectionMove(e) {
        if (!this.isSelecting) return;
        const cell = this.getCellFromMouseEvent(e);
        if (!cell) return;
        this.selection.update(cell.row, cell.col);

        // Track the last pointer event for use in auto-scroll interval
        this._lastPointerEvent = e;
        this.setupAutoScroll(e);
        this.scheduleRender();
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
        const rect = this.container.getBoundingClientRect();
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
            if (dx < 0 && this.container.scrollLeft > 0) {
                this.container.scrollLeft = Math.max(0, this.container.scrollLeft + dx);
            } else if (dx > 0 && this.container.scrollLeft < this.container.scrollWidth - this.container.clientWidth) {
                this.container.scrollLeft = Math.min(this.container.scrollWidth - this.container.clientWidth, this.container.scrollLeft + dx);
            }
            if (dy < 0 && this.container.scrollTop > 0) {
                this.container.scrollTop = Math.max(0, this.container.scrollTop + dy);
            } else if (dy > 0 && this.container.scrollTop < this.container.scrollHeight - this.container.clientHeight) {
                this.container.scrollTop = Math.min(this.container.scrollHeight - this.container.clientHeight, this.container.scrollTop + dy);
            }
            // --- Update selection to follow auto-scroll ---
            const pointerEvent = this._lastPointerEvent;
            if (!pointerEvent) return;
            const cell = this.getCellFromMouseEvent(pointerEvent);
            if (!cell) return;
            this.selection.update(cell.row, cell.col);
            this.scheduleRender();
        }, 30); // 30ms interval
    }

    handleSelectionEnd(e) {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        if (this._autoScrollInterval) {
            clearInterval(this._autoScrollInterval);
            this._autoScrollInterval = null;
        }
        this._lastPointerEvent = null;
        // this.renderGrid();  // I think no need of renderGrid here so i commented it out
    }


    // CODE PART-2 FOR CELL RESIZING: RESIZE WHEN DRAGGED AT HEADER OR SIDEBAR IS BELOW
    // --- Column Resize Handlers ---
    handleHeaderpointermove(e) {
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scrollX = this.container.scrollLeft;
        let left = 0;
        for (let j = 0; j < this.columns.length; j++) {
            const col = this.columns[j];
            // Check both left and right edges of each column
            if (
                (Math.abs(x - left) < 10 || Math.abs(x - (left + col.width)) < 5) &&
                y < 25 // header height
            ) {
                this.headerCanvas.style.cursor = 'col-resize';
                return;
            }
            left += col.width;
            // Only check visible columns for performance (optional)
            if (left - scrollX > this.headerCanvas.width) break;
        }
        this.headerCanvas.style.cursor = AppString.emptyString;
    }

    handleHeaderResizeStart(e) {
        // Improved: Allow resizing from both left and right edges of columns (except very first left edge)
        this.input.style.display = 'none'; // Hide input when resizing header
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scrollX = this.container.scrollLeft;
        let left = 0;
        for (let j = 0; j < this.columns.length; j++) {
            const col = this.columns[j];
            // Check left edge (not for first column)
            if (j > 0 && Math.abs(x - left) < 5 && y < 25) {
                this.resizingCol = j - 1;
                this.startX = e.clientX;
                this.startWidth = this.columns[this.resizingCol].width;
                e.preventDefault();
                return;
            }
            // Check right edge (for all columns except last pixel after last col)
            if (Math.abs(x - (left + col.width)) < 10 && y < 25) {
                this.resizingCol = j;
                this.startX = e.clientX;
                this.startWidth = this.columns[this.resizingCol].width;
                e.preventDefault();
                return;
            }
            left += col.width;
            // Only check visible columns for performance (optional)
            if (left - scrollX > this.headerCanvas.width) break;
        }
    }

    handleHeaderResizeMove(e) {
        // While you are dragging (with the mouse button held down), this updates the width of the column as you move the mouse.
        if (this.resizingCol !== null) {
            const dx = e.clientX - this.startX;
            let newWidth = Math.max(30, this.startWidth + dx); // Minimum width 30px
            this.columns[this.resizingCol].width = newWidth;
            this.resizeCanvas();
        }
    }

    handleHeaderResizeEnd(e) {
        // When you release the mouse button, this ends the column resizing process and resets the state.
        if (this.resizingCol !== null) {
            this.resizingCol = null;
            this.startX = null;
            this.startWidth = null;
            this.headerCanvas.style.cursor = AppString.emptyString;
        }
    }

    // --- Row Resize Handlers ---
    handleSidepointermove(e) {
        const rect = this.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.container.scrollTop;
        let top = 0;
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            // Check both top and bottom edges of each row
            if (
                (i > 0 && Math.abs(y - top) < 5) || // top edge (not for first row)
                (Math.abs(y - (top + row.height)) < 5) // bottom edge
            ) {
                this.sideCanvas.style.cursor = 'row-resize';
                return;
            }
            top += row.height;
            // Only check visible rows for performance (optional)
            if (top - scrollY > this.sideCanvas.height) break;
        }
        this.sideCanvas.style.cursor = AppString.emptyString;
    }

    handleSideResizeStart(e) {
        // Improved: Allow resizing from both top and bottom edges of rows (except very first top edge)
        this.input.style.display = 'none'; // Hide input when resizing header
        const rect = this.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.container.scrollTop;
        let top = 0;
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            // Check top edge (not for first row)
            if (i > 0 && Math.abs(y - top) < 5) {
                this.resizingRow = i - 1;
                this.startY = e.clientY;
                this.startHeight = this.rows[this.resizingRow].height;
                e.preventDefault();
                return;
            }
            // Check bottom edge (for all rows except last pixel after last row)
            if (Math.abs(y - (top + row.height)) < 5) {
                this.resizingRow = i;
                this.startY = e.clientY;
                this.startHeight = this.rows[this.resizingRow].height;
                e.preventDefault();
                return;
            }
            top += row.height;
            // Only check visible rows for performance (optional)
            if (top - scrollY > this.sideCanvas.height) break;
        }
    }

    handleSideResizeMove(e) {
        if (this.resizingRow !== null) {
            const dy = e.clientY - this.startY;
            let newHeight = Math.max(15, this.startHeight + dy); // Minimum height 15px
            this.rows[this.resizingRow].height = newHeight;
            this.resizeCanvas();
        }
    }

    handleSideResizeEnd(e) {
        if (this.resizingRow !== null) {
            this.resizingRow = null;
            this.startY = null;
            this.startHeight = null;
            this.sideCanvas.style.cursor = AppString.emptyString;
        }
    }
    // CODE PART-2 FOR CELL RESIZING: RESIZE WHEN DRAGGED AT HEADER OR SIDEBAR IS ABOVE

    // multiple row-col selection
    handleHeaderSelectStart(e) {
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scrollX = this.container.scrollLeft;
        let colIdx = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > x + scrollX) break;
            sumX += col.width;
            colIdx++;
        }
        if (colIdx >= this.totalCols) return;
        this.isHeaderSelecting = true;
        this.headerSelectStartCol = colIdx;
        this.headerSelectEndCol = colIdx;
        this.selection.start(0, colIdx);
        this.selection.update(this.totalRows - 1, colIdx);
        this.scheduleRender();
        //
        // REPAINT THE HEADER CELLS HERE TO DARK GREEN
    }

    handleHeaderSelectMove(e) {
        if (!this.isHeaderSelecting) return;
        const rect = this.headerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scrollX = this.container.scrollLeft;
        let colIdx = 0, sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > x + scrollX) break;
            sumX += col.width;
            colIdx++;
        }
        if (colIdx >= this.totalCols) colIdx = this.totalCols - 1;
        this.headerSelectEndCol = colIdx;
        const minCol = Math.min(this.headerSelectStartCol, this.headerSelectEndCol);
        const maxCol = Math.max(this.headerSelectStartCol, this.headerSelectEndCol);
        this.selection.start(0, minCol);
        this.selection.update(this.totalRows - 1, maxCol);
        this.scheduleRender();
    }

    handleHeaderSelectEnd(e) {
        if (this.isHeaderSelecting) {
            this.isHeaderSelecting = false;
        }
    }
    // for multi col select dragging at sidebar
    handleSideSelectStart(e) {
        const rect = this.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.container.scrollTop;
        let rowIdx = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.totalRows) return;
        this.isSideSelecting = true;
        this.sideSelectStartRow = rowIdx;
        this.sideSelectEndRow = rowIdx;
        this.selection.start(rowIdx, 0);
        this.selection.update(rowIdx, this.totalCols - 1);
        this.scheduleRender();
    }

    handleSideSelectMove(e) {
        if (!this.isSideSelecting) return;
        const rect = this.sideCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const scrollY = this.container.scrollTop;
        let rowIdx = 0, sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > y + scrollY) break;
            sumY += row.height;
            rowIdx++;
        }
        if (rowIdx >= this.totalRows) rowIdx = this.totalRows - 1;
        this.sideSelectEndRow = rowIdx;
        const minRow = Math.min(this.sideSelectStartRow, this.sideSelectEndRow);
        const maxRow = Math.max(this.sideSelectStartRow, this.sideSelectEndRow);
        this.selection.start(minRow, 0);
        this.selection.update(maxRow, this.totalCols - 1);
        this.scheduleRender();
    }

    handleSideSelectEnd(e) {
        if (this.isSideSelecting) {
            this.isSideSelecting = false;
        }
    }

}




// Ek or listener bna ki scroll hote hi "input ka data us cell me save and input ka display none "
// because input ko fixed hi rkhne wale hai hm


// Ask sir that when am dbl-clicking then the coming input tag is hiding this small green square
// I have kept z-index of canvas and input-tag both equal and are 10






// Hey change cursor at header and sider like excel

// aliasing is done for when 1px lines makes  -- 0.5