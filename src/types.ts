import type { Server, ServerOptions, Socket } from 'socket.io'
import type { MiddlewareFn, ParsedGlobalMiddleware } from '@adonisjs/http-server/types'
import type { HttpContext } from '@adonisjs/core/http'

export interface WebSocketConfig {
  middleware: Array<MiddlewareFn | ParsedGlobalMiddleware>
  socketOptions: Partial<ServerOptions>
}

export type WebSocketContext = {
  socket: Socket
  io: Server
} & Omit<HttpContext, 'response' | 'inspect'>

export type SocketIoMiddleware = Parameters<Server['use']>[0]
