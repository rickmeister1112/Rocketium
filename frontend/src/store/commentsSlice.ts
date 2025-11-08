import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DesignApi, type CommentCreateRequest, type CommentUpdateRequest } from '../services/designs';
import type { Comment } from '../types/design';

interface CommentsState {
  items: Comment[];
  loading: boolean;
  error?: string;
}

const initialState: CommentsState = {
  items: [],
  loading: false,
};

export const fetchComments = createAsyncThunk('comments/fetch', async (designId: string) => {
  return DesignApi.listComments(designId);
});

export const postComment = createAsyncThunk(
  'comments/post',
  async ({ designId, payload }: { designId: string; payload: CommentCreateRequest }) => {
    return DesignApi.createComment(designId, payload);
  },
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ designId, commentId, payload }: { designId: string; commentId: string; payload: CommentUpdateRequest }) => {
    return DesignApi.updateComment(designId, commentId, payload);
  },
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addCommentRealtime(state, action) {
      const exists = state.items.some((comment) => comment.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    updateCommentRealtime(state, action) {
      const index = state.items.findIndex((comment) => comment.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    resetComments(state) {
      state.items = [];
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        const exists = state.items.some((comment) => comment.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.items.findIndex((comment) => comment.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { addCommentRealtime, updateCommentRealtime, resetComments } = commentsSlice.actions;
export const commentsReducer = commentsSlice.reducer;

