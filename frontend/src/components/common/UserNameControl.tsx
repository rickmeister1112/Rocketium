import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactElement } from 'react';

import { useCurrentUser } from '../../hooks/useCurrentUser';

export const UserNameControl = (): ReactElement => {
  const { user, updateName, loading, logout, hasSession } = useCurrentUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(user.name ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(user.name ?? '');
  }, [user.name]);

  useEffect(() => {
    if (!hasSession) {
      setIsEditing(false);
      setError(null);
    }
  }, [hasSession]);

  const handleSave = async (): Promise<void> => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return;
    }
    try {
      setError(null);
      const updated = await updateName(trimmed);
      setValue(updated.name);
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update name.';
      setError(message);
    }
  };

  const handleCancel = (): void => {
    setValue(user.name ?? '');
    setError(null);
    setIsEditing(false);
  };

  const handleLogout = (): void => {
    setIsEditing(false);
    logout();
    navigate('/auth/login');
  };

  if (!hasSession) {
    return (
      <div className="user-section">
        <div className="user-auth-links">
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-section">
      <button
        type="button"
        className="user-badge"
        onClick={() => {
          setValue(user.name ?? '');
          setIsEditing((prev) => !prev);
        }}
      >
        {user.name ? user.name : 'Set name'}
      </button>
      <div className="user-auth-info">
        {user.email && (
          <span className="user-email" title={user.email}>
            {user.email}
          </span>
        )}
        <button type="button" onClick={handleLogout} className="user-logout">
          Logout
        </button>
      </div>
      {isEditing && (
        <div className="user-name-popover">
          <label>
            <span>Your name</span>
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              placeholder="Enter your name"
              autoFocus
              disabled={loading}
            />
          </label>
          {error && <p className="user-name-error">{error}</p>}
          <div className="user-name-actions">
            <button type="button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button type="button" onClick={() => void handleSave()} disabled={!value.trim() || loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

