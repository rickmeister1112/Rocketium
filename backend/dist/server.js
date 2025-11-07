"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const designHub_1 = require("./realtime/designHub");
const socketService_1 = require("./realtime/socketService");
const server = node_http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.env.clientUrl,
        credentials: true,
    },
});
(0, designHub_1.registerDesignHub)(io);
(0, socketService_1.setSocketServer)(io);
const start = async () => {
    await (0, database_1.connectDatabase)();
    server.listen(env_1.env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`⚡️ Server running on http://localhost:${env_1.env.port}`);
    });
};
start().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
});
const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('Shutting down gracefully...');
    io.close();
    server.close();
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
//# sourceMappingURL=server.js.map