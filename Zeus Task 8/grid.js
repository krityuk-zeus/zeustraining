import Cell from "./cell.js";
import Row from "./row.js";
import Column from "./column.js";
import Selection from "./Selection.js";

export default class Grid {
    constructor(container, data, totalRows = 100000, totalCols = 1000) {
        this.container = container;
        this.data = data;
        this.totalRows = totalRows;
        this.totalCols = totalCols;

        // Main Canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        // this.ctx.font = "2px Arial";
        this.canvas.classList.add("myCanvas"); // give some css to this canvas tag whivh we are creating here, yahi canvas ele baar baar inject krenge onrender me

        // Top header canvas (A, B, C, ...)
        this.headerCanvas = document.createElement("canvas");
        this.headerCtx = this.headerCanvas.getContext("2d");
        this.headerCanvas.classList.add("headerCanvas"); // add css here

        //
        // Side header canvas (1, 2, 3, ...)
        this.sideCanvas = document.createElement("canvas");
        this.sideCtx = this.sideCanvas.getContext("2d");
        this.sideCanvas.classList.add("sideCanvas");

        // --- Selecting multiple cells feature --- //
        this.selection = new Selection();
        this.isSelecting = false;
        this.canvas.addEventListener('mousedown', this.handleSelectionStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleSelectionMove.bind(this));
        document.addEventListener('mouseup', this.handleSelectionEnd.bind(this));

        // Adding event listener to header and sider so that clicking on them would highlight the corresponding column or row
        this.headerCanvas.addEventListener('mousedown', this.handleHeaderClick.bind(this));
        this.sideCanvas.addEventListener('mousedown', this.handleSideClick.bind(this));


        this.columns = Array.from({ length: totalCols }, (_, i) => new Column(i, 100));
        this.rows = Array.from({ length: totalRows }, (_, i) => new Row(i, 25)); // these tow lines are just for col row size resize
        // this.columns = [];
        // for (let i = 0; i < totalCols; i++) {
        //     this.columns.push(new Column(i, this.cellWidth));
        // }

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

        let needsRender = false;
        this.container.addEventListener("scroll", () => {
            if (!needsRender) {
                needsRender = true;
                requestAnimationFrame(() => {
                    // optimise performace
                    this.renderGrid();
                    this.renderHeader();
                    this.renderSide();
                    needsRender = false;
                });
            }
        });
        this.resizeCanvas = this.resizeCanvas.bind(this);
        window.addEventListener("resize", this.resizeCanvas);
        // window.addEventListener('resize',()=> this.resizeCanvas); 
        // //????????????????????????????????????????????????????????????????????????????????????

        // Initial setup
        this.resizeCanvas();

        // Edit any Cell in Excel UI
        this.input = document.createElement('input');
        this.input.className = 'cell-editor';
        this.input.id = 'cell-editor';
        this.container.appendChild(this.input);

        this.canvas.addEventListener('mousedown', (e) => this.handleCellEdit(e, false));//inputTag editing = false
        this.canvas.addEventListener('dblclick', (e) => this.handleCellEdit(e, true));
        this.input.addEventListener('blur', () => this.saveEdit());// blur event runs on any tag when focus is loosed on that tag
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.cancelEdit();
        });

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
        const dpr = window.devicePixelRatio || 1;
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



        this.renderHeader();
        this.renderSide();
        this.renderGrid();
    }

    renderGrid() {
        const scrollX = this.container.scrollLeft; // left towards right kitna scroll kra ha, starting me ye zero rhega
        const scrollY = this.container.scrollTop; // top se kitna scroll kra h neeche ke taraf / simply means top-left pixel of scroll-container

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // sbse pehle pura visible page part mita diya
        this.ctx.font = "13px Arial";

        // const startCol = Math.floor(scrollX / this.cellWidth);//pehla col ka number
        // const endCol = startCol + Math.ceil(this.canvas.width / this.cellWidth);//last col ka number

        // const startRow = Math.floor(scrollY / this.cellHeight);
        // const endRow = startRow + Math.ceil(this.canvas.height / this.cellHeight);

        let startCol = 0,
            sumX = 0;
        for (const col of this.columns) {
            if (sumX + col.width > scrollX) break; // const startCol = Math.floor(scrollX / 100);
            sumX += col.width;
            startCol++;
        }
        console.log();
        const endCol = Math.min(startCol + 20, this.totalCols); //at most 20col on screen possible

        let startRow = 0,
            sumY = 0;
        for (const row of this.rows) {
            if (sumY + row.height > scrollY) break;
            sumY += row.height;
            startRow++;
        }
        const endRow = Math.min(startRow + 40, this.totalRows);

        // Draw Cells
        // const keys = Object.keys(this.data[0]); // data[0] is just a map
        const keys = Object.keys(this.data[7]); // data[7] se uthaya because data.json file me 7th par mera naam h and usme dher sare attribute bnaye h
        let y = sumY - scrollY;
        for (let i = startRow; i < endRow; i++) {
            let x = sumX - scrollX;
            for (let j = startCol; j < endCol; j++) {
                let cellData = `  `;
                if (keys[j] && this.data[i]) {
                    // if j<5 then update cellData because when j>-5 keys[j] would be null as only 5 columns are there in data.json
                    if (i == 0) cellData = keys[j].toUpperCase();
                    else cellData = this.data[i - 1][keys[j]] ?? " ";
                }
                // --- Selecting multiple cells feature --- (below 3 lines are its part) // 
                if (this.selection && this.selection.isSelected(i, j)) { // Highlight if its in selection class
                    this.ctx.fillStyle = "#E7F1EC"; // light blue
                    this.ctx.fillRect(x, y, this.columns[j].width, this.rows[i].height);
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

            // Only draw if selection is visible in current viewport
            if (minRow < endRow && maxRow >= startRow && minCol < endCol && maxCol >= startCol) {
                // Calculate top-left and bottom-right in canvas coordinates
                let borderX = sumX - scrollX;
                for (let j = startCol; j < minCol; j++)
                    borderX += this.columns[j].width;
                let borderY = sumY - scrollY;
                for (let i = startRow; i < minRow; i++)
                    borderY += this.rows[i].height;
                let borderW = 0;
                for (let j = minCol; j <= maxCol; j++)
                    borderW += this.columns[j].width;
                let borderH = 0;
                for (let i = minRow; i <= maxRow; i++)
                    borderH += this.rows[i].height;

                this.ctx.save();
                this.ctx.strokeStyle = "#107C41"; // Excel green
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(borderX - 1, borderY - 1, borderW + 2, borderH + 2); // -1, +2 kiya to make it present at out-edge of cell insted of in-edge of cell
                // Draw the one small green square at the bottom-right of the green border of selected cells grp
                const handleSize = 8; // size of the square in px
                this.ctx.fillStyle = "#107C41";
                this.ctx.fillRect(
                    borderX + borderW - 3, // x position
                    borderY + borderH - 3, // y position
                    handleSize,
                    handleSize
                );
                this.ctx.restore();
            }
        }




    }

    //
    renderHeader() {
        const scrollX = this.container.scrollLeft;
        this.headerCtx.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
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

            // Highlight if this column is in the selection is present below
            let isColSelected = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minCol = Math.min(this.selection.anchor.col, this.selection.focus.col);
                const maxCol = Math.max(this.selection.anchor.col, this.selection.focus.col);
                if (j >= minCol && j <= maxCol) isColSelected = true;
            }
            if (isColSelected) {
                this.headerCtx.fillStyle = '#CAEAD8'; // light green
                this.headerCtx.fillRect(x, 0, colWidth, 25);
                // Draw bottom border
                this.headerCtx.beginPath();
                this.headerCtx.moveTo(x, 23);
                this.headerCtx.lineTo(x + colWidth, 23);
                this.headerCtx.strokeStyle = '#107C41';
                this.headerCtx.lineWidth = 2;
                this.headerCtx.stroke();
            }
            // Highlight if this column is in the selection is present above

            this.headerCtx.strokeStyle = '#b0b0b0';
            this.headerCtx.strokeRect(x, 0, colWidth, 25);
            this.headerCtx.fillStyle = '#222';
            this.headerCtx.fillText(colLabel, x + colWidth / 2, 12.5);
            x += colWidth;
        }
    }

    colToLetter(index) {
        let str = "";
        do {
            str = String.fromCharCode(65 + (index % 26)) + str;
            index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        return str;
    }

    renderSide() {
        const scrollY = this.container.scrollTop;
        this.sideCtx.clearRect(0, 0, this.sideCanvas.width, this.sideCanvas.height);
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
            let isRowSelected = false;
            if (this.selection && this.selection.anchor && this.selection.focus) {
                const minRow = Math.min(this.selection.anchor.row, this.selection.focus.row);
                const maxRow = Math.max(this.selection.anchor.row, this.selection.focus.row);
                if (i >= minRow && i <= maxRow) isRowSelected = true;
            }

            if (isRowSelected) {
                this.sideCtx.fillStyle = '#CAEAD8'; // light green
                this.sideCtx.fillRect(0, y, 50, rowHeight);
                // Draw dark green right border
                this.sideCtx.beginPath();
                this.sideCtx.moveTo(48, y);
                this.sideCtx.lineTo(48, y + rowHeight);
                this.sideCtx.strokeStyle = '#107C41';
                this.sideCtx.lineWidth = 2;
                this.sideCtx.stroke();
            }
            // Highlight if this row is in the selection is above

            this.sideCtx.strokeStyle = '#b0b0b0';
            this.sideCtx.strokeRect(0, y, 50, rowHeight);
            this.sideCtx.fillStyle = '#222';
            this.sideCtx.fillText(rowLabel, 25, y + rowHeight / 2);
            y += rowHeight;
        }
    }
    colToLetter(index) {
        let str = '';
        do {
            str = String.fromCharCode(65 + (index % 26)) + str;
            index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        return str;
    }
    // Functions for editing any cell in excel UI
    handleCellEdit(e, shouldFocusOrNot) {//this.input.focus(); would run if its double-click 
        //
        this.saveEdit(); // ensures that any previous cell's edit is saved before starting a new edit, single click me data save nai ho rha tha.
        const rect = this.canvas.getBoundingClientRect();
        const headerHeight = 25; // for 25 height of top-header having A,B,C,etc written
        const sideWidth = 50;// for 50 width of side-header
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
        this.input.style.top = (cellY + headerHeight) + 'px';
        this.input.style.width = this.columns[colIdx].width + 'px';
        this.input.style.height = this.rows[rowIdx].height + 'px';
        this.input.style.display = 'block';

        // Set value
        const keys = Object.keys(this.data[0] || {});
        let key = keys[colIdx];

        //
        // if (!key) {
        //     // Generate a new key for this column, but do NOT add to all rows here
        //     key = "COL" + (colIdx);
        // }

        let value = '';
        if (key && this.data[rowIdx]) {
            value = this.data[rowIdx - 1]?.[key] ?? '';
        }
        this.input.value = value; // loads the associated cell value into the input tag
        if (shouldFocusOrNot) {
            this.input.focus();
        }

        // Store editing cell
        this.editingCell = { rowIdx, colIdx, key };
        this.renderHeader(); // highlight the corresponding cell from header and sider
        this.renderSide();
    }

    saveEdit() {
        if (!this.editingCell) return;
        const { rowIdx, colIdx, key } = this.editingCell;
        if (key && this.data[rowIdx - 1]) {
            // Only add the key to this row if it doesn't exist
            if (!(key in this.data[rowIdx - 1])) {
                this.data[rowIdx - 1][key] = "";
            }
            this.data[rowIdx - 1][key] = this.input.value; // set/update this inputText into this.data
        }
        this.input.style.display = 'none';
        this.editingCell = null;
        this.renderGrid();
        this.renderHeader();//when cell ko edit kiya to render the header and sidebar as well as we need to remove the highlighted associated header cell and sidebar cell
        this.renderSide();
    }

    cancelEdit() {
        this.input.style.display = 'none';
        this.editingCell = null;
        this.renderHeader(); //when cell ko edit kiya to render the header and sidebar as well as we need to remove the highlighted associated header cell and sidebar cell
        this.renderSide();
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
        this.renderGrid();
        this.renderHeader();
        this.renderSide();
    }

    handleSelectionMove(e) {
        if (!this.isSelecting) return;
        const cell = this.getCellFromMouseEvent(e);
        if (!cell) return;
        this.selection.update(cell.row, cell.col);
        this.input.style.border = "none"; // when selected cell is dragged then remove input-tag ka border warna input tag border would overlap with selected-cells ka border
        this.renderGrid();
        this.renderHeader();
        this.renderSide();
    }

    handleSelectionEnd(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.renderGrid();
        }
    }


    // Below two functions are used for event listener to header and sider so that clicking on them would highlight the corresponding column or row
    handleHeaderClick(e) {
        this.input.style.display = "none";
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
        // Select the whole column
        this.selection.start(0, colIdx);
        this.selection.update(this.totalRows - 1, colIdx);
        this.renderGrid();
        this.renderHeader();
        this.renderSideReset();
    }

    handleSideClick(e) {
        this.input.style.display = "none";
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
        // Select the whole row
        this.selection.start(rowIdx, 0);
        this.selection.update(rowIdx, this.totalCols - 1);
        this.renderGrid();
        this.renderSide();
        this.renderHeaderReset();
    }

    renderSideReset() {
        // Temporarily remove selection to avoid highlighting
        const prevSelection = this.selection;
        this.selection = null;
        this.renderSide();
        this.selection = prevSelection;
    }
    renderHeaderReset() {
        // Temporarily remove selection to avoid highlighting
        const prevSelection = this.selection;
        this.selection = null;
        this.renderHeader();
        this.selection = prevSelection;
    }

}
