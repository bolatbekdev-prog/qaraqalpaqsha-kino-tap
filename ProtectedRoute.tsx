
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// Make children optional in the prop type to handle strict JSX validation in App.tsx
export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-plex-red/20 border-t-plex-red rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Пайдаланыўшы логиннен өтпеген bolsa, Login-ге жибериў
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}