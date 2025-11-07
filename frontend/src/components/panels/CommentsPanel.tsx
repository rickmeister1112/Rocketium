import type { FormEvent } from 'react';
import { useState } from 'react';

import { postComment, updateComment } from '../../store/commentsSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const mentionRegex = /(@[a-zA-Z0-9._-]+)/g;

const highlightMentions = (text: string) => {
  const parts = text.split(mentionRegex);
  return (
    <>
      {parts.map((part, index) => {
        const isMention = part.startsWith('@');
        if (isMention) {
          return (
            <span key={`${part}-${index}`} className="mention">
              {part}
            </span>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
};

export const CommentsPanel = () => {
  const dispatch = useAppDispatch();
  const { designId } = useAppSelector((state) => state.canvas);
  const { items, loading } = useAppSelector((state) => state.comments);
  const { user, promptForName } = useCurrentUser();
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  if (!designId) {
    return <aside className="comments-panel empty" />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!message.trim()) return;

    if (!user.name) {
      promptForName();
      if (!user.name) {
        return;
      }
    }

    await dispatch(
      postComment({
        designId,
        payload: {
          authorName: user.name,
          authorId: user.id,
          message,
        },
      }),
    );

    setMessage('');
  };

  const startEditing = (commentId: string, currentMessage: string): void => {
    setEditingId(commentId);
    setEditingValue(currentMessage);
    setEditingSubmitting(false);
  };

  const cancelEditing = (): void => {
    setEditingId(null);
    setEditingValue('');
    setEditingSubmitting(false);
  };

  const handleUpdate = async (): Promise<void> => {
    if (!editingId || !editingValue.trim() || !designId) {
      cancelEditing();
      return;
    }
    setEditingSubmitting(true);
    await dispatch(
      updateComment({
        designId,
        commentId: editingId,
        payload: {
          message: editingValue,
        },
      }),
    );
    cancelEditing();
  };

  return (
    <aside className="comments-panel">
      <header>
        <h2>Comments</h2>
      </header>
      <div className="comments-list">
        {loading ? (
          <p>Loading…</p>
        ) : (
          items.map((comment) => (
            <article key={comment.id}>
              <header>
                <strong>{comment.authorName}</strong>
                <time>{new Date(comment.createdAt).toLocaleString()}</time>
              </header>
              {editingId === comment.id ? (
                <div className="comment-edit-row">
                  <textarea
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.currentTarget.value)}
                    rows={3}
                  />
                  <div className="comment-editor-actions">
                    <button type="button" onClick={cancelEditing} disabled={editingSubmitting}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={editingSubmitting || !editingValue.trim()}
                    >
                      {editingSubmitting ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{highlightMentions(comment.message)}</p>
                  <div className="comment-actions">
                    {comment.authorId === user.id && (
                      <button type="button" onClick={() => startEditing(comment.id, comment.message)}>
                        Edit
                      </button>
                    )}
                    {comment.x !== undefined && comment.y !== undefined && (
                      <span className="comment-location">({Math.round(comment.x)}, {Math.round(comment.y)})</span>
                    )}
                  </div>
                </>
              )}
            </article>
          ))
        )}
        {items.length === 0 && !loading && <p className="empty">No comments yet.</p>}
      </div>
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          placeholder="Leave a comment. Use @name to mention."
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          rows={3}
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
};

