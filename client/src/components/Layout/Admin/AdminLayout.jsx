import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, LayoutDashboard, Settings, LogOut, ShoppingCart, Users } from 'lucide-react';
import './AdminLayout.css';
import '../../../pages/Admin/AdminShared.css';

function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // In a real app, clear tokens here
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span className="logo-icon">⚡</span>
                    <h2>Admin Panel</h2>
                </div>

                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <Package size={20} />
                        <span>Inventory</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <ShoppingCart size={20} />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <Users size={20} />
                        <span>Customers</span>
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Exit Admin</span>
                    </button>
                    <button onClick={() => navigate('/home')} className="view-store-btn" style={{ marginTop: '10px' }}>
                        <span>Return to Store</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main-content">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        {/* Could put breadcrumbs here */}
                    </div>
                    <div className="topbar-right">
                        <div className="admin-user-profile">
                            <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="Admin Avatar" className="avatar" />
                            <span>Administrator</span>
                        </div>
                    </div>
                </header>

                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
