import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/auth.api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send a reset link right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel auth-form-panel auth-standalone">
        <Link className="auth-back-link" to="/login">← Back to sign in</Link>
        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Forgot your password?</h1>
        <p className="auth-intro">Enter the email address on your account and we’ll send you a secure reset link.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="name@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Sending link…' : 'Send reset link'}</button>
        </form>
      </section>
    </main>
  );
}

export default ForgotPassword;
