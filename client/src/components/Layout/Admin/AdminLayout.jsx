import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Settings, LogOut, ShoppingCart, Users, Search, Bell, Store, Menu, X, AlertTriangle, Star } from 'lucide-react';
import useProductStore from '../../../store/productStore';
import useAuthStore from '../../../store/authStore';
import './AdminLayout.css';
import '../../../pages/Admin/AdminShared.css';

const routeLabels = {
    '/admin': 'Dashboard',
    '/admin/inventory': 'Inventory',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/settings': 'Settings',
};

const MOCK_ORDERS = [
    { id: 'ORD-8902', customer: 'Sakura M.' },
    { id: 'ORD-8901', customer: 'Kenji R.' },
    { id: 'ORD-8900', customer: 'Aiko T.' },
    { id: 'ORD-8899', customer: 'Haruto K.' },
    { id: 'ORD-8898', customer: 'Yuki S.' },
];

const NOTIFICATIONS = [
    {
        icon: AlertTriangle,
        color: '#d97706',
        bg: '#fef3c7',
        title: 'Low stock alert',
        desc: 'Gojo Satoru Figure is out of stock',
        time: '5 min ago',
    },
    {
        icon: ShoppingCart,
        color: '#6366f1',
        bg: '#eef2ff',
        title: 'New Order #ORD-8902',
        desc: 'Sakura M. placed an order for ₹373.50',
        time: '12 min ago',
    },
    {
        icon: Star,
        color: '#059669',
        bg: '#d1fae5',
        title: 'New Review',
        desc: 'A customer left a 5-star review on Demon Slayer Haori',
        time: '1 hr ago',
    },
];

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const products = useProductStore(state => state.products);
    const { user, logout } = useAuthStore();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const [searchRef, notifRef] = [useRef(null), useRef(null)];

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            icon: AlertTriangle,
            color: '#d97706',
            bg: '#fef3c7',
            title: 'Low stock alert',
            desc: 'Gojo Satoru Figure is out of stock',
            time: '5 min ago',
            read: false,
        },
        {
            id: 2,
            icon: ShoppingCart,
            color: '#6366f1',
            bg: '#eef2ff',
            title: 'New Order #ORD-8902',
            desc: 'Sakura M. placed an order for ₹373.50',
            time: '12 min ago',
            read: false,
        },
        {
            id: 3,
            icon: Star,
            color: '#059669',
            bg: '#d1fae5',
            title: 'New Review',
            desc: 'A customer left a 5-star review on Demon Slayer Haori',
            time: '1 hr ago',
            read: false,
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const breadcrumb = routeLabels[location.pathname] || 'Admin';

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [searchRef, notifRef]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Compute live search results
    const searchResults = searchQuery.trim().length > 1 ? (() => {
        const q = searchQuery.toLowerCase();
        const pages = [
            { label: 'Dashboard', path: '/admin', type: 'Page' },
            { label: 'Inventory', path: '/admin/inventory', type: 'Page' },
            { label: 'Orders', path: '/admin/orders', type: 'Page' },
            { label: 'Customers', path: '/admin/customers', type: 'Page' },
            { label: 'Settings', path: '/admin/settings', type: 'Page' },
        ].filter(p => p.label.toLowerCase().includes(q));

        const matchedProducts = products
            .filter(p => p.name.toLowerCase().includes(q))
            .slice(0, 3)
            .map(p => ({ label: p.name, path: '/admin/inventory', type: 'Product' }));

        const matchedOrders = MOCK_ORDERS
            .filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
            .slice(0, 2)
            .map(o => ({ label: `${o.id} — ${o.customer}`, path: '/admin/orders', type: 'Order' }));

        return [...pages, ...matchedProducts, ...matchedOrders];
    })() : [];

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (q.includes('order') || q.includes('ord-')) navigate('/admin/orders');
            else if (q.includes('inventory') || q.includes('product') || q.includes('stock')) navigate('/admin/inventory');
            else if (q.includes('customer')) navigate('/admin/customers');
            else if (q.includes('setting')) navigate('/admin/settings');
            else navigate('/admin');
            setSearchQuery('');
            setSearchOpen(false);
        }
        if (e.key === 'Escape') {
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = () => { logout(); navigate('/admin-login'); };

    return (
        <div className="admin-layout">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
                <div className="admin-logo">
                    <span className="logo-icon">⚡</span>
                    <div className="logo-text">
                        <h2>OtakuNation</h2>
                        <span className="logo-sub">Admin Panel</span>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="admin-nav" aria-label="Admin navigation">
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/inventory" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                        <Package size={18} />
                        <span>Inventory</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                        <ShoppingCart size={18} />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink to="/admin/customers" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                        <Users size={18} />
                        <span>Customers</span>
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                        <Settings size={18} />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={() => navigate('/')} className="view-store-btn">
                        <Store size={18} />
                        <span>Return to Store</span>
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="admin-main-content">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        {/* Hamburger — visible only on mobile */}
                        <button
                            className="topbar-hamburger"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="topbar-breadcrumb">
                            Admin &rsaquo; <strong>{breadcrumb}</strong>
                        </div>

                        {/* Global Search */}
                        <div className="topbar-search" ref={searchRef}>
                            <Search size={14} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Search orders, products, customers…"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                                onFocus={() => setSearchOpen(true)}
                                onKeyDown={handleSearchKeyDown}
                                aria-label="Global search"
                                aria-autocomplete="list"
                            />
                            {/* Search Dropdown */}
                            {searchOpen && searchResults.length > 0 && (
                                <div className="search-dropdown" role="listbox">
                                    {searchResults.map((result, i) => (
                                        <button
                                            key={i}
                                            className="search-result-item"
                                            role="option"
                                            onClick={() => {
                                                navigate(result.path);
                                                setSearchQuery('');
                                                setSearchOpen(false);
                                            }}
                                        >
                                            <span className="search-result-label">{result.label}</span>
                                            <span className={`search-result-type type-${result.type.toLowerCase()}`}>
                                                {result.type}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="topbar-right">
                        {/* Notification Bell */}
                        <div className="notif-wrapper" ref={notifRef}>
                            <button
                                className={`topbar-icon-btn${notifOpen ? ' active' : ''}`}
                                onClick={() => setNotifOpen(prev => !prev)}
                                aria-label="View notifications"
                                aria-expanded={notifOpen}
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="topbar-notif-badge" aria-label={`${unreadCount} notifications`}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                                    <div className="notif-header">
                                        <span>Notifications</span>
                                        {unreadCount > 0 && <span className="notif-badge-count">{unreadCount} new</span>}
                                    </div>
                                    <div className="notif-list">
                                        {notifications.length > 0 ? (
                                            notifications.map((n, i) => {
                                                const Icon = n.icon;
                                                return (
                                                    <div key={n.id} className={`notif-item${n.read ? ' read' : ''}`}>
                                                        <div
                                                            className="notif-icon-wrap"
                                                            style={{ background: n.bg, color: n.color }}
                                                        >
                                                            <Icon size={14} />
                                                        </div>
                                                        <div className="notif-body">
                                                            <strong>{n.title}</strong>
                                                            <span>{n.desc}</span>
                                                            <time>{n.time}</time>
                                                        </div>
                                                        {!n.read && <div className="unread-dot" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="notif-empty">No notifications</div>
                                        )}
                                    </div>
                                    <div className="notif-footer">
                                        <button
                                            className="btn text small"
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin User */}
                        <div className="admin-user-profile">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || 'Admin') + '+' + (user?.lastName || ''))}&background=6366f1&color=fff&bold=true`}
                                alt="Admin avatar"
                                className="avatar"
                            />
                            <div className="admin-user-info">
                                <strong>{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</strong>
                                <span>Super Admin</span>
                            </div>
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
