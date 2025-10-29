import app from '@adonisjs/core/services/app';
let websocket;
await app.booted(async () => {
    websocket = await app.container.make('websocket');
});
export { websocket as default };
