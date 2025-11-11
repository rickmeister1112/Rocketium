"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDesignHub = exports.clearDesignSession = void 0;
const presenceByDesign = new Map();
const latestSnapshotByDesign = new Map();
const getPresenceMap = (designId) => {
    if (!presenceByDesign.has(designId)) {
        presenceByDesign.set(designId, new Map());
    }
    return presenceByDesign.get(designId);
};
const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa', '#007aff', '#5856d6', '#ff2d55'];
const pickColor = (index) => {
    const safeIndex = ((index % COLORS.length) + COLORS.length) % COLORS.length;
    const color = COLORS[safeIndex];
    return color ?? '#34c759';
};
const clearDesignSession = (designId) => {
    presenceByDesign.delete(designId);
    latestSnapshotByDesign.delete(designId);
};
exports.clearDesignSession = clearDesignSession;
const broadcastPresence = (io, designId) => {
    const presence = Array.from(getPresenceMap(designId).values());
    io.to(designId).emit('design:presence', { designId, presence });
};
const handleDisconnect = (io, socket) => {
    const { designId, userId } = socket.data;
    if (!designId || !userId) {
        return;
    }
    const presenceMap = presenceByDesign.get(designId);
    if (!presenceMap) {
        return;
    }
    presenceMap.delete(userId);
    if (presenceMap.size === 0) {
        (0, exports.clearDesignSession)(designId);
    }
    broadcastPresence(io, designId);
};
const registerDesignHub = (io) => {
    io.on('connection', (socket) => {
        socket.on('design:join', (payload) => {
            const { designId, userId, name } = payload;
            socket.join(designId);
            socket.data = { designId, userId };
            const presence = getPresenceMap(designId);
            const existing = presence.get(userId);
            const color = existing?.color ?? pickColor(presence.size);
            presence.set(userId, { userId, name, color });
            socket.emit('design:joined', { designId, color });
            broadcastPresence(io, designId);
            socket.to(designId).emit('design:user_joined', { designId, userId, name, color });
            const snapshot = latestSnapshotByDesign.get(designId);
            if (snapshot) {
                socket.emit('design:sync', { designId, ...snapshot });
            }
        });
        socket.on('design:leave', () => {
            const { designId } = socket.data;
            if (designId) {
                socket.leave(designId);
            }
            handleDisconnect(io, socket);
        });
        socket.on('design:update', (payload) => {
            const { designId, userId, patch, version } = payload;
            latestSnapshotByDesign.set(designId, { patch, version });
            socket.to(designId).emit('design:updated', { designId, userId, patch, version });
        });
        socket.on('cursor:update', (payload) => {
            const { designId, userId, x, y } = payload;
            socket.to(designId).emit('cursor:updated', { designId, userId, x, y });
        });
        socket.on('comment:created', (payload) => {
            const { designId, comment } = payload;
            socket.to(designId).emit('comment:created', { designId, comment });
        });
        socket.on('disconnect', () => handleDisconnect(io, socket));
    });
};
exports.registerDesignHub = registerDesignHub;
//# sourceMappingURL=designHub.js.map