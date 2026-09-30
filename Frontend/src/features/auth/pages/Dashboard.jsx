import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  const { user, handleLogout, loading } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate("/login", { replace: true });
    } catch {
      // Keep the current page open if the session could not be closed.
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel auth-form-panel dashboard-panel">
        <span className="brand-mark">Career Sathi</span>
        <h1>Welcome, {user?.username}</h1>
        <p>Your career journey starts here.</p>
        <button className="primary-btn" type="button" onClick={onLogout} disabled={loading}>
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </main>
  );
}

export default Dashboard;
