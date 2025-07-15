/**
 * GridManager module for managing the global grid instance.
 * Provides setter and getter functions to store and retrieve the current grid object.
 * Used for sharing the grid reference across different modules (e.g., header, uploader).
 */

let gridRef = null;

/**
 * Sets the current grid instance.
 * Should be called after the grid is initialized.
 * The setter of grid would get called in loadDefaultData.js.
 * @param {Grid} g - The grid instance to store.
 */
export function setGrid(g) {
  gridRef = g;
}

/**
 * Gets the current grid instance.
 * @returns {Grid|null} The stored grid instance, or null if not set.
 */
export function getGrid() {
  return gridRef;
}