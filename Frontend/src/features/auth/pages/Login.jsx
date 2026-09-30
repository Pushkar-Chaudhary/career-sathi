
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                    <span className="brand-mark">
                        Career Sathi
                    </span>

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
                    <h2>Login</h2>

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

                        <label>
                            Password

                            <input
                                type="password"
                                placeholder="••••••••"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </label>

                        <div className="form-meta">
                            <label className="check-row">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>

                            <Link to="/register">
                                Forgot?
                            </Link>
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

