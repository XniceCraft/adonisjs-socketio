import { WebSocketInterface } from '../src/websocket.js'
import type { WebSocketConfig } from '../src/types.js'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    websocket: WebSocketInterface
  }
}

export default class WebSocketProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    this.app.container.singleton('websocket', () => {
      const config = this.app.config.get<WebSocketConfig>('websocket', {
        middleware: [],
        socketOptions: {
          cors: {
            origin: '*',
          },
        },
      })

      return new WebSocketInterface(this.app, config)
    })
  }

  public async ready() {
    const websocket = await this.app.container.make('websocket')
    if (websocket) await websocket.boot()
  }

  public async shutdown() {
    const websocket = await this.app.container.make('websocket')
    if (websocket) await websocket.shutdown()
  }
}
