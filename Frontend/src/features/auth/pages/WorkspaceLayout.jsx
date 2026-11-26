import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import CareerGuide from "./CareerGuide";

const workspaceLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/interview-prep", label: "Interview questions" },
  { to: "/resume-builder", label: "Resume builder" },
  { to: "/roadmap", label: "Career roadmap" },
];

function WorkspaceLayout() {
  const { user, handleLogout, loading } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  const onLogout = async () => {
    setLogoutError("");
    try {
      await handleLogout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    }
  };

  return (
    <>
      <header className="workspace-topbar">
        <nav className="workspace-nav" aria-label="Main navigation">
          <div className="workspace-nav-links">
            {workspaceLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `workspace-nav-link${isActive ? " is-active" : ""}`}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="workspace-account">
            <span className="workspace-username">{user?.username}</span>
            <button className="workspace-signout" type="button" onClick={onLogout} disabled={loading}>
              {loading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </nav>
      </header>
      {logoutError && <p className="form-error workspace-logout-error" role="alert">{logoutError}</p>}
      <Outlet />
      <CareerGuide />
    </>
  );
}

export default WorkspaceLayout;
