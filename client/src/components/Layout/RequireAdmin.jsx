import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * RequireAdmin — wraps any route that needs role === 'admin'.
 * If not logged in → redirect to /admin-login
 * If logged in but not admin → redirect to /
 */
export default function RequireAdmin() {
    const { token, user } = useAuthStore();

    if (!token) {
        return <Navigate to="/admin-login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
