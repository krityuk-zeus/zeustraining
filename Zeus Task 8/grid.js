import Cell from "./cell.js";
import Row from "./row.js";
import Column from "./column.js";

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
        this.canvas.style.top = "25px";
        this.canvas.style.left = "50px";
        // ?????????????????????????????????????????????????????????????????????????????????????????
        // remove this top left and put into csss file

        // Top header canvas (A, B, C, ...)
        this.headerCanvas = document.createElement("canvas");
        this.headerCtx = this.headerCanvas.getContext("2d");
        this.headerCanvas.classList.add("headerCanvas"); // add css here
        this.headerCanvas.style.left = "50px";
        this.headerCanvas.style.top = "0px";
        //
        // Side header canvas (1, 2, 3, ...)
        this.sideCanvas = document.createElement("canvas");
        this.sideCtx = this.sideCanvas.getContext("2d");
        this.sideCanvas.classList.add("sideCanvas");
        this.sideCanvas.style.left = "0px";
        this.sideCanvas.style.top = "25px";

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
        spacer.style.width = virtualWidth + "px";
        spacer.style.height = virtualHeight + "px";

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
        this.input.style.position = 'absolute';
        this.input.style.zIndex = 100;
        this.input.style.display = 'none';
        this.input.className = 'cell-editor';
        this.container.appendChild(this.input);

        this.canvas.addEventListener('dblclick', (e) => this.handleCellEdit(e));
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

        this.headerCanvas.width = visibleWidth - sideWidth;
        this.headerCanvas.height = headerHeight;

        this.sideCanvas.width = sideWidth;
        this.sideCanvas.height = visibleHeight - headerHeight;

        this.canvas.width = visibleWidth - sideWidth;
        this.canvas.height = visibleHeight - headerHeight;

        this.renderHeader();
        this.renderSide();
        this.renderGrid();
    }

    renderGrid() {
        const scrollX = this.container.scrollLeft; // left towards right kitna scroll kra ha, starting me ye zero rhega
        const scrollY = this.container.scrollTop; // top se kitna scroll kra h neeche ke taraf / simply means top-left pixel of scroll-container

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // sbse pehle pura visible page part mita diya
        this.ctx.font = "13px Roboto";

        // const startCol = Math.floor(scrollX / this.cellWidth);//pehla col ka number
        // const endCol = startCol + Math.ceil(this.canvas.width / this.cellWidth);//last col ka number

        // const startRow = Math.floor(scrollY / this.cellHeight);
        // const endRow = startRow + Math.ceil(this.canvas.height / this.cellHeight);

        // for (let row = startRow; row <= endRow; row++) {
        //     for (let col = startCol; col <= endCol; col++) {
        //         const x = col * this.cellWidth - scrollX;
        //         const y = row * this.cellHeight - scrollY;

        //         this.ctx.strokeStyle = '#ccc';
        //         this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);

        //         this.ctx.fillStyle = '#000';
        //         this.ctx.fillText(`${row},${col}`, x + 4, y + 16);
        //     }
        // }

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

                const cell = new Cell(this.rows[i], this.columns[j]);
                cell.drawCell(
                    this.ctx,
                    x,
                    y,
                    this.columns[j].width,
                    this.rows[i].height,
                    cellData
                ); // x,y = top-left point of cell taki cell draw ho paye

                x += this.columns[j].width;
            }
            y += this.rows[i].height;
        }
    }

    //
    renderHeader() {
        const scrollX = this.container.scrollLeft;
        this.headerCtx.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
        this.headerCtx.font = 'bold 13px Roboto';
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
        this.sideCtx.font = 'bold 13px Roboto';
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
    handleCellEdit(e) {
        const rect = this.canvas.getBoundingClientRect();
        const headerHeight = 25;
        const sideWidth = 50;
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
        const keys = Object.keys(this.data[7] || {});
        const key = keys[colIdx];
        let value = '';
        if (key && this.data[rowIdx]) {
            value = this.data[rowIdx - 1]?.[key] ?? '';
        }
        this.input.value = value;
        this.input.focus();

        // Store editing cell
        this.editingCell = { rowIdx, colIdx, key };
    }

    saveEdit() {
        if (!this.editingCell) return;
        const { rowIdx, colIdx, key } = this.editingCell;
        if (key && this.data[rowIdx - 1]) {
            this.data[rowIdx - 1][key] = this.input.value;
        }
        this.input.style.display = 'none';
        this.editingCell = null;
        this.renderGrid();
    }

    cancelEdit() {
        this.input.style.display = 'none';
        this.editingCell = null;
    }

}
