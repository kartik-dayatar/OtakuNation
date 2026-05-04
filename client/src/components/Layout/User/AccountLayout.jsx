import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
    LayoutGrid, 
    Package, 
    User, 
    MapPin, 
    LogOut 
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import '../../../pages/User/Account.css';

export default function AccountLayout() {
    const { user, logout: authLogout } = useAuthStore();

    const getInitials = () => {
        if (!user) return '?';
        const first = user.firstName?.[0] || user.fullName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase();
    };

    if (!user) return <div className="account-container"><p>Please log in.</p></div>;

    return (
        <main className="account-container">
            <div className="account-layout">
                {/* SIDEBAR */}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <div className="user-avatar-circle">{getInitials()}</div>
                        <div className="user-name">{user.fullName || `${user.firstName} ${user.lastName}`}</div>
                        <div className="user-email">{user.email}</div>
                    </div>

                    <nav className="sidebar-menu">
                        <div className="sidebar-section-label">General</div>
                        <NavLink
                            to="/account/overview"
                            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
                            end
                        >
                            <LayoutGrid size={18} /> Overview
                        </NavLink>
                        
                        <NavLink 
                            to="/account/orders" 
                            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
                        >
                            <Package size={18} /> My Orders
                        </NavLink>

                        <div className="sidebar-divider"></div>

                        <div className="sidebar-section-label">Settings</div>
                        <NavLink
                            to="/account/profile"
                            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
                        >
                            <User size={18} /> Profile Details
                        </NavLink>
                        <NavLink
                            to="/account/addresses"
                            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
                        >
                            <MapPin size={18} /> Addresses
                        </NavLink>

                        <button onClick={authLogout} className="sidebar-btn logout">
                            <LogOut size={18} /> Logout
                        </button>
                    </nav>

                    <div className="sidebar-watermark">
                        ⚡ Otaku Nation
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <section className="account-content">
                    <Outlet />
                </section>
            </div>
        </main>
    );
}
