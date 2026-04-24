import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheck, FaBox, FaEnvelope } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import './Checkout.css';
import './OrderConfirmation.css';

const API_URL = 'http://localhost:5000/api';

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const token    = useAuthStore((s) => s.token);

    const { orderId, orderNumber: navOrderNumber } = location.state || {};

    const [order,   setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    // Fetch real order from DB ───────────────────────
    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrder(data);
            } catch (err) {
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token]);

    // Guard: no orderId in state (direct navigation) ──
    if (!orderId) {
        return (
            <main className="checkout-container" style={{ display: 'block', minHeight: '80vh' }}>
                <div className="form-card success-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <h2>No order found</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>It looks like you navigated here directly.</p>
                    <Link to="/orders" className="btn ghost">View My Orders</Link>
                </div>
            </main>
        );
    }

    const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    return (
        <main className="checkout-container" style={{ display: 'block', minHeight: '80vh' }}>
            {/* Progress Steps */}
            <div className="checkout-steps">
                <div className="step completed"><div className="step-circle"><FaCheck size={12} /></div><div className="step-label">Cart</div></div>
                <div className="step completed"><div className="step-circle"><FaCheck size={12} /></div><div className="step-label">Address</div></div>
                <div className="step completed"><div className="step-circle"><FaCheck size={12} /></div><div className="step-label">Payment</div></div>
                <div className="step completed"><div className="step-circle"><FaCheck size={12} /></div><div className="step-label">Confirm</div></div>
            </div>

            <div className="form-card success-container">
                <div className="checkmark-circle">
                    <div className="checkmark"></div>
                </div>

                <h1 className="success-title">Order Placed!</h1>

                {loading ? (
                    <p className="success-message" style={{ color: '#64748b' }}>Loading your order details…</p>
                ) : error ? (
                    <p className="success-message" style={{ color: '#dc2626' }}>{error}</p>
                ) : order ? (
                    <>
                        <p className="success-message">
                            Thank you for shopping with OtakuNation! Your order{' '}
                            <strong>#{order.orderNumber}</strong> has been confirmed and will be shipped soon.
                        </p>

                        {/* Order summary card */}
                        <div style={{
                            margin: '24px auto', maxWidth: '480px', textAlign: 'left',
                            background: 'var(--color-surface-alt, #f8fafc)', borderRadius: '12px',
                            padding: '20px', border: '1px solid var(--border, #e2e8f0)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Order Number</div>
                                    <div style={{ fontWeight: '700' }}>{order.orderNumber}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Status</div>
                                    <div style={{ fontWeight: '700', textTransform: 'capitalize', color: '#16a34a' }}>{order.status}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Items</div>
                                    <div style={{ fontWeight: '700' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Total Paid</div>
                                    <div style={{ fontWeight: '700' }}>{fmt(order.totalAmount)}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Payment</div>
                                    <div style={{ fontWeight: '700' }}>{order.paymentMethod}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Est. Delivery</div>
                                    <div style={{ fontWeight: '700' }}>
                                        {order.estimatedDelivery
                                            ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '5-7 business days'}
                                    </div>
                                </div>
                            </div>

                            {/* Items list */}
                            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: '16px' }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        <span>
                                            {item.productName}
                                            {item.sizeLabel && <span style={{ color: '#94a3b8' }}> ({item.sizeLabel})</span>}
                                            {item.quantity > 1 && <span style={{ color: '#94a3b8' }}> ×{item.quantity}</span>}
                                        </span>
                                        <span style={{ fontWeight: '600' }}>{fmt(item.lineTotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery address */}
                        {order.shippingAddress && (
                            <div style={{ margin: '0 auto 24px', maxWidth: '480px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>
                                <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px' }}>
                                    <FaBox size={12} style={{ marginRight: '6px' }} />Shipping to
                                </div>
                                {order.shippingAddress.recipientName} · {order.shippingAddress.phone}<br />
                                {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                            </div>
                        )}
                    </>
                ) : null}

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                    <Link to="/orders" className="btn ghost">View My Orders</Link>
                    <Link to="/products" className="btn primary">Continue Shopping</Link>
                </div>
            </div>
        </main>
    );
}
