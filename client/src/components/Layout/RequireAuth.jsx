import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * RequireAuth — wraps any route that needs a logged-in user.
 * If not logged in → redirect to /login, preserving the original
 * destination in ?redirect= so Login can send them back after auth.
 */
export default function RequireAuth() {
    const token    = useAuthStore((s) => s.token);
    const location = useLocation();

    if (!token) {
        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return <Outlet />;
}
