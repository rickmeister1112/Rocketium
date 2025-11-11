import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Design, DesignElement } from '../types/design';
import { cloneElements, normalizeZIndices, withElementDefaults } from '../utils/elements';

interface UpdateElementPayload {
  id: string;
  changes: Partial<DesignElement>;
}

interface RemoteUpdatePayload {
  elements: DesignElement[];
  version: number;
}

interface ReorderPayload {
  id: string;
  operation: 'forward' | 'backward' | 'front' | 'back';
}

interface CanvasState {
  designId: string | null;
  name: string;
  width: number;
  height: number;
  elements: DesignElement[];
  selectedId: string | null;
  loading: boolean;
  dirty: boolean;
  history: DesignElement[][];
  future: DesignElement[][];
  version: number;
}

const MAX_HISTORY = 20;

const initialState: CanvasState = {
  designId: null,
  name: 'Untitled',
  width: 1080,
  height: 1080,
  elements: [],
  selectedId: null,
  loading: false,
  dirty: false,
  history: [],
  future: [],
  version: 0,
};

const commitHistory = (state: CanvasState): void => {
  const snapshot = cloneElements(state.elements);
  const normalizedSnapshot = normalizeZIndices(snapshot);
  const lastSnapshot = state.history[state.history.length - 1];
  if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(normalizedSnapshot)) {
    return;
  }
  state.history.push(normalizedSnapshot);
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }
  state.future = [];
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDesign(state, action: PayloadAction<Design>) {
      const design = action.payload;
      const sameDesign = state.designId === design.id;
      const shouldPreserveElements = sameDesign && state.version > 0;

      state.designId = design.id;
      state.name = design.name;
      state.width = design.width;
      state.height = design.height;
      state.selectedId = null;
      state.dirty = false;

      if (!shouldPreserveElements) {
        state.elements = cloneElements(
          normalizeZIndices(design.elements.map((element) => withElementDefaults(element))),
        );
        state.history = [cloneElements(state.elements)];
        state.future = [];
        state.version = 0;
      } else if (state.history.length === 0) {
        state.history = [cloneElements(state.elements)];
      }
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
      state.dirty = true;
    },
    setDimensions(state, action: PayloadAction<{ width: number; height: number }>) {
      state.width = action.payload.width;
      state.height = action.payload.height;
      state.dirty = true;
    },
    selectElement(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    addElement(state, action: PayloadAction<DesignElement>) {
      const element = {
        ...withElementDefaults(action.payload),
        zIndex: state.elements.length,
      } as DesignElement;
      state.elements.push(element);
      state.selectedId = element.id;
      state.dirty = true;
      state.version += 1;
      commitHistory(state);
    },
    updateElement(state, action: PayloadAction<UpdateElementPayload>) {
      const { id, changes } = action.payload;
      const index = state.elements.findIndex((el) => el.id === id);
      if (index === -1) return;
      state.elements[index] = { ...state.elements[index], ...changes } as DesignElement;
      state.dirty = true;
      state.version += 1;
      commitHistory(state);
    },
    replaceElements(state, action: PayloadAction<DesignElement[]>) {
      state.elements = cloneElements(
        normalizeZIndices(action.payload.map((element) => withElementDefaults(element))),
      );
      state.dirty = true;
      state.version += 1;
      commitHistory(state);
    },
    removeElement(state, action: PayloadAction<string>) {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index === -1) return;
      state.elements.splice(index, 1);
      state.elements = normalizeZIndices(state.elements);
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
      state.dirty = true;
      state.version += 1;
      commitHistory(state);
    },
    reorderElement(state, action: PayloadAction<ReorderPayload>) {
      const { id, operation } = action.payload;
      const current = cloneElements(state.elements);
      const index = current.findIndex((el) => el.id === id);
      if (index === -1) return;
      const lastIndex = current.length - 1;
      let targetIndex = index;

      switch (operation) {
        case 'forward':
          if (index === lastIndex) return;
          targetIndex = index + 1;
          break;
        case 'backward':
          if (index === 0) return;
          targetIndex = index - 1;
          break;
        case 'front':
          if (index === lastIndex) return;
          targetIndex = lastIndex;
          break;
        case 'back':
          if (index === 0) return;
          targetIndex = 0;
          break;
        default:
          return;
      }

      const [element] = current.splice(index, 1);
      current.splice(targetIndex, 0, element);

      state.elements = normalizeZIndices(current);
      state.dirty = true;
      state.version += 1;
      commitHistory(state);
    },
    undo(state) {
      if (state.history.length <= 1) {
        return;
      }
      const currentSnapshot = state.history.pop();
      if (!currentSnapshot) return;
      state.future.unshift(currentSnapshot);
      const previousSnapshot = state.history[state.history.length - 1] ?? [];
      state.elements = cloneElements(previousSnapshot);
      state.dirty = true;
      state.version += 1;
    },
    redo(state) {
      if (state.future.length === 0) {
        return;
      }
      const nextSnapshot = state.future.shift();
      if (!nextSnapshot) return;
      state.elements = cloneElements(nextSnapshot);
      state.history.push(cloneElements(nextSnapshot));
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      }
      state.dirty = true;
      state.version += 1;
    },
    markSaved(state) {
      state.dirty = false;
    },
    applyRemoteUpdate(state, action: PayloadAction<RemoteUpdatePayload>) {
      const { elements, version } = action.payload;
      state.elements = cloneElements(
        normalizeZIndices(elements.map((element) => withElementDefaults(element))),
      );
      state.version = version;
    },
  },
});

export const {
  setLoading,
  setDesign,
  setName,
  setDimensions,
  selectElement,
  addElement,
  updateElement,
  replaceElements,
  removeElement,
  reorderElement,
  undo,
  redo,
  markSaved,
  applyRemoteUpdate,
} = canvasSlice.actions;

export const canvasReducer = canvasSlice.reducer;

