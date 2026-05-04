import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';

export default function OrdersReturns() {
    const { orders, loading, error, fetchMyOrders } = useOrderStore();
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (token) {
            fetchMyOrders(token);
        }
    }, [token, fetchMyOrders]);

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'confirmed') return { background: '#fef9c3', color: '#854d0e' };
        if (s === 'processing') return { background: '#eff6ff', color: '#1d4ed8' };
        if (s === 'shipped') return { background: '#f5f3ff', color: '#6d28d9' };
        if (s === 'out_for_delivery') return { background: '#ecfdf5', color: '#065f46' };
        if (s === 'delivered') return { background: '#f0fdf4', color: '#166534' };
        if (s === 'cancelled') return { background: '#fef2f2', color: '#991b1b' };
        if (s === 'returned') return { background: '#fff7ed', color: '#9a3412' };
        return { background: '#f1f5f9', color: '#64748b' };
    };

    const resolveImageUrl = (img) => {
        if (!img) return "/assets/placeholder.png";
        if (img.startsWith('http') || img.startsWith('/src') || img.startsWith('/assets') || img.startsWith('data:')) return img;
        return `http://localhost:5000/uploads/products/${img}`;
    };

    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <>
            <h2 className="section-title">Orders & Returns</h2>

            <div className="orders-list">
                {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading your orders...</div>}
                {error && <div style={{ padding: '20px', color: '#ef4444', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>}
                
                {!loading && !error && sortedOrders.map(order => (
                    <div key={order._id} className="order-card" style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '16px',
                        background: '#fff',
                        transition: 'all 0.2s ease'
                    }}>
                        {/* Top Row: ID and Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <div style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: '13px' }}>
                                ID: {order._id.toUpperCase()}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '13px' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        {/* Middle Row: Thumbnails and Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} style={{ 
                                            width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', 
                                            border: '2px solid #fff', marginLeft: idx > 0 ? '-12px' : '0',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: '#f3f4f6',
                                            zIndex: 10 - idx
                                        }}>
                                            <img src={resolveImageUrl(item.productImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>
                                            +{order.items.length - 3} more
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '99px',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    fontWeight: '700',
                                    letterSpacing: '0.02em',
                                    ...getStatusStyle(order.status)
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>
                                    ₹{(order.totalAmount || 0).toLocaleString()}
                                </div>
                                <Link
                                    to={`/account/orders/${order._id}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px'
                                    }}
                                >
                                    View Details <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && sortedOrders.length === 0 && (
                    <div style={{ padding: '64px 0', textAlign: 'center' }}>
                        <Package size={56} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>No orders yet</h3>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>Looks like you haven't placed any orders yet.</p>
                        <Link to="/products" className="btn-primary" style={{ 
                            padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' 
                        }}>
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
