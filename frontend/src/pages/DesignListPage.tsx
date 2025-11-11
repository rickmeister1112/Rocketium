import { useEffect, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createDesign,
  deleteDesign as deleteDesignThunk,
  fetchDesigns,
  requestDesignAccess,
  respondDesignAccess,
} from '../store/designsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { UserNameControl } from '../components/common/UserNameControl';
import { showToast } from '../store/uiSlice';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { DesignMeta } from '../types/design';

const DEFAULT_SIZE = 1080;

export const DesignListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, promptForName, hasSession, loading: userLoading } = useCurrentUser();
  const { items, loading } = useAppSelector((state) => state.designs);
  const isFetching = loading || !hasSession;

  useEffect(() => {
    if (!userLoading && !hasSession) {
      navigate('/auth/login');
    }
  }, [userLoading, hasSession, navigate]);

  useEffect(() => {
    if (!hasSession) {
      return;
    }
    dispatch(fetchDesigns());
  }, [dispatch, hasSession]);

  const handleCreate = async (): Promise<void> => {
    if (!hasSession) {
      navigate('/auth/login');
      return;
    }
    if (!user.name) {
      const updated = await promptForName();
      if (!updated) {
        return;
      }
    }
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

  const handleOpen = async (design: DesignMeta): Promise<void> => {
    if (design.accessStatus === 'owner' || design.accessStatus === 'collaborator') {
      navigate(`/designs/${design.id}`);
      return;
    }

    if (design.accessStatus === 'pending') {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'info',
          message: 'Access request is pending approval.',
        }),
      );
      return;
    }

    if (design.accessStatus === 'denied') {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'error',
          message: 'Access to this design has been denied.',
        }),
      );
      return;
    }

    const result = await dispatch(requestDesignAccess(design.id));
    if (requestDesignAccess.fulfilled.match(result)) {
      const { status } = result.payload;
      if (status === 'approved') {
        dispatch(
          showToast({
            id: Date.now().toString(),
            kind: 'success',
            message: 'Access granted. Opening design…',
          }),
        );
        navigate(`/designs/${design.id}`);
      } else {
        dispatch(
          showToast({
            id: Date.now().toString(),
            kind: 'info',
            message: 'Access requested. Waiting for owner approval.',
          }),
        );
      }
    } else {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'error',
          message: result.error?.message ?? 'Unable to request access.',
        }),
      );
    }
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, design: DesignMeta): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void handleOpen(design);
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

  const handleRespondToRequest = async (
    id: string,
    userId: string,
    action: 'approve' | 'deny',
  ): Promise<void> => {
    const result = await dispatch(respondDesignAccess({ id, userId, action }));
    if (respondDesignAccess.fulfilled.match(result)) {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: action === 'approve' ? 'success' : 'info',
          message:
            action === 'approve'
              ? 'Access request approved.'
              : 'Access request denied.',
        }),
      );
    } else {
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'error',
          message: result.error?.message ?? 'Unable to update access request.',
        }),
      );
    }
  };

  const renderAccessBadge = (design: DesignMeta): ReactNode => {
    switch (design.accessStatus) {
      case 'owner':
        return null;
      case 'collaborator':
        return <span className="design-card-access granted">Access granted</span>;
      case 'pending':
        return <span className="design-card-access pending">Access pending</span>;
      case 'denied':
        return <span className="design-card-access denied">Access denied</span>;
      case 'none':
      default:
        return <span className="design-card-access requestable">Request access</span>;
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
          <button
            type="button"
            className="primary"
            onClick={() => void handleCreate()}
            disabled={!hasSession}
          >
            New design
          </button>
        </div>
      </header>
      {isFetching ? (
        <p>Loading designs…</p>
      ) : items.length === 0 ? (
        <p>No designs yet. Create your first design!</p>
      ) : (
        <div className="design-grid">
          {items.map((design) => {
            const canDelete = design.canDelete;
            const pendingRequests = design.pendingRequests ?? [];
            return (
            <div
              key={design.id}
              className="design-card"
              role="button"
              tabIndex={0}
              onClick={() => void handleOpen(design)}
              onKeyDown={(event) => handleCardKeyDown(event, design)}
            >
              <div className="design-card-thumb" aria-hidden />
              <div className="design-card-meta">
                <h2>{design.name}</h2>
                <div className="design-card-actions">
                  <span className="design-card-updated">
                    {new Date(design.updatedAt).toLocaleString()}
                  </span>
                  {design.ownerName && (
                    <span className="design-card-owner">Created by {design.ownerName}</span>
                  )}
                  {renderAccessBadge(design)}
                  <button
                    type="button"
                    className="design-card-delete"
                    onClick={(event) => handleDelete(event, design.id, design.name)}
                    disabled={!canDelete}
                    title={
                      canDelete ? undefined : 'Only the creator of this design can delete it.'
                    }
                  >
                    Delete
                  </button>
                </div>
                {pendingRequests.length > 0 && (
                  <div className="design-card-requests">
                    <p>
                      {pendingRequests.length === 1
                        ? '1 access request pending'
                        : `${pendingRequests.length} access requests pending`}
                    </p>
                    <ul>
                      {pendingRequests.map((request) => (
                        <li key={request.userId}>
                          <span>{request.userName ?? 'Unknown user'}</span>
                          <div className="design-card-request-actions">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleRespondToRequest(design.id, request.userId, 'approve');
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleRespondToRequest(design.id, request.userId, 'deny');
                              }}
                            >
                              Deny
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

