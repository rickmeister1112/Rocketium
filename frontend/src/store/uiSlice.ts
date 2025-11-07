import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  toast?: ToastState;
}

const initialState: UiState = {};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action: PayloadAction<ToastState>) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = undefined;
    },
  },
});

export const { showToast, clearToast } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

