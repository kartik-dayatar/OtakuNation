import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaThLarge, FaBox, FaUser, FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import './Account.css';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/orders/mine', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    const statusPriority = { processing: 1, shipped: 2, delivered: 3 };
    const sortedOrders = [...orders].sort((a, b) => {
        // Fallback to 4 for statuses like 'cancelled' or 'returned'
        const pA = statusPriority[a.status] || 4;
        const pB = statusPriority[b.status] || 4;
        if (pA === pB) {
            // Newest first
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return pA - pB;
    });

    const getStatusStyle = (status) => {
        if (status === 'delivered') return { background: '#def7ec', color: '#03543f' };
        if (status === 'shipped') return { background: '#e1effe', color: '#1e429f' };
        if (status === 'processing') return { background: '#fef3c7', color: '#92400e' };
        return { background: '#f1f5f9', color: '#64748b' };
    };

    return (
        <main className="account-container">
            <div className="account-layout">
                {/* SIDEBAR — matches Account.jsx exactly */}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <h3>Account</h3>
                        <div className="user-name">My Orders</div>
                    </div>

                    <ul className="sidebar-menu">
                        <li className="sidebar-section">
                            <Link to="/account" className="sidebar-btn">
                                <FaThLarge style={{ marginRight: '10px' }} /> Overview
                            </Link>
                        </li>

                        <li className="sidebar-section">
                            <div className="section-label">ORDERS</div>
                            <Link to="/orders" className="sidebar-btn active">
                                <FaBox style={{ marginRight: '10px' }} /> Orders &amp; Returns
                            </Link>
                        </li>

                        <li className="sidebar-section">
                            <div className="section-label">ACCOUNT</div>
                            <Link to="/account" className="sidebar-btn">
                                <FaUser style={{ marginRight: '10px' }} /> Profile
                            </Link>
                            <Link to="/account" className="sidebar-btn">
                                <FaMapMarkerAlt style={{ marginRight: '10px' }} /> Addresses
                            </Link>
                            <Link to="/logout" className="sidebar-btn logout">
                                <FaSignOutAlt style={{ marginRight: '10px' }} /> Logout
                            </Link>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT — matches Account.jsx renderOrders() exactly */}
                <section className="account-content">
                    <div className="content-header">
                        <h2>Orders &amp; Returns</h2>
                    </div>

                    <div className="orders-list">
                        {loading && <p>Loading orders...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {!loading && !error && sortedOrders.map(order => {
                            // Extract primary display info safely out of the populated items array
                            const firstItem = order.items?.[0];
                            const firstItemName = firstItem?.productName || "Product";
                            const firstItemImage = firstItem?.productImage || "/assets/placeholder.png";
                            let resolvedUrl = firstItemImage;
                            if (resolvedUrl && !resolvedUrl.startsWith('http') && !resolvedUrl.startsWith('/src') && !resolvedUrl.startsWith('/assets') && !resolvedUrl.startsWith('data:')) {
                                resolvedUrl = `/src/assets/images/products/${resolvedUrl}`;
                            }

                            return (
                                <div key={order._id} className="order-card" style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    marginBottom: '20px',
                                    background: 'var(--color-surface, #fff)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '20px'
                                }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        {/* Product image thumbnail */}
                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                border: '1px solid var(--border, #e2e8f0)',
                                                background: '#f1f5f9',
                                                flexShrink: 0
                                            }}>
                                                <img
                                                    src={resolvedUrl}
                                                    alt={firstItemName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 style={{ margin: '0 0 4px', color: 'var(--color-text)' }}>
                                                {firstItemName}{(order.items?.length || 0) > 1 && ` + ${order.items.length - 1} more item(s)`}
                                            </h4>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                Order #{order._id.substring(0, 8).toUpperCase()} &middot; {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '4px' }}>
                                                ₹{(order.totalAmount || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            marginBottom: '12px',
                                            ...getStatusStyle(order.status)
                                        }}>
                                            {order.status}
                                        </span>
                                        <br />
                                        <Link
                                            to={`/order-tracking?orderId=${order._id}`}
                                            style={{
                                                textDecoration: 'none',
                                                color: 'var(--color-primary)',
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                border: '1px solid var(--color-primary)',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                                marginTop: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {!loading && sortedOrders.length === 0 && (
                            <div className="empty-placeholder">
                                <p>You have no orders yet.</p>
                                <Link to="/products" className="btn primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
