# @xnicecraft/adonisjs-socketio

Socket.io provider for AdonisJS v6.

## Note

This package is highly experimental. Not recommended for production usage. Feel free to contribute

## Setup

- Install this package
  ```sh
  npm install https://github.com/xnicecraft/adonisjs-socketio#<version from release>
  ```
- Configure the package
  ```sh
  node ace configure @xnicecraft/adonisjs-socketio
  ```
- And file start/websocket.ts and config/websocket.ts will be created

## Usage
```ts
// start/websocket.ts
import websocket from '@xnicecraft/adonisjs-socketio/services/main'
import type { WebSocketContext } from '@xnicecraft/adonisjs-socketio/types'

websocket.addCallback('connected', ({ socket, io, auth } : WebSocketContext) {
  // `websocket.server` is same as `io`
})

websocket.addCallback('disconnected', ({ socket, io, auth } : WebSocketContext) {

})
```