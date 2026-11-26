import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Dashboard from "./features/auth/pages/Dashboard";
import GuestRoute from "./features/auth/pages/GuestRoute";
import ProtectedRoute from "./features/auth/pages/ProtectedRoute";
import PrivacyPolicy from "./features/privacy/PrivacyPolicy";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import WorkspaceLayout from "./features/auth/pages/WorkspaceLayout";
import InterviewPrep from "./features/auth/pages/InterviewPrep";
import ResumeBuilderPage from "./features/auth/pages/ResumeBuilderPage";
import Roadmap from "./features/auth/pages/Roadmap";

export const router = createBrowserRouter([
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/login",
    element: <GuestRoute><Login /></GuestRoute>,
  },
  {
    path: "/register",
    element: <GuestRoute><Register /></GuestRoute>,
  },
  {
    path: "/forgot-password",
    element: <GuestRoute><ForgotPassword /></GuestRoute>,
  },
  {
    path: "/reset-password",
    element: <GuestRoute><ResetPassword /></GuestRoute>,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <WorkspaceLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/interview-prep", element: <InterviewPrep /> },
          { path: "/resume-builder", element: <ResumeBuilderPage /> },
          { path: "/roadmap", element: <Roadmap /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
