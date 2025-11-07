import { configureStore } from '@reduxjs/toolkit';

import { canvasReducer } from './canvasSlice';
import { commentsReducer } from './commentsSlice';
import { designsReducer } from './designsSlice';
import { presenceReducer } from './presenceSlice';
import { uiReducer } from './uiSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    designs: designsReducer,
    comments: commentsReducer,
    presence: presenceReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

