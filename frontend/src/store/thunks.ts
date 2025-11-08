import { createAsyncThunk } from '@reduxjs/toolkit';

import { DesignApi, type DesignUpdateRequest } from '../services/designs';
import type { Design } from '../types/design';
import { showToast } from './uiSlice';
import { setDesign, markSaved, setLoading } from './canvasSlice';
import type { RootState } from './index';
import { fetchDesigns } from './designsSlice';

export const loadDesign = createAsyncThunk(
  'canvas/loadDesign',
  async (designId: string, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const design = await DesignApi.get(designId);
      dispatch(setDesign(design));
      return design;
    } finally {
      dispatch(setLoading(false));
    }
  },
);

interface SaveOptions {
  silent?: boolean;
}

export const saveDesign = createAsyncThunk(
  'canvas/saveDesign',
  async (options: SaveOptions | undefined, { dispatch, getState }) => {
    const state = getState() as RootState;
    const designId = state.canvas.designId;
    if (!designId) return null;

    const payload: DesignUpdateRequest = {
      name: state.canvas.name,
      width: state.canvas.width,
      height: state.canvas.height,
      elements: state.canvas.elements,
    };

    const design = await DesignApi.update(designId, payload);
    dispatch(markSaved());
    if (!options?.silent) {
      dispatch(showToast({ id: Date.now().toString(), kind: 'success', message: 'Design saved' }));
    }
    dispatch(fetchDesigns());
    return design;
  },
);

export const syncRemoteUpdate = createAsyncThunk(
  'canvas/syncRemoteUpdate',
  async (design: Design, { dispatch }) => {
    dispatch(setDesign(design));
    return design;
  },
);

