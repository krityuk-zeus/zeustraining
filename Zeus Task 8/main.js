import createExcelHeader from "./header.js";
import Grid from "./grid.js";

/**
 * Get the grid container element from the DOM.
 * This is where the main grid will be rendered.
 * 
 * @type {HTMLDivElement}
 */
const container = document.getElementById('container');


/**
 * Create the Excel-like header element and link it to the container and Grid logic.
 *
 * @type {HTMLElement}
 */
const header = createExcelHeader(container, Grid);


/**
 * Inject the header into the DOM, placing it before all other body content.
 */
document.body.prepend(header); // injected header into body here and created and injected container at createExcelHeader function