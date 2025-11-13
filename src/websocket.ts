/*
 * @xnicecraft/adonisjs-socketio
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { moduleImporter } from '@adonisjs/core/container'
import { Server } from 'socket.io'
import { WebSocketRoute } from './route.js'
import { WebSocketRouteGroup } from './group.js'
import InitializeSocketContext from './middleware/initialize_socket_context.js'

import type { WebSocketCallback, WebSocketConfig, GetControllerHandlers } from '../src/types.js'
import type { Application } from '@adonisjs/core/app'
import type { Constructor, LazyImport } from '@adonisjs/core/types/http'

/**
 * WebSocketInterface manages Socket.IO server integration with AdonisJS.
 * It handles route registration, middleware setup, and server lifecycle.
 */
export class WebSocketInterface {
  /**
   * Socket.IO server instance
   */
  #server: Server | null = null

  /**
   * Special route handler for connection events
   */
  #connectionCallback: WebSocketRoute | undefined = undefined

  /**
   * Collection of all registered event routes
   */
  #otherCallback: WebSocketRoute[] = []

  /**
   * AdonisJS Application instance
   */
  #app: Application<any>

  /**
   * WebSocket configuration options
   */
  #config: WebSocketConfig

  /**
   * Stack of currently open route groups for nested group support
   */
  #openedGroups: WebSocketRouteGroup[] = []

  constructor(app: Application<any>, config: WebSocketConfig) {
    this.#app = app
    this.#config = config
  }

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
  public on<T extends Constructor<any>>(
    pattern: string,
    handler: string | WebSocketCallback | [LazyImport<T> | T, GetControllerHandlers<T>?],
    params: string[] = []
  ): this {
    const callback = new WebSocketRoute(this.#app, {
      pattern,
      handler,
      params: pattern === 'connection' ? [] : params,
    })

    if (pattern === 'connection') {
      this.#connectionCallback = callback
    } else {
      this.#otherCallback.push(callback)
    }

    const openedGroup = this.#openedGroups[this.#openedGroups.length - 1]
    if (openedGroup) {
      openedGroup.routes.push(callback)
    }

    return this
  }

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
  group(callback: () => void): WebSocketRouteGroup {
    /**
     * Create a new group with empty set of routes
     */
    const group = new WebSocketRouteGroup([])

    /**
     * Track the group, so that the upcoming calls inside the callback
     * can use this group
     */
    this.#openedGroups.push(group)

    /**
     * Execute the callback. Now all registered routes will be
     * collected separately from the routes array
     */
    callback()

    /**
     * Now the callback is over, get rid of the opened group
     */
    this.#openedGroups.pop()

    return group
  }

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
  public async boot() {
    if (this.#server) return

    const logger = await this.#app.container.make('logger')
    const adonisServer = await this.#app.container.make('server')
    if (!adonisServer) {
      logger?.error('AdonisJS not available')
      return
    }

    const nodeServer = adonisServer.getNodeServer()
    if (!nodeServer) {
      logger?.error('AdonisJS Node Server not available')
      return
    }

    this.#server = new Server(nodeServer, this.#config.socketOptions)
    this.#server.use(InitializeSocketContext)

    logger?.info('started Websocket Server')

    try {
      for (const middleware of this.#config.middleware) {
        const handler = moduleImporter(middleware as any, 'handle').toHandleMethod()
        this.#server.use(async (socket, next) => {
          try {
            await handler.handle(this.#app.container, socket.context!, next)
          } catch (error) {
            next(error)
            logger?.error('WebSocket middleware error:', error)
          }
        })
      }
    } catch (err) {
      logger?.error('WebSocket middleware setup failed:', err)
    }

    await this.registerRoute()
  }

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
  public async shutdown() {
    if (!this.#server) return

    const logger = await this.#app.container.make('logger')
    logger?.info('Shutting down WebSocket server')

    this.unregisterRoute()
    await this.#server.close()
    this.#server = null
  }

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
  public get server(): Server | null {
    return this.#server
  }

  /**
   * Register all routes with the Socket.IO server
   * Sets up connection handler and binds all event listeners
   *
   */
  public async registerRoute() {
    if (!this.#server) return

    const logger = await this.#app.container.make('logger')

    this.#server.on('connection', async (socket) => {
      if (!socket.context) {
        logger?.error('Socket context not initialized')
        socket.disconnect(true)
        return
      }

      logger?.debug(`Client connected: ${socket.id}`)

      if (this.#connectionCallback) {
        try {
          await this.#connectionCallback.handle({
            socket: socket,
            io: this.#server!,
            ...socket.context,
          })
        } catch (error) {
          logger?.error('Connection handler error:', error)
        }
      }

      for (const route of this.#otherCallback) {
        logger?.trace(`Registering event handler: ${route.pattern}`)

        socket.on(route.pattern, async (...args) => {
          try {
            await route.handle(
              {
                socket: socket,
                io: this.#server!,
                ...socket.context!,
              },
              ...args
            )
          } catch (error) {
            logger?.error(`Error handling event "${route.pattern}":`, error)
          }
        })
      }
    })
  }

  /**
   * Remove all registered event listeners from the Socket.IO server
   *
   */
  public unregisterRoute() {
    if (!this.#server) return

    this.#server.removeAllListeners()
  }
}
