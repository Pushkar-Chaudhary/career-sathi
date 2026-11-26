import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth.api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword({ token, password });
      navigate('/login', { replace: true, state: { message: 'Your password has been reset. Sign in with your new password.' } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset your password. Request a new link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel auth-form-panel auth-standalone">
        <Link className="auth-back-link" to="/login">← Back to sign in</Link>
        <p className="auth-eyebrow">SECURE ACCOUNT RECOVERY</p>
        <h1>Choose a new password</h1>
        <p className="auth-intro">Use at least 8 characters. This reset link expires after 30 minutes and works once.</p>
        {!token ? (
          <p className="form-error" role="alert">This reset link is missing or invalid. <Link to="/forgot-password">Request a new one</Link>.</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="password">New password</label>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Updating password…' : 'Update password'}</button>
          </form>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
