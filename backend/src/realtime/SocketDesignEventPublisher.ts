import type { CommentDocument } from '../models/Comment';
import type { DesignDocument } from '../models/Design';
import { clearDesignSession } from './designHub';
import { getSocketServer } from './socketService';
import type { IDesignEventPublisher } from './DesignEventPublisher';

export class SocketDesignEventPublisher implements IDesignEventPublisher {
  notifyDesignUpdated(design: DesignDocument): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(design.id.toString()).emit('design:updated', {
      designId: design.id.toString(),
      userId: undefined,
      patch: design.toJSON().elements,
      version: design.updatedAt.getTime(),
    });
  }

  notifyCommentCreated(comment: CommentDocument): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(comment.designId.toString()).emit('comment:created', {
      designId: comment.designId.toString(),
      comment: comment.toJSON(),
    });
  }

  notifyCommentUpdated(comment: CommentDocument): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(comment.designId.toString()).emit('comment:updated', {
      designId: comment.designId.toString(),
      comment: comment.toJSON(),
    });
  }

  notifyDesignDeleted(designId: string): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(designId).emit('design:deleted', { designId });
    io.in(designId).socketsLeave(designId);
    clearDesignSession(designId);
  }
}

