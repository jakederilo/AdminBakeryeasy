// ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>; // Render the protected content if authenticated
};

export default ProtectedRoute;
