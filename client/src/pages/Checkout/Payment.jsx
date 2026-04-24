import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import './Checkout.css';
import './Payment.css';

const API_URL = 'http://localhost:5000/api';

const PAYMENT_METHODS = [
    { id: 'COD',        label: 'Cash on Delivery', icon: '💵' },
    { id: 'UPI',        label: 'UPI',               icon: '📲' },
    { id: 'Card',       label: 'Credit / Debit Card', icon: '💳' },
    { id: 'NetBanking', label: 'Net Banking',        icon: '🏦' },
];

export default function Payment() {
    const navigate  = useNavigate();
    const location  = useLocation();

    // Data passed from Checkout.jsx via navigate state
    const {
        shippingAddress,
        promo,
        subtotal        = 0,
        shippingAmount  = 0,
        promoDiscount   = 0,
        total           = 0,
    } = location.state || {};

    // ── Real cart from DB-synced store ────────────────
    const items    = useCartStore((s) => s.items);
    const clearCart = useCartStore((s) => s.clearCart);
    const token    = useAuthStore((s) => s.token);

    // ── Form state ────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [cardNumber,    setCardNumber]    = useState('');
    const [cardName,      setCardName]      = useState('');
    const [expiry,        setExpiry]        = useState('');
    const [cvc,           setCvc]           = useState('');
    const [loading,       setLoading]       = useState(false);
    const [error,         setError]         = useState('');

    const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    // ── Card input formatters ─────────────────────────
    const formatCardNumber = (val) =>
        val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const handleCardInput = (e) => {
        setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16));
    };

    const handleExpiryInput = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        setExpiry(val);
    };

    // ── Place order ───────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shippingAddress) {
            setError('Shipping address is missing. Please go back to checkout.');
            return;
        }
        if (items.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Build order payload
            const orderPayload = {
                items: items.map((item) => ({
                    product:   item.id,
                    productId: item.id,
                    sizeLabel: item.selectedSize || null,
                    quantity:  item.quantity,
                })),
                shippingAddress,
                paymentMethod,
                couponCode:   promo?.type === 'coupon'   ? promo.inputCode : undefined,
                giftCardCode: promo?.type === 'giftcard' ? promo.inputCode : undefined,
            };

            const { data: order } = await axios.post(`${API_URL}/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Clear DB-backed cart
            await clearCart(token);

            // Navigate to confirmation with the real order id
            navigate('/order-confirmation', {
                replace: true,
                state: { orderId: order._id, orderNumber: order.orderNumber },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Guard: if user navigates here directly ────────
    if (!shippingAddress) {
        return (
            <main className="checkout-container">
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ color: '#dc2626', marginBottom: '16px' }}>Please complete the address step first.</p>
                    <Link to="/checkout" className="btn primary">Go to Checkout</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-container">
            {/* Progress Steps */}
            <div className="checkout-steps">
                <div className="step completed"><div className="step-circle">✓</div><div className="step-label">Cart</div></div>
                <div className="step completed"><div className="step-circle">✓</div><div className="step-label">Address</div></div>
                <div className="step active">   <div className="step-circle">3</div><div className="step-label">Payment</div></div>
                <div className="step">          <div className="step-circle">4</div><div className="step-label">Confirm</div></div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr' }}>
                {/* ── Payment Form ── */}
                <div className="form-card">
                    <div className="form-header">
                        <h2>Payment Method</h2>
                    </div>

                    {/* Payment method selector */}
                    <div className="payment-methods">
                        {PAYMENT_METHODS.map((m) => (
                            <div
                                key={m.id}
                                className={`payment-method-card ${paymentMethod === m.id ? 'active' : ''}`}
                                onClick={() => setPaymentMethod(m.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span>{m.icon}</span>
                                <span>{m.label}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Card fields shown only when Card is selected */}
                        {paymentMethod === 'Card' && (
                            <>
                                {/* Credit Card Preview */}
                                <div className="credit-card-preview">
                                    <div className="card-preview-chip"></div>
                                    <div className="card-preview-number">
                                        {cardNumber ? cardNumber.padEnd(16, '•').match(/.{1,4}/g).join(' ') : '•••• •••• •••• ••••'}
                                    </div>
                                    <div className="card-preview-footer">
                                        <div className="card-preview-name">{cardName || 'YOUR NAME'}</div>
                                        <div className="card-preview-expiry">{expiry || 'MM/YY'}</div>
                                    </div>
                                </div>

                                <div className="form-grid-inner">
                                    <div className="form-group full-width">
                                        <label className="form-label">Card Number</label>
                                        <input type="text" className="form-input"
                                            placeholder="0000 0000 0000 0000" maxLength="19"
                                            value={formatCardNumber(cardNumber)} onChange={handleCardInput} required />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="form-label">Cardholder Name</label>
                                        <input type="text" className="form-input"
                                            placeholder="Naruto Uzumaki"
                                            value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Expiry Date</label>
                                        <input type="text" className="form-input"
                                            placeholder="MM/YY" maxLength="5"
                                            value={expiry} onChange={handleExpiryInput} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CVC</label>
                                        <input type="text" className="form-input"
                                            placeholder="123" maxLength="3"
                                            value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))} required />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Address Confirmation */}
                        <div style={{ margin: '20px 0', padding: '14px 16px', background: 'var(--color-surface-alt, #f8fafc)', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--color-text)' }}>📦 Delivering to</div>
                            <div style={{ color: '#64748b', lineHeight: '1.5' }}>
                                {shippingAddress.recipientName} · {shippingAddress.phone}<br />
                                {shippingAddress.addressLine1}, {shippingAddress.addressLine2 && `${shippingAddress.addressLine2}, `}
                                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                            </div>
                        </div>

                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '0.85rem', marginTop: '16px' }}>
                            🔒 <strong>SSL Encrypted:</strong> Your transaction is 100% secure.
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', display: 'flex' }}>
                            <Link to="/checkout" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                                ← Back to Address
                            </Link>
                            <button type="submit" className="btn primary" disabled={loading || items.length === 0}>
                                {loading ? 'Placing Order…' : `Pay ${fmt(total)}`}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Real Order Summary Sidebar ── */}
                <div className="form-card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Order Summary</h3>

                    {items.map((item) => (
                        <div className="summary-row" key={`${item.id}-${item.selectedSize}`}>
                            <span>
                                {item.name}
                                {item.selectedSize && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}> ({item.selectedSize})</span>}
                                {item.quantity > 1 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}> ×{item.quantity}</span>}
                            </span>
                            <span>{fmt(item.price * item.quantity)}</span>
                        </div>
                    ))}

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{fmt(subtotal)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>{shippingAmount === 0 ? <span style={{ color: '#16a34a' }}>FREE</span> : fmt(shippingAmount)}</span>
                    </div>

                    {promo && (
                        <div className="summary-row" style={{ color: '#16a34a' }}>
                            <span>Promo ({promo.inputCode})</span>
                            <span>−{fmt(promoDiscount)}</span>
                        </div>
                    )}

                    <div className="summary-row total">
                        <span>Total</span>
                        <span>{fmt(total)}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
