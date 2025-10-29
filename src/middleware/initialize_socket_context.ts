import { ServerResponse } from 'node:http'
import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'

import type { SocketIoMiddleware } from '../types.js'
import type { HttpContext } from '@adonisjs/core/http'

declare module 'socket.io' {
  interface Socket {
    context?: HttpContext
  }
}

let sessionAvailable: boolean | null = null

async function initializeSession(context: HttpContext, response: ServerResponse) {
  if (sessionAvailable === null) {
    try {
      await import('@adonisjs/session/session_middleware')
      sessionAvailable = true
    } catch {
      sessionAvailable = false
      console.info(
        'Session middleware not installed, skipping session initialization for WebSocket'
      )
    }
  }

  if (sessionAvailable) {
    try {
      const SessionMiddleware = await import('@adonisjs/session/session_middleware')
      const session = await app.container.make(SessionMiddleware.default)
      await session.handle(context, async () => response)
    } catch (error) {
      console.error('Failed to initialize session:', error)
    }
  }
}

export default async function InitializeSocketContext(
  socket: Parameters<SocketIoMiddleware>[0],
  next: Parameters<SocketIoMiddleware>[1]
) {
  const response = new ServerResponse(socket.request)

  const context = server.createHttpContext(
    server.createRequest(socket.request, response),
    server.createResponse(socket.request, response),
    app.container.createResolver()
  )

  await initializeSession(context, response)

  socket.context = context

  next()
}
