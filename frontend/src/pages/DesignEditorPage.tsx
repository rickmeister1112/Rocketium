import type Konva from 'konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DesignCanvas } from '../components/canvas/DesignCanvas';
import { CommentsPanel } from '../components/panels/CommentsPanel';
import { InspectorPanel } from '../components/panels/InspectorPanel';
import { LayersPanel } from '../components/panels/LayersPanel';
import { TopBar } from '../components/toolbar/TopBar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { connectSocket, disconnectSocket } from '../services/realtime';
import {
  addCommentRealtime,
  updateCommentRealtime,
  fetchComments,
  resetComments,
  postComment,
} from '../store/commentsSlice';
import { applyRemoteUpdate } from '../store/canvasSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPresence, updateCursor, resetPresence } from '../store/presenceSlice';
import { loadDesign } from '../store/thunks';
import { showToast } from '../store/uiSlice';
import type { DesignElement } from '../types/design';

export const DesignEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useCurrentUser();
  const stageRef = useRef<Konva.Stage | null>(null);
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const suppressBroadcast = useRef(false);

  const canvas = useAppSelector((state) => state.canvas);
  const presence = useAppSelector((state) => state.presence.users);
  const comments = useAppSelector((state) => state.comments.items);
  const [commentMode, setCommentMode] = useState(false);
  const [commentDraft, setCommentDraft] = useState<{
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    message: string;
    submitting: boolean;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    dispatch(loadDesign(id)).unwrap().catch(() => {
      dispatch(showToast({ id: Date.now().toString(), kind: 'error', message: 'Unable to load design' }));
      navigate('/');
    });
    dispatch(fetchComments(id));

    return () => {
      dispatch(resetComments());
    };
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (!id) {
      return () => undefined;
    }

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit('design:join', { designId: id, userId: user.id, name: user.name });

    socket.on('design:presence', ({ presence: users }) => {
      dispatch(setPresence(users));
    });

    socket.on('design:updated', ({ patch, version }) => {
      suppressBroadcast.current = true;
      dispatch(applyRemoteUpdate({ elements: patch as DesignElement[], version }));
    });

    socket.on('design:sync', ({ patch, version }: { patch: unknown; version: number }) => {
      suppressBroadcast.current = true;
      dispatch(applyRemoteUpdate({ elements: patch as DesignElement[], version }));
    });

    socket.on('comment:created', ({ comment }) => {
      dispatch(addCommentRealtime(comment));
    });

    socket.on('comment:updated', ({ comment }) => {
      dispatch(updateCommentRealtime(comment));
    });

    socket.on('cursor:updated', ({ userId, x, y }) => {
      dispatch(updateCursor({ userId, x, y }));
    });

    socket.on('design:deleted', ({ designId }: { designId: string }) => {
      if (designId !== id) {
        return;
      }
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'info',
          message: 'This design was deleted.',
        }),
      );
      navigate('/');
    });

    return () => {
      socket.emit('design:leave');
      socket.removeAllListeners();
      dispatch(resetPresence());
      disconnectSocket();
    };
  }, [dispatch, id, navigate, user.id, user.name]);

  useEffect(() => {
    if (!canvas.designId) return;
    if (!socketRef.current || !socketRef.current.connected) return;
    if (suppressBroadcast.current) {
      suppressBroadcast.current = false;
      return;
    }

    socketRef.current.emit('design:update', {
      designId: canvas.designId,
      userId: user.id,
      patch: canvas.elements,
      version: canvas.version,
    });
  }, [canvas.designId, canvas.elements, canvas.version, user.id]);

  const collaborators = useMemo(
    () => presence.filter((member) => member.userId !== user.id),
    [presence, user.id],
  );

  const handleCursorMove = (position: { x: number; y: number }): void => {
    if (!socketRef.current || !canvas.designId) return;
    socketRef.current.emit('cursor:update', {
      designId: canvas.designId,
      userId: user.id,
      x: position.x,
      y: position.y,
    });
  };

  const handleCommentPlacement = (payload: { x: number; y: number; screenX: number; screenY: number }): void => {
    setCommentDraft({ ...payload, message: '', submitting: false });
  };

  const handleSubmitComment = async (): Promise<void> => {
    if (!commentDraft || !canvas.designId) return;
    const { x, y, message } = commentDraft;
    if (!message.trim()) {
      setCommentDraft(null);
      return;
    }
    if (!user.name) {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'info',
          message: 'Please set your name from the top bar before posting comments.',
        }),
      );
      setCommentDraft((draft) => (draft ? { ...draft, submitting: false } : draft));
      return;
    }
    setCommentDraft((draft) => (draft ? { ...draft, submitting: true } : draft));
    try {
      await dispatch(
        postComment({
          designId: canvas.designId,
          payload: {
            authorName: user.name,
            authorId: user.id,
            message,
            x,
            y,
          },
        }),
      ).unwrap();
      setCommentDraft(null);
    } catch (error) {
      const err = error as { message?: string } | undefined;
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'error',
          message: err?.message ?? 'Unable to add comment',
        }),
      );
      setCommentDraft(null);
    }
  };

  return (
    <div className="editor-layout">
      <TopBar
        stageRef={stageRef}
        commentMode={commentMode}
        onToggleCommentMode={() => {
          setCommentDraft(null);
          setCommentMode((value) => !value);
        }}
        collaborators={collaborators}
      />
      <div className="editor-main">
        <LayersPanel />
        <div className="canvas-container">
          <DesignCanvas
            stageRef={stageRef}
            onCursorMove={handleCursorMove}
            commentMode={commentMode}
            onCommentPlacement={handleCommentPlacement}
            onCommentModeExit={() => setCommentMode(false)}
            comments={comments}
            commentDraft={
              commentDraft
                ? {
                    x: commentDraft.x,
                    y: commentDraft.y,
                    screenX: commentDraft.screenX,
                    screenY: commentDraft.screenY,
                  }
                : null
            }
          />
          {canvas.loading && <div className="loading-overlay">Loading…</div>}
          {commentDraft && (
            <div
              className="comment-editor-overlay"
              style={{ top: commentDraft.screenY, left: commentDraft.screenX }}
            >
              <textarea
                placeholder="Add a comment"
                value={commentDraft.message}
                onChange={(event) =>
                  setCommentDraft((draft) =>
                    draft ? { ...draft, message: event.currentTarget.value } : draft,
                  )
                }
                rows={3}
                autoFocus
              />
              <div className="comment-editor-actions">
                <button
                  type="button"
                  onClick={() => setCommentDraft(null)}
                  disabled={commentDraft.submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={commentDraft.submitting || !commentDraft.message.trim()}
                >
                  {commentDraft.submitting ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
        <InspectorPanel />
        <CommentsPanel />
      </div>
    </div>
  );
};

