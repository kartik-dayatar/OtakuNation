import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import './Checkout.css';

const API_URL = 'http://localhost:5000/api';
const FREE_SHIPPING_MIN = 5000;
const FLAT_SHIPPING     = 99;

export default function Checkout() {
    const navigate = useNavigate();

    // ── Real cart from DB-synced store ────────────────
    const items = useCartStore((s) => s.items);
    const token = useAuthStore((s) => s.token);
    const user  = useAuthStore((s) => s.user);

    // ── Address form state ────────────────────────────
    const [form, setForm] = useState({
        recipientName: user ? `${user.firstName} ${user.lastName}` : '',
        addressLine1:  '',
        addressLine2:  '',
        city:          '',
        state:         '',
        postalCode:    '',
        country:       'India',
        phone:         user?.phone || '',
    });

    // ── Promo state ───────────────────────────────────
    const [promoInput,  setPromoInput]  = useState('');
    const [promoType,   setPromoType]   = useState('coupon'); // 'coupon' | 'giftcard'
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoMsg,    setPromoMsg]    = useState({ text: '', color: '' });
    const [promoLoading, setPromoLoading] = useState(false);
    const [shake,       setShake]       = useState(false);

    // ── Computed financial totals ─────────────────────
    const subtotal      = items.reduce((t, item) => t + item.price * item.quantity, 0);
    const shippingAmount = subtotal >= FREE_SHIPPING_MIN ? 0 : FLAT_SHIPPING;
    const promoDiscount = appliedPromo?.discount || 0;
    const total         = Math.max(0, subtotal + shippingAmount - promoDiscount);

    const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    // ── Handlers ──────────────────────────────────────
    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleApplyPromo = async () => {
        setPromoMsg({ text: '', color: '' });
        const code = promoInput.trim().toUpperCase();
        if (!code) return setPromoMsg({ text: '⚠️ Please enter a code.', color: '#f59e0b' });
        if (appliedPromo) return setPromoMsg({ text: '⚠️ A promo is already applied. Remove it first.', color: '#f59e0b' });

        setPromoLoading(true);
        try {
            const payload = promoType === 'coupon'
                ? { couponCode: code, subtotal }
                : { giftCardCode: code, subtotal };

            const { data } = await axios.post(`${API_URL}/orders/validate-promo`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAppliedPromo({ ...data, inputCode: code });
            setPromoMsg({ text: `🎉 ${data.label} applied!`, color: '#16a34a' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid promo code.';
            setPromoMsg({ text: `❌ ${msg}`, color: '#dc2626' });
            setShake(true);
            setTimeout(() => setShake(false), 400);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
        setPromoMsg({ text: '🗑️ Promo removed.', color: '#64748b' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (items.length === 0) return;

        // Pass address, promo, and computed totals to Payment page
        navigate('/payment', {
            state: {
                shippingAddress: form,
                promo: appliedPromo,
                subtotal,
                shippingAmount,
                promoDiscount,
                total,
            },
        });
    };

    // ── Empty cart guard ──────────────────────────────
    if (items.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <h2>Your cart is empty</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>Add items to your cart before checking out.</p>
                    <Link to="/products" className="btn primary">Browse Products</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                {/* Progress Steps */}
                <div className="checkout-steps">
                    <div className="step completed"><div className="step-circle">✓</div><div className="step-label">Cart</div></div>
                    <div className="step active">   <div className="step-circle">2</div><div className="step-label">Address</div></div>
                    <div className="step">          <div className="step-circle">3</div><div className="step-label">Payment</div></div>
                    <div className="step">          <div className="step-circle">4</div><div className="step-label">Confirm</div></div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr' }}>
                    {/* ── Address Form ── */}
                    <div className="form-card">
                        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Delivery Details</h2>
                                <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>Where should we send your order?</p>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🔒 Secure Checkout
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Full Name</label>
                                    <input name="recipientName" type="text" className="form-input"
                                        placeholder="Naruto Uzumaki" required
                                        value={form.recipientName} onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Address Line 1</label>
                                    <input name="addressLine1" type="text" className="form-input"
                                        placeholder="House No, Street, Area" required
                                        value={form.addressLine1} onChange={handleChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Address Line 2 (optional)</label>
                                    <input name="addressLine2" type="text" className="form-input"
                                        placeholder="Apartment, suite, landmark"
                                        value={form.addressLine2} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input name="city" type="text" className="form-input"
                                        placeholder="Mumbai" required
                                        value={form.city} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input name="state" type="text" className="form-input"
                                        placeholder="Maharashtra" required
                                        value={form.state} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Postal Code</label>
                                    <input name="postalCode" type="text" className="form-input"
                                        placeholder="400001" required
                                        value={form.postalCode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input name="phone" type="tel" className="form-input"
                                        placeholder="+91 98765 43210" required
                                        value={form.phone} onChange={handleChange} />
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

                    {/* ── Order Summary Sidebar ── */}
                    <div className="form-card" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Order Summary</h3>

                        {/* Live cart items from DB */}
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
                            <span>Shipping</span>
                            <span>{shippingAmount === 0 ? <span style={{ color: '#16a34a' }}>FREE</span> : fmt(shippingAmount)}</span>
                        </div>

                        {/* ── Promo Code Section ── */}
                        <div className="coupon-section">
                            {/* Promo type toggle */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {['coupon', 'giftcard'].map((t) => (
                                    <button key={t} type="button"
                                        onClick={() => { setPromoType(t); setPromoMsg({ text: '', color: '' }); }}
                                        disabled={!!appliedPromo}
                                        style={{
                                            fontSize: '0.78rem', fontWeight: '600', padding: '4px 10px',
                                            borderRadius: '6px', border: '1px solid',
                                            cursor: 'pointer',
                                            borderColor: promoType === t ? 'var(--color-primary, #6366f1)' : '#e2e8f0',
                                            background:  promoType === t ? 'var(--color-primary, #6366f1)' : 'transparent',
                                            color:       promoType === t ? '#fff' : 'inherit',
                                        }}>
                                        {t === 'coupon' ? '🎟️ Coupon' : '🎁 Gift Card'}
                                    </button>
                                ))}
                            </div>
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    className={`form-input ${shake ? 'shake' : ''}`}
                                    placeholder={promoType === 'coupon' ? 'Enter coupon code' : 'Enter gift card code'}
                                    maxLength="30"
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value)}
                                    disabled={!!appliedPromo || promoLoading}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
                                />
                                <button type="button" className="coupon-btn"
                                    onClick={handleApplyPromo}
                                    disabled={!!appliedPromo || promoLoading}>
                                    {promoLoading ? '...' : 'Apply'}
                                </button>
                            </div>
                            {promoMsg.text && (
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: promoMsg.color }}>{promoMsg.text}</div>
                            )}
                            {appliedPromo && (
                                <div style={{ display: 'flex', marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.82rem', color: '#15803d', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>✅ {appliedPromo.inputCode} — {appliedPromo.label}</span>
                                    <button type="button" onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', padding: '0 0 0 8px', lineHeight: 1 }} title="Remove promo">✕</button>
                                </div>
                            )}
                        </div>

                        {/* Discount row */}
                        {appliedPromo && (
                            <div className="summary-row" style={{ color: '#16a34a' }}>
                                <span>Discount ({appliedPromo.inputCode})</span>
                                <span>−{fmt(promoDiscount)}</span>
                            </div>
                        )}

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{fmt(total)}</span>
                        </div>

                        {subtotal < FREE_SHIPPING_MIN && (
                            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Add {fmt(FREE_SHIPPING_MIN - subtotal)} more for free shipping!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
