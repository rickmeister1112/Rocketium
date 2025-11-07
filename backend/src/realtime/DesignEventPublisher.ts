import type { CommentDocument } from '../models/Comment';
import type { DesignDocument } from '../models/Design';

export interface IDesignEventPublisher {
  notifyDesignUpdated(design: DesignDocument): void;
  notifyCommentCreated(comment: CommentDocument): void;
  notifyCommentUpdated(comment: CommentDocument): void;
  notifyDesignDeleted(designId: string): void;
}

