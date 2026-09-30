import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await handleRegister({ username, email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create your account. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel auth-brand">
          <span className="brand-mark">Career Sathi</span>
          <h1>Build your future</h1>
          <p>Open new opportunities and start creating your next chapter.</p>
          <ul className="mini-list">
            <li>Create a personal career workspace</li>
            <li>Track your job applications</li>
            <li>Get role matches and interview preparation</li>
          </ul>
        </div>

        <div className="auth-panel auth-form-panel">
          <h2>Create account</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input id="username" name="username" type="text" autoComplete="username" minLength={3} maxLength={32} placeholder="your username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <label>
              Email
              <input id="email" type="email" autoComplete="email" maxLength={254} placeholder="name@email.com" name="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p className="privacy-inline"><Link to="/privacy">Privacy policy</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
