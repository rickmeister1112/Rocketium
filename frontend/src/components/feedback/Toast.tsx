import { useEffect } from 'react';

import { clearToast } from '../../store/uiSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const AUTO_DISMISS_MS = 2500;

export const Toast = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => {
      dispatch(clearToast());
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeout);
  }, [dispatch, toast]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.kind}`}>
      {toast.message}
      <button type="button" onClick={() => dispatch(clearToast())} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

