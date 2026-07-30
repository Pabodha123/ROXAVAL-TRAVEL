// Auth is now provided app-wide by ../../context/AuthContext (shared with the
// public site so a logged-in session persists across both areas). This file
// re-exports it under the old admin-scoped name so existing admin imports
// don't need to change.
export { useAuth as useAdminAuth } from '../../context/AuthContext';
export type { AuthUser as AdminUser } from '../../context/AuthContext';
