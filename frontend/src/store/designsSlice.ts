import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DesignApi, type DesignCreateRequest, type DesignUpdateRequest } from '../services/designs';
import type { Design, DesignMeta } from '../types/design';

interface DesignsState {
  items: DesignMeta[];
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

export const requestDesignAccess = createAsyncThunk(
  'designs/requestAccess',
  async (id: string) => {
    const response = await DesignApi.requestAccess(id);
    return { id, status: response.status };
  },
);

export const respondDesignAccess = createAsyncThunk(
  'designs/respondAccess',
  async ({ id, userId, action }: { id: string; userId: string; action: 'approve' | 'deny' }) => {
    const response = await DesignApi.respondAccess(id, userId, action);
    return response;
  },
);

const toDesignMeta = (design: Design): DesignMeta => {
  const pendingRequests =
    design.pendingRequests ??
    design.collaborators
      ?.filter((collaborator) => collaborator.status === 'pending')
      .map((collaborator) => ({
        userId: collaborator.userId,
        userName: collaborator.userName,
        requestedAt: collaborator.requestedAt,
        status: 'pending' as const,
      }));

  return {
    id: design.id,
    name: design.name,
    width: design.width,
    height: design.height,
    ownerId: design.ownerId,
    ownerName: design.ownerName,
    thumbnailUrl: design.thumbnailUrl,
    updatedAt: design.updatedAt,
    createdAt: design.createdAt,
    accessStatus: design.accessStatus,
    canDelete: design.canDelete,
    pendingRequests,
  };
};

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
        state.items.unshift(toDesignMeta(action.payload));
      })
      .addCase(updateDesignMeta.fulfilled, (state, action) => {
        const meta = toDesignMeta(action.payload);
        const index = state.items.findIndex((item) => item.id === meta.id);
        if (index !== -1) {
          state.items[index] = meta;
        } else {
          state.items.unshift(meta);
        }
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(requestDesignAccess.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const target = state.items.find((item) => item.id === id);
        if (target) {
          target.accessStatus = status === 'approved' ? 'collaborator' : 'pending';
        }
      })
      .addCase(respondDesignAccess.fulfilled, (state, action) => {
        const meta = toDesignMeta(action.payload);
        const index = state.items.findIndex((item) => item.id === meta.id);
        if (index !== -1) {
          state.items[index] = meta;
        }
      });
  },
});

export const designsReducer = designsSlice.reducer;

