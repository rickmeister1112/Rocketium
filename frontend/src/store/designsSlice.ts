import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DesignApi, type DesignCreateRequest, type DesignUpdateRequest } from '../services/designs';
import type { Design } from '../types/design';

interface DesignsState {
  items: Design[];
  loading: boolean;
  error?: string;
}

const initialState: DesignsState = {
  items: [],
  loading: false,
};

export const fetchDesigns = createAsyncThunk('designs/fetch', async (search?: string) => {
  return DesignApi.list(search);
});

export const createDesign = createAsyncThunk('designs/create', async (payload: DesignCreateRequest) => {
  return DesignApi.create(payload);
});

export const updateDesignMeta = createAsyncThunk(
  'designs/updateMeta',
  async ({ id, payload }: { id: string; payload: DesignUpdateRequest }) => {
    return DesignApi.update(id, payload);
  },
);

export const deleteDesign = createAsyncThunk('designs/delete', async (id: string) => {
  return DesignApi.delete(id);
});

const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateDesignMeta.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      });
  },
});

export const designsReducer = designsSlice.reducer;

