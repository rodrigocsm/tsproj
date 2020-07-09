import fastify, { FastifyInstance } from 'fastify';
import Blipp from 'fastify-blipp';
import { Server, IncomingMessage, ServerResponse } from 'http';

export const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({ logger: true });

export const config = async (): Promise<void> => {
    server.register(Blipp);
    server.get('/books', async () => {
        return [
            { _id: '1', ISBN: '1234567890', title: 'book1', author: 'author1' },
            { _id: '1', ISBN: '9876543210', title: 'book2', author: 'author2' },
        ];
    });
};
export const start = async (port: number, address: string): Promise<void> => {
    try {
        await server.listen(port, address);
        server.blipp();
    } catch (error) {
        console.log(error);
        server.log.error(error);
        process.exit(1);
    }
};

export const stop = async (): Promise<void> => {
    try {
        await server.close();
    } catch (error) {
        console.log(error);
        server.log.error(error);
        process.exit(1);
    }
};
