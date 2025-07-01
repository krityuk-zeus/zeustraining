import createExcelHeader from "./header.js";
import Grid from "./grid.js";

const container = document.getElementById('container');
const header = createExcelHeader(container, Grid);
document.body.prepend(header); // injected header into body here and created and injected container at createExcelHeader function