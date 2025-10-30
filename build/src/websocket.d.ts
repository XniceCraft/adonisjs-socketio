import { Server } from 'socket.io';
import type { WebSocketConfig, WebSocketContext } from '../src/types.js';
type WebSocketCallback = (ctx: WebSocketContext) => Promise<void>;
export declare class WebSocketInterface {
    protected config: WebSocketConfig;
    private _server;
    private _callback;
    constructor(config: WebSocketConfig);
    addCallback(type: 'connected' | 'disconnected', callback?: WebSocketCallback): void;
    boot(): Promise<void>;
    shutdown(): Promise<void>;
    get server(): Server | null;
}
export {};
