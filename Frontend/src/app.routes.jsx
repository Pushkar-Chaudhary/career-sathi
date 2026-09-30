import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Dashboard from "./features/auth/pages/Dashboard";
import GuestRoute from "./features/auth/pages/GuestRoute";
import ProtectedRoute from "./features/auth/pages/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <GuestRoute><Login /></GuestRoute>,
  },
  {
    path: "/register",
    element: <GuestRoute><Register /></GuestRoute>,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <Dashboard /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
