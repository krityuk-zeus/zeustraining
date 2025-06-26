export default class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    drawCell(ctx, x, y, width = 100, height = 25, content) {
        ctx.strokeStyle = '#E0E0E0';
        ctx.strokeRect(x +0.5, y + 0.5, width, height); // 0.5 is anti aliasing
        // ctx.strokeRect(x , y, width, height); // 0.5 is anti aliasing, did for 1px lines else it was becoming 2px

        ctx.fillStyle = '#000';
        ctx.fillText(content, x + 4, y + 16);
    }

    editData(val) {
        this.data = val;
    }
}