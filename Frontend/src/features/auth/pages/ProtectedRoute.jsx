import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../auth.context";

function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <main className="auth-page">Loading...</main>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
