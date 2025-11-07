"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketServer = exports.setSocketServer = void 0;
let ioInstance = null;
const setSocketServer = (io) => {
    ioInstance = io;
};
exports.setSocketServer = setSocketServer;
const getSocketServer = () => ioInstance;
exports.getSocketServer = getSocketServer;
//# sourceMappingURL=socketService.js.map