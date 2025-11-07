import type { Server, Socket } from 'socket.io';

interface Presence {
  userId: string;
  name: string;
  color: string;
}

const presenceByDesign = new Map<string, Map<string, Presence>>();
interface DesignSnapshot {
  patch: unknown;
  version: number;
}
const latestSnapshotByDesign = new Map<string, DesignSnapshot>();

const getPresenceMap = (designId: string): Map<string, Presence> => {
  if (!presenceByDesign.has(designId)) {
    presenceByDesign.set(designId, new Map());
  }
  return presenceByDesign.get(designId)!;
};

const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa', '#007aff', '#5856d6', '#ff2d55'];

const pickColor = (index: number): string => {
  const safeIndex = ((index % COLORS.length) + COLORS.length) % COLORS.length;
  const color = COLORS[safeIndex];
  return color ?? '#34c759';
};

interface DesignJoinPayload {
  designId: string;
  userId: string;
  name: string;
}

interface DesignUpdatePayload {
  designId: string;
  userId: string;
  patch: unknown;
  version: number;
}

interface CursorUpdatePayload {
  designId: string;
  userId: string;
  x: number;
  y: number;
}

interface CommentRealtimePayload {
  designId: string;
  comment: unknown;
}

export const clearDesignSession = (designId: string): void => {
  presenceByDesign.delete(designId);
  latestSnapshotByDesign.delete(designId);
};

const broadcastPresence = (io: Server, designId: string): void => {
  const presence = Array.from(getPresenceMap(designId).values());
  io.to(designId).emit('design:presence', { designId, presence });
};

const handleDisconnect = (io: Server, socket: Socket): void => {
  const { designId, userId } = socket.data as { designId?: string; userId?: string };
  if (!designId || !userId) {
    return;
  }

  const presenceMap = presenceByDesign.get(designId);
  if (!presenceMap) {
    return;
  }

  presenceMap.delete(userId);
  if (presenceMap.size === 0) {
    clearDesignSession(designId);
  }
  broadcastPresence(io, designId);
};

export const registerDesignHub = (io: Server): void => {
  io.on('connection', (socket) => {
    socket.on('design:join', (payload: DesignJoinPayload) => {
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
      const { designId } = socket.data as { designId?: string };
      if (designId) {
        socket.leave(designId);
      }
      handleDisconnect(io, socket);
    });

    socket.on('design:update', (payload: DesignUpdatePayload) => {
      const { designId, userId, patch, version } = payload;
      latestSnapshotByDesign.set(designId, { patch, version });
      socket.to(designId).emit('design:updated', { designId, userId, patch, version });
    });

    socket.on('cursor:update', (payload: CursorUpdatePayload) => {
      const { designId, userId, x, y } = payload;
      socket.to(designId).emit('cursor:updated', { designId, userId, x, y });
    });

    socket.on('comment:created', (payload: CommentRealtimePayload) => {
      const { designId, comment } = payload;
      socket.to(designId).emit('comment:created', { designId, comment });
    });

    socket.on('disconnect', () => handleDisconnect(io, socket));
  });
};

