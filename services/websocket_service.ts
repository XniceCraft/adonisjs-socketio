import app from '@adonisjs/core/services/app'
import type { WebSocketInterface } from '../src/websocket.js'

let websocket: WebSocketInterface

await app.booted(async () => {
  websocket = await app.container.make('websocket')
})

export { websocket as default }
