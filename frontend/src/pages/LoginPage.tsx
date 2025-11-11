import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/uiSlice';

export const LoginPage = () => {
  const { login, loading, hasSession } = useCurrentUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasSession) {
      navigate('/');
    }
  }, [hasSession, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setError(null);
      const session = await login(email.trim(), password);
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'success',
          message: `Welcome back, ${session.user.name}!`,
        }),
      );
      navigate('/');
    } catch (err) {
      const message =
        typeof err === 'object' && err && 'message' in err && typeof (err as { message?: string }).message === 'string'
          ? (err as { message?: string }).message
          : undefined;
      setError(message ?? 'Unable to log in.');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="auth-subtitle">Access your projects and continue designing with your assigned handle.</p>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>
        <div className="auth-footer">
          <span>
            <Link to="/auth/forgot-password">Forgot password?</Link>
          </span>
          <span>
            Need an account? <Link to="/auth/register">Register</Link>
          </span>
        </div>
      </form>
    </div>
  );
};


