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
### Registering Event Handlers
```ts
// start/websocket.ts
import websocket from '@xnicecraft/adonisjs-socketio/services/main'
import type { WebSocketContext } from '@xnicecraft/adonisjs-socketio/types'

websocket.on('connection', async ({ socket, io }) => {
  console.log('New client connected:', socket.id)
  
  socket.emit('welcome', { 
    message: 'Welcome to the server!',
    socketId: socket.id 
  })
})

websocket.on('message', async ({ socket, params }) => {
  console.log('Received message:', params.message)
  
  socket.emit('message', params.message)
}, ['message'])

websocket.on('disconnect', async ({ socket }) => {
  console.log('Client disconnected:', socket.id)
})
```

### Using Controllers
```typescript
// app/controllers/chat_controller.ts
import type { WebSocketContext } from '@xnicecraft/adonisjs-socketio/types'

export default class ChatController {
  async sendMessage({ socket, params }: WebSocketContext) {
    const { message } = params
    
    socket.broadcast.emit('newMessage', {
      message,
      from: socket.id,
      timestamp: Date.now(),
    })
    
    socket.emit('messageSent', { success: true })
  }
  
  async joinRoom({ socket, params }: WebSocketContext) {
    const { roomName } = params
    
    await socket.join(roomName)
    socket.emit('joinedRoom', { room: roomName })
    
    socket.to(roomName).emit('userJoined', { 
      userId: socket.id 
    })
  }
  
  async leaveRoom({ socket, params }: WebSocketContext) {
    const { roomName } = params
    
    await socket.leave(roomName)
    socket.to(roomName).emit('userLeft', { 
      userId: socket.id 
    })
  }
}
```

```ts
// start/websocket.ts
import websocket from '@xnicecraft/adonisjs-socketio/services/main'

websocket.on('chat:send', '#controllers/chat_controller.sendMessage', ['message'])
websocket.on('chat:join', '#controllers/chat_controller.joinRoom', ['roomName'])
websocket.on('chat:leave', '#controllers/chat_controller.leaveRoom', ['roomName'])
```

`To pass params from client to server, you need specify name for the key in 3rd parameters in form of array of string`