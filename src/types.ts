import type { Server, ServerOptions, Socket } from 'socket.io'
import type { HttpContext } from '@adonisjs/core/http'
import type {
  Constructor,
  LazyImport,
  MiddlewareFn,
  ParsedGlobalMiddleware,
} from '@adonisjs/core/types/http'
import type { ModuleHandler } from '@adonisjs/core/types/container'

export interface WebSocketConfig {
  middleware: Array<MiddlewareFn | ParsedGlobalMiddleware>
  socketOptions: Partial<ServerOptions>
}

export type WebSocketContext = {
  socket: Socket
  io: Server
} & Omit<HttpContext, 'response' | 'inspect'>

export type WebSocketCallback = (ctx: WebSocketContext) => Promise<void>

export type SocketIoMiddleware = Parameters<Server['use']>[0]

export type StoreWebSocketRouteHandler =
  | WebSocketCallback
  | ({
      reference: string | [LazyImport<Constructor<any>> | Constructor<any>, any?]
    } & Omit<ModuleHandler<undefined, [WebSocketContext]>, 'name'>)
