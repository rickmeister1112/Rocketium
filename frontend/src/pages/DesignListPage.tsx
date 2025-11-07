import { useEffect, type KeyboardEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createDesign, deleteDesign as deleteDesignThunk, fetchDesigns } from '../store/designsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { UserNameControl } from '../components/common/UserNameControl';
import { showToast } from '../store/uiSlice';

const DEFAULT_SIZE = 1080;

export const DesignListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector((state) => state.designs);

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const handleCreate = async (): Promise<void> => {
    const result = await dispatch(createDesign({
      name: 'Untitled design',
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
      elements: [],
    }));

    if (createDesign.fulfilled.match(result)) {
      navigate(`/designs/${result.payload.id}`);
    }
  };

  const handleOpen = (id: string): void => {
    navigate(`/designs/${id}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen(id);
    }
  };

  const handleDelete = async (
    event: MouseEvent<HTMLButtonElement>,
    id: string,
    name: string,
  ): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    const result = await dispatch(deleteDesignThunk(id));
    if (deleteDesignThunk.fulfilled.match(result)) {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'success',
          message: `Deleted "${name}".`,
        }),
      );
    } else {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'error',
          message: result.error?.message ?? 'Unable to delete design.',
        }),
      );
    }
  };

  return (
    <div className="design-list-page">
      <header className="design-page-top">
        <div className="design-page-title">
          <h1>My Designs</h1>
          <p className="design-page-subtitle">Create, organize, and jump back into your projects.</p>
        </div>
        <div className="design-page-actions">
          <UserNameControl />
          <button type="button" className="primary" onClick={handleCreate}>
            New design
          </button>
        </div>
      </header>
      {loading ? (
        <p>Loading designs…</p>
      ) : items.length === 0 ? (
        <p>No designs yet. Create your first design!</p>
      ) : (
        <div className="design-grid">
          {items.map((design) => (
            <div
              key={design.id}
              className="design-card"
              role="button"
              tabIndex={0}
              onClick={() => handleOpen(design.id)}
              onKeyDown={(event) => handleCardKeyDown(event, design.id)}
            >
              <div className="design-card-thumb" aria-hidden />
              <div className="design-card-meta">
                <h2>{design.name}</h2>
                <div className="design-card-actions">
                  <span className="design-card-updated">
                    {new Date(design.updatedAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="design-card-delete"
                    onClick={(event) => handleDelete(event, design.id, design.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

