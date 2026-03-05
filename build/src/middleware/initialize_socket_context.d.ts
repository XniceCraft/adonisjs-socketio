import type { SocketIoMiddleware } from '../types.js';
import type { HttpContext } from '@adonisjs/core/http';
declare module 'socket.io' {
    interface Socket {
        context?: HttpContext;
    }
}
export default function InitializeSocketContext(socket: Parameters<SocketIoMiddleware>[0], next: Parameters<SocketIoMiddleware>[1]): Promise<void>;
