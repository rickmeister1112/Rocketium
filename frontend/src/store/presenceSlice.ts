import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PresenceUser } from '../types/design';

interface CursorPosition {
  userId: string;
  x: number;
  y: number;
}

interface PresenceState {
  users: PresenceUser[];
  cursors: Record<string, CursorPosition>;
}

const initialState: PresenceState = {
  users: [],
  cursors: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setPresence(state, action: PayloadAction<PresenceUser[]>) {
      state.users = action.payload;
    },
    updateCursor(state, action: PayloadAction<CursorPosition>) {
      state.cursors[action.payload.userId] = action.payload;
    },
    clearCursor(state, action: PayloadAction<string>) {
      delete state.cursors[action.payload];
    },
    resetPresence() {
      return initialState;
    },
  },
});

export const { setPresence, updateCursor, clearCursor, resetPresence } = presenceSlice.actions;
export const presenceReducer = presenceSlice.reducer;

