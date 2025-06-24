export default class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    drawCell(ctx, x, y, width = 100, height = 25, content) {
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#000';
        ctx.fillText(content, x + 4, y + 16);
    }

    editData(val) {
        this.data = val;
    }
}