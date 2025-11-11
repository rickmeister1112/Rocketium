import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/uiSlice';

export const RegisterPage = () => {
  const { register, loading, hasSession } = useCurrentUser();
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      setError(null);
      const session = await register(trimmedEmail, password);
      dispatch(
        showToast({
          id: Date.now().toString(),
          kind: 'success',
          message: `Welcome aboard, ${session.user.name}!`,
        }),
      );
      navigate('/');
    } catch (err) {
      const message =
        typeof err === 'object' && err && 'message' in err && typeof (err as { message?: string }).message === 'string'
          ? (err as { message?: string }).message
          : undefined;
      setError(message ?? 'Unable to complete registration.');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Sign up to receive a designer handle. We will generate a unique name for you to use across the workspace.
        </p>
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
            placeholder="Choose a secure password"
            autoComplete="new-password"
            required
            disabled={loading}
            minLength={8}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
        <p className="auth-footer">
          Already have an account? <Link to="/auth/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};


