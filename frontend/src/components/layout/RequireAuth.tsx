import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function RequireAuth({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <Loader2Icon className="h-8 w-8 animate-spin text-emerald" />
      </div>);

  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
