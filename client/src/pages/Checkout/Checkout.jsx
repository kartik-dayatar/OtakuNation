import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';

const COUPONS = {
    'OTAKU20': { type: 'percent', value: 20, label: '20% off' },
    'ANIME10': { type: 'percent', value: 10, label: '10% off' },
    'NARUTO15': { type: 'percent', value: 15, label: '15% off' },
    'FIRST50': { type: 'flat', value: 4150, label: '₹4,150 off' }
};

export default function Checkout() {
    const navigate = useNavigate();
    // Mock data - normally passed via state or context
    const SUBTOTAL = 11620;
    const SHIPPING = 415;

    const [couponCode, setCouponCode] = useState('');
    const [activeCoupon, setActiveCoupon] = useState(null);
    const [message, setMessage] = useState({ text: '', color: '' });
    const [shake, setShake] = useState(false);

    const calcDiscount = (coupon) => {
        if (!coupon) return 0;
        if (coupon.type === 'percent') {
            return Math.round((SUBTOTAL * coupon.value) / 100);
        }
        return Math.min(coupon.value, SUBTOTAL);
    };

    const discount = calcDiscount(activeCoupon);
    const total = SUBTOTAL + SHIPPING - discount;

    const handleApplyCoupon = () => {
        setMessage({ text: '', color: '' });
        const code = couponCode.trim().toUpperCase();

        if (!code) {
            setMessage({ text: '⚠️ Please enter a coupon code.', color: '#f59e0b' });
            return;
        }

        if (activeCoupon) {
            setMessage({ text: '⚠️ A coupon is already applied. Remove it first.', color: '#f59e0b' });
            return;
        }

        const coupon = COUPONS[code];
        if (!coupon) {
            setMessage({ text: '❌ Invalid coupon code. Please try again.', color: '#dc2626' });
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        setActiveCoupon({ code, ...coupon });
        setMessage({ text: '🎉 Coupon applied successfully!', color: '#16a34a' });
    };

    const removeCoupon = () => {
        setActiveCoupon(null);
        setCouponCode('');
        setMessage({ text: '🗑️ Coupon removed.', color: '#64748b' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Proceed to payment (mock)
        navigate('/payment');
    };

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                {/* Progress Steps */}
                <div className="checkout-steps">
                    <div className="step completed">
                        <div className="step-circle">✓</div>
                        <div className="step-label">Cart</div>
                    </div>
                    <div className="step active">
                        <div className="step-circle">2</div>
                        <div className="step-label">Address</div>
                    </div>
                    <div className="step">
                        <div className="step-circle">3</div>
                        <div className="step-label">Payment</div>
                    </div>
                    <div className="step">
                        <div className="step-circle">4</div>
                        <div className="step-label">Confirm</div>
                    </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr' }}>
                    {/* Address Form */}
                    <div className="form-card">
                        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Delivery Details</h2>
                                <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>Where should we send your order?</p>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>🔒</span> Secure Checkout
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-input" placeholder="Naruto" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="form-input" placeholder="Uzumaki" required />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-input" placeholder="123 Konoha Village St" required />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Apartment, suite, etc. (optional)</label>
                                    <input type="text" className="form-input" placeholder="Apt 4B" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-input" placeholder="Hidden Leaf" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Postal Code</label>
                                    <input type="text" className="form-input" placeholder="10001" required />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-input" placeholder="+1 (555) 000-0000" required />
                                </div>
                            </div>

                            <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to="/cart" style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
                                    ← Back to Cart
                                </Link>
                                <button type="submit" className="btn primary">Continue to Payment</button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="form-card" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Order Summary</h3>

                        <div className="summary-row">
                            <span>Naruto Shippuden Figure</span>
                            <span>₹6,640</span>
                        </div>
                        <div className="summary-row">
                            <span>Akatsuki Hoodie (L)</span>
                            <span>₹3,735</span>
                        </div>
                        <div className="summary-row">
                            <span>Konoha Headband</span>
                            <span>₹1,245</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>₹415</span>
                        </div>

                        {/* Coupon Code Section */}
                        <div className="coupon-section">
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main, #333)', display: 'block', marginBottom: '8px' }}>
                                🎟️ Have a coupon?
                            </label>
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    className={`form-input ${shake ? 'shake' : ''}`}
                                    placeholder="Enter code"
                                    maxLength="20"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={!!activeCoupon}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                />
                                <button
                                    type="button"
                                    className="coupon-btn"
                                    onClick={handleApplyCoupon}
                                    disabled={!!activeCoupon}
                                >
                                    Apply
                                </button>
                            </div>
                            {message.text && (
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: message.color }}>{message.text}</div>
                            )}

                            {/* Applied coupon tag */}
                            {activeCoupon && (
                                <div style={{ display: 'flex', marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.82rem', color: '#15803d', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>✅ {activeCoupon.code} — {activeCoupon.label}</span>
                                    <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', padding: '0 0 0 8px', lineHeight: 1 }} title="Remove coupon">✕</button>
                                </div>
                            )}
                        </div>

                        {/* Discount Row */}
                        {activeCoupon && (
                            <div className="summary-row" style={{ color: '#16a34a' }}>
                                <span>Discount ({activeCoupon.code})</span>
                                <span>-₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5' }}>
                            Try: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>OTAKU20</code>
                            {' '}<code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>FIRST50</code>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
