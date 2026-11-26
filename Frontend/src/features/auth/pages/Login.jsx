
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await handleLogin({
                email,
                password
            });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to sign in. Please try again.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">

                <div className="auth-panel auth-brand">
                    <img className="brand-logo auth-brand-logo" src="/career-sathi-logo.png" alt="Career Sathi — Guide to Get Hired" />

                    <h1>Welcome back</h1>

                    <p>
                        Continue building your next step with clarity
                        and confidence.
                    </p>

                    <ul className="mini-list">
                        <li>Save roles and track application progress</li>
                        <li>Compare your resume with a job posting</li>
                        <li>Practice with a tailored interview plan</li>
                    </ul>
                </div>

                <div className="auth-panel auth-form-panel">
                    <p className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
                    <h2>Welcome back</h2>
                    <p className="auth-intro">Sign in to pick up where you left off.</p>
                    {location.state?.message && <p className="form-success" role="status">{location.state.message}</p>}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <label>
                            Email

                            <input
                                type="email"
                                placeholder="name@email.com"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </label>

                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                            <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
                        </div>

                        <div className="form-meta">
                            <span className="muted-copy">Your session lasts 24 hours.</span>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="switch-text">
                        New here?{" "}
                        <Link to="/register">
                            Create account
                        </Link>
                    </p>
                    <p className="privacy-inline"><Link to="/privacy">Privacy policy</Link></p>
                </div>

            </div>
        </div>
    );
}

export default Login;

