import Macroable from '@poppinss/macroable';
import type { Constructor, LazyImport } from '@adonisjs/core/types/http';
import type { WebSocketCallback, WebSocketContext } from './types.js';
import type { ApplicationService } from '@adonisjs/core/types';
import type { GetControllerHandlers } from './types.js';
/**
 * WebSocketRoute represents a single WebSocket event handler.
 * It manages the event pattern, handler resolution, and parameter extraction.
 *
 */
export declare class WebSocketRoute<Controller extends Constructor<any> = any> extends Macroable {
    #private;
    /**
     * Create a new WebSocket route
     *
     * @param app - AdonisJS application instance
     * @param options - Route configuration options
     * @param options.pattern - Event name to listen for
     * @param options.handler - Handler function, controller string, or lazy import tuple
     * @param options.params - Array of parameter names to extract from event data
     *
     */
    constructor(app: ApplicationService, options: {
        pattern: string;
        handler: WebSocketCallback | string | [LazyImport<Controller> | Controller, GetControllerHandlers<Controller>?];
        params: string[];
    });
    /**
     * Execute the route handler with the provided context and arguments
     * Extracts parameters from arguments based on configured param names
     *
     * @param context - WebSocket context with socket, io, and HTTP context
     * @param args - Event data passed from the client
     * @returns Promise resolving to the handler's return value
     *
     */
    handle(context: WebSocketContext, ...args: any[]): Promise<any>;
    /**
     * Get the full event pattern including all applied prefixes
     * Prefixes are applied in reverse order (LIFO - last in, first out)
     */
    get pattern(): string;
    /**
     * Add a prefix to the route pattern
     * Multiple prefixes can be added and will be applied in reverse order
     *
     * @param prefix - String to prepend to the event pattern
     * @returns Current route instance for method chaining
     *
     */
    prefix(prefix: string): this;
}
