import { Server } from 'socket.io';
import { moduleImporter } from '@adonisjs/core/container';
import app from '@adonisjs/core/services/app';
import InitializeSocketContext from './middleware/initialize_socket_context.js';
export class WebSocketInterface {
    config;
    _server = null;
    _callback = {
        connected: undefined,
        disconnected: undefined,
    };
    constructor(config) {
        this.config = config;
    }
    addCallback(type, callback) {
        this._callback[type] = callback;
    }
    async boot() {
        if (this._server)
            return;
        const adonisServer = await app.container.make('server');
        if (!adonisServer)
            return;
        const nodeServer = adonisServer.getNodeServer();
        if (!nodeServer)
            return;
        this._server = new Server(nodeServer, this.config.socketOptions);
        this._server.use(InitializeSocketContext);
        const logger = await app.container.make('logger');
        if (logger)
            logger.info('Websocket running');
        try {
            for (const middleware of this.config.middleware) {
                const handler = moduleImporter(middleware, 'handle').toHandleMethod();
                this._server.use(async (socket, next) => {
                    try {
                        await handler.handle(app.container, socket.context, next);
                    }
                    catch (error) {
                        next(error);
                        logger.error('Socket middleware error: ', error);
                    }
                });
            }
        }
        catch (err) {
            logger.error('WebSocket middleware setup failed:', err);
        }
        this._server.on('connection', async (socket) => {
            if (!socket.context) {
                logger.error('Socket context not initialized');
                return;
            }
            if (this._callback.connected) {
                await this._callback.connected({
                    socket: socket,
                    io: this._server,
                    ...socket.context,
                });
            }
            socket.once('disconnect', async () => {
                if (!socket.context) {
                    return;
                }
                if (this._callback.disconnected) {
                    await this._callback.disconnected({
                        socket: socket,
                        io: this._server,
                        ...socket.context,
                    });
                }
            });
        });
    }
    async shutdown() {
        if (!this._server)
            return;
        await this._server.close();
        this._server = null;
    }
    get server() {
        return this._server;
    }
}
