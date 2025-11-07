"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketDesignEventPublisher = void 0;
const socketService_1 = require("./socketService");
class SocketDesignEventPublisher {
    notifyDesignUpdated(design) {
        const io = (0, socketService_1.getSocketServer)();
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
    notifyCommentCreated(comment) {
        const io = (0, socketService_1.getSocketServer)();
        if (!io) {
            return;
        }
        io.to(comment.designId.toString()).emit('comment:created', {
            designId: comment.designId.toString(),
            comment: comment.toJSON(),
        });
    }
    notifyCommentUpdated(comment) {
        const io = (0, socketService_1.getSocketServer)();
        if (!io) {
            return;
        }
        io.to(comment.designId.toString()).emit('comment:updated', {
            designId: comment.designId.toString(),
            comment: comment.toJSON(),
        });
    }
}
exports.SocketDesignEventPublisher = SocketDesignEventPublisher;
//# sourceMappingURL=SocketDesignEventPublisher.js.map