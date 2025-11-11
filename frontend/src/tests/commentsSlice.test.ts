import { describe, expect, it } from 'vitest';

import {
  addCommentRealtime,
  commentsReducer,
  postComment,
  resetComments,
  updateCommentRealtime,
} from '../store/commentsSlice';

const baseComment = {
  id: 'comment-1',
  designId: 'design-1',
  authorId: 'user-1',
  authorName: 'Tester',
  message: 'hello world',
  mentions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('commentsSlice', () => {
  it('adds realtime comments without duplicates', () => {
    let state = commentsReducer(undefined, { type: 'init' });
    state = commentsReducer(state, addCommentRealtime(baseComment));
    expect(state.items).toHaveLength(1);

    state = commentsReducer(state, addCommentRealtime(baseComment));
    expect(state.items).toHaveLength(1);
  });

  it('updates realtime comments', () => {
    const updated = { ...baseComment, message: 'updated' };
    let state = commentsReducer(undefined, addCommentRealtime(baseComment));
    state = commentsReducer(state, updateCommentRealtime(updated));

    expect(state.items[0].message).toBe('updated');
  });

  it('clears state on reset', () => {
    let state = commentsReducer(undefined, addCommentRealtime(baseComment));
    expect(state.items).toHaveLength(1);

    state = commentsReducer(state, resetComments());
    expect(state.items).toHaveLength(0);
  });

  it('handles fulfilled postComment action with dedupe', () => {
    const fulfilled = postComment.fulfilled(baseComment, '', {
      designId: baseComment.designId,
      payload: {
        authorName: baseComment.authorName,
        authorId: baseComment.authorId,
        message: baseComment.message,
      },
    });

    let state = commentsReducer(undefined, { type: 'init' });
    state = commentsReducer(state, fulfilled);
    expect(state.items).toHaveLength(1);

    state = commentsReducer(state, fulfilled);
    expect(state.items).toHaveLength(1);
  });
});


