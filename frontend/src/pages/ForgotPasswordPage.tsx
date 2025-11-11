import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useCurrentUser } from '../hooks/useCurrentUser';

export const ForgotPasswordPage = () => {
  const { forgotPassword, loading } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    const responseMessage = await forgotPassword(trimmed || undefined);
    setMessage(responseMessage);
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot password</h1>
        <p className="auth-subtitle">
          We do not reset passwords automatically. Provide your email so we can alert the administrator, or contact the
          admin directly for assistance.
        </p>
        <label>
          Email address (optional)
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />
        </label>
        {message && <p className="auth-info">{message}</p>}
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Sending…' : 'Contact admin'}
        </button>
        <p className="auth-footer">
          <Link to="/auth/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
};


