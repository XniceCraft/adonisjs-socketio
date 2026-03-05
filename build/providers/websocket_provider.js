import { WebSocketInterface } from '../src/websocket.js';
export default class WebSocketProvider {
    app;
    constructor(app) {
        this.app = app;
    }
    register() {
        this.app.container.singleton('websocket', () => {
            const config = this.app.config.get('websocket', {
                middleware: [],
                socketOptions: {
                    cors: {
                        origin: '*',
                    },
                },
            });
            return new WebSocketInterface(this.app, config);
        });
    }
    async ready() {
        const websocket = await this.app.container.make('websocket');
        if (websocket)
            await websocket.boot();
    }
    async shutdown() {
        const websocket = await this.app.container.make('websocket');
        if (websocket)
            await websocket.shutdown();
    }
}
