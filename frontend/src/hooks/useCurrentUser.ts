import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthApi } from '../services/auth';

export const SESSION_STORAGE_KEY = 'design-editor-session';

interface SessionData {
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

interface DecodedToken {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
}

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }
  const bufferCtor = (globalThis as { Buffer?: { from(data: string, encoding: string): { toString(encoding: string): string } } }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(padded, 'base64').toString('utf-8');
  }
  throw new Error('No base64 decoder available');
};

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
};

const isTokenExpired = (decoded: DecodedToken | null): boolean => {
  if (!decoded?.exp) {
    return false;
  }
  const expiresAt = decoded.exp * 1000;
  return expiresAt < Date.now();
};

const loadSession = (): SessionData | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as SessionData;
    if (!parsed?.token) {
      return null;
    }
    const decoded = decodeToken(parsed.token);
    if (!decoded || isTokenExpired(decoded) || !decoded.sub || !decoded.email) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return {
      token: parsed.token,
      user: {
        id: decoded.sub,
        name: decoded.name ?? parsed.user?.name ?? '',
        email: decoded.email ?? parsed.user?.email,
      },
    };
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const persistSession = (session: SessionData | null): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const useCurrentUser = () => {
  const [sessionState, setSessionState] = useState<SessionData | null>(() => loadSession());
  const [loading, setLoading] = useState(false);

  const setSession = useCallback((next: SessionData | null) => {
    setSessionState(next);
    persistSession(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleSessionExpired = () => {
      setSession(null);
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [setSession]);

  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<SessionData> => {
      setLoading(true);
      try {
        const result = await AuthApi.register({ email, password, name });
        setSession(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setSession],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<SessionData> => {
      setLoading(true);
      try {
        const result = await AuthApi.login({ email, password });
        setSession(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setSession],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const updateName = useCallback(
    async (name: string): Promise<{ id: string; name: string }> => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('Name is required');
      }
      if (!sessionState) {
        throw new Error('You need to log in to update your name');
      }
      if (!sessionState.user.email) {
        throw new Error('Profile updates require a registered account');
      }
      setLoading(true);
      try {
        const response = await AuthApi.updateProfile({ name: trimmed });
        const nextSession: SessionData = {
          token: response.token,
          user: response.user,
        };
        setSession(nextSession);
        return response.user;
      } finally {
        setLoading(false);
      }
    },
    [sessionState, setSession],
  );

  const promptForName = useCallback(async (): Promise<{ id: string; name: string } | undefined> => {
    if (!sessionState) {
      return undefined;
    }
    const existing = sessionState.user.name ?? '';
    const input = window.prompt('Enter your name', existing) ?? '';
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }
    const updated = await updateName(trimmed);
    return updated;
  }, [sessionState, updateName]);

  const forgotPassword = useCallback(
    async (email?: string): Promise<string> => {
      setLoading(true);
      try {
        const response = await AuthApi.forgotPassword({ email });
        return response.message;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const user = useMemo(
    () => sessionState?.user ?? { id: '', name: '', email: undefined },
    [sessionState],
  );

  const hasSession = Boolean(sessionState?.token && sessionState.user.email);

  return {
    user,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    updateName,
    promptForName,
    hasSession,
  };
};


