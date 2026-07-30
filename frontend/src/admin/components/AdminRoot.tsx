import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from './ToastProvider';
import { ConfirmDialogProvider } from './ConfirmDialog';

// Auth is provided once, app-wide, in App.tsx (shared with the public site).
export function AdminRoot() {
  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <Outlet />
      </ConfirmDialogProvider>
    </ToastProvider>);

}
