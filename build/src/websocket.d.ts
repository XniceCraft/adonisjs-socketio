import { Server } from 'socket.io';
import { WebSocketRouteGroup } from './group.js';
import type { WebSocketCallback, WebSocketConfig, GetControllerHandlers } from '../src/types.js';
import type { Application } from '@adonisjs/core/app';
import type { Constructor, LazyImport } from '@adonisjs/core/types/http';
/**
 * WebSocketInterface manages Socket.IO server integration with AdonisJS.
 * It handles route registration, middleware setup, and server lifecycle.
 */
export declare class WebSocketInterface {
    #private;
    constructor(app: Application<any>, config: WebSocketConfig);
    /**
     * Register a WebSocket event handler
     *
     * @param pattern - Event name to listen for (e.g., 'message', 'chat:send', 'connection')
     * @param handler - Handler function, controller reference, or lazy import
     * @param params - Optional parameter names for extracting from event data
     *
     * @example
     * ```ts
     * // Using inline handler
     * ws.on('message', async ({ socket, params }) => {
     *   socket.emit('response', params)
     * })
     *
     * // Using controller
     * ws.on('chat:send', '#controllers/chat_controller.send')
     *
     * // Using lazy import with parameters
     * ws.on('user:update', [() => import('#controllers/user'), 'update'], ['userId'])
     * ```
     */
    on<T extends Constructor<any>>(pattern: string, handler: string | WebSocketCallback | [LazyImport<T> | T, GetControllerHandlers<T>?], params?: string[]): this;
    /**
     * Create a route group for applying common prefixes or middleware
     *
     * @param callback - Function containing route definitions for the group
     * @returns WebSocketRouteGroup instance for further chaining
     *
     * @example
     * ```ts
     * ws.group(() => {
     *   ws.on('list', '#controllers/chat_controller.list')
     *   ws.on('send', '#controllers/chat_controller.send')
     *   ws.on('delete', '#controllers/chat_controller.delete')
     * }).prefix('chat:')
     * ```
     */
    group(callback: () => void): WebSocketRouteGroup;
    /**
     * Initialize and start the WebSocket server
     * Sets up Socket.IO with the HTTP server and registers all middleware
     * This method is idempotent - calling it multiple times has no effect
     *
     * @example
     * ```ts
     * // Typically called automatically by the provider
     * await ws.boot()
     * ```
     */
    boot(): Promise<void>;
    /**
     * Gracefully shutdown the WebSocket server
     * Removes all listeners and closes all connections
     *
     * @example
     * ```ts
     * // Typically called automatically by the provider
     * await ws.shutdown()
     * ```
     */
    shutdown(): Promise<void>;
    /**
     * Get the underlying Socket.IO server instance
     * Useful for accessing Socket.IO methods directly
     *
     * @returns Socket.IO server instance or null if not initialized
     *
     * @example
     * ```ts
     * const io = ws.server
     * if (io) {
     *   // Broadcast to all clients
     *   io.emit('notification', { message: 'Server update' })
     * }
     * ```
     */
    get server(): Server | null;
    /**
     * Register all routes with the Socket.IO server
     * Sets up connection handler and binds all event listeners
     *
     */
    registerRoute(): Promise<void>;
    /**
     * Remove all registered event listeners from the Socket.IO server
     *
     */
    unregisterRoute(): void;
}
