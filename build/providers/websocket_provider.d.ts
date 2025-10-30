import { WebSocketInterface } from '../src/websocket.js';
import type { ApplicationService } from '@adonisjs/core/types';
declare module '@adonisjs/core/types' {
    interface ContainerBindings {
        websocket: WebSocketInterface;
    }
}
export default class WebSocketProvider {
    protected app: ApplicationService;
    constructor(app: ApplicationService);
    register(): void;
    ready(): Promise<void>;
    shutdown(): Promise<void>;
}
