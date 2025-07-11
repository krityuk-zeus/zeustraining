// There were so many event handers in the original code that it was difficult to manage them alll
// Below class would have all the eventListeners from the grid class
/**
 * @typedef {Object} PointerHandler
 * @property {function(PointerEvent): boolean} hitTest - Returns true if the handler should handle the event.
 * @property {function(PointerEvent): void} onPointerDown - Handles pointer down event.
 * @property {function(PointerEvent): void} onPointerMove - Handles pointer move event.
 * @property {function(): void} onPointerUp - Handles pointer up event.
 */

/**
 * TouchHandler class manages pointer events of grid class and delegates them to registered handlers.
 * It allows for modular handling of different pointer interactions such as cell selection, column resizing, etc.
 */
export default class TouchHandler {
    /**
     * Initializes the TouchHandler.
     */
    constructor(grid) {
        /**
         * List of registered pointer event handlers.
         * @type {PointerHandler[]}
         */
        this.handlers = [];

        /**
         * Currently active handler during a pointer interaction.
         * @type {PointerHandler|null}
         */
        this.currHandler = null;
        this.grid = grid;
    }

    /**
     * Registers a handler for pointer events.
     * @param {PointerHandler} handler - The handler to register.
     */
    registerHandler(handler) {
        this.handlers.push(handler);
    }

    /**
     * Handles pointer down event and delegates to the appropriate handler.
     * @param {PointerEvent} e - The pointer event.
     */
    onPointerDown(e) {
        for (const handler of this.handlers) {
            if (handler.hitTest(e)) {
                this.curHandler = handler;
                handler.onPointerDown(e);
                break;
            }
        }
    }

    /**
     * Handles pointer move event and delegates to the current handler.
     * @param {PointerEvent} e - The pointer event.
     */
    onPointerMove(e) {
        if (this.curHandler) this.curHandler.onPointerMove(e);
    }

    /**
     * Handles pointer up event and resets the current handler to null.
     */
    onPointerUp() {
        if (this.curHandler) this.curHandler.onPointerUp();
        this.curHandler = null;
    }
}