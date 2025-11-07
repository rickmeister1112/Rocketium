import { useState } from 'react';

import { useCurrentUser } from '../../hooks/useCurrentUser';

export const UserNameControl = (): JSX.Element => {
  const { user, setUserName } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(user.name ?? '');

  const handleSave = (): void => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return;
    }
    setUserName(trimmed);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setValue(user.name ?? '');
    setIsEditing(false);
  };

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
            />
          </label>
          <div className="user-name-actions">
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!value.trim()}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

