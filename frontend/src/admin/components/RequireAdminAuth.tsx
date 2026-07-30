import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export function RequireAdminAuth({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <Loader2Icon className="h-8 w-8 animate-spin text-emerald" />
      </div>);

  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
