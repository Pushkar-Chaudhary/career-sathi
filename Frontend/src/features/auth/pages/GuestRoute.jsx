import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth.context";

function GuestRoute({ children }) {
  const { user, loading, sessionError, retrySession } = useContext(AuthContext);

  if (loading) return <main className="auth-page">Loading...</main>;
  if (sessionError) {
    return (
      <main className="auth-page" role="alert">
        <p>Unable to connect to the server.</p>
        <button type="button" onClick={retrySession}>Retry</button>
      </main>
    );
  }
  return user ? <Navigate to="/" replace /> : children;
}

export default GuestRoute;
