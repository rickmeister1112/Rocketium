import { useCallback, useEffect, useState } from 'react';

const KEY = 'design-editor-user';

interface CurrentUser {
  id: string;
  name: string;
}

let cachedUser: CurrentUser | null = null;

const loadUser = (): CurrentUser => {
  if (cachedUser) {
    return cachedUser;
  }

  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CurrentUser;
      if (parsed?.id) {
        cachedUser = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read stored user', error);
  }

  cachedUser = { id: crypto.randomUUID(), name: '' };
  window.localStorage.setItem(KEY, JSON.stringify(cachedUser));
  return cachedUser;
};

const persistUser = (user: CurrentUser): void => {
  cachedUser = user;
  window.localStorage.setItem(KEY, JSON.stringify(user));
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser>(() => loadUser());

  const setUserName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      const next = { ...user, name: trimmed };
      persistUser(next);
      setUser(next);
    },
    [user],
  );

  const promptForName = useCallback((): string | undefined => {
    const existing = user.name ?? '';
    const input = window.prompt('Enter your name', existing) ?? '';
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }
    const next = { ...user, name: trimmed };
    persistUser(next);
    setUser(next);
    return trimmed;
  }, [user]);

  useEffect(() => {
    persistUser(user);
  }, [user]);

  return { user, setUserName, promptForName };
};

