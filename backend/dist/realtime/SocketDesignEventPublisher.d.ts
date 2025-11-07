import type { CommentDocument } from '../models/Comment';
import type { DesignDocument } from '../models/Design';
import type { IDesignEventPublisher } from './DesignEventPublisher';
export declare class SocketDesignEventPublisher implements IDesignEventPublisher {
    notifyDesignUpdated(design: DesignDocument): void;
    notifyCommentCreated(comment: CommentDocument): void;
    notifyCommentUpdated(comment: CommentDocument): void;
}
//# sourceMappingURL=SocketDesignEventPublisher.d.ts.map