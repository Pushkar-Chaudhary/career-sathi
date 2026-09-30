import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth.context";

function GuestRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <main className="auth-page">Loading...</main>;
  return user ? <Navigate to="/" replace /> : children;
}

export default GuestRoute;
