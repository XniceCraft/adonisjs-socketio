import { ServerResponse } from 'node:http';
import app from '@adonisjs/core/services/app';
import server from '@adonisjs/core/services/server';
export default async function InitializeSocketContext(socket, next) {
    const response = new ServerResponse(socket.request);
    const context = server.createHttpContext(server.createRequest(socket.request, response), server.createResponse(socket.request, response), app.container.createResolver());
    socket.context = context;
    next();
}
