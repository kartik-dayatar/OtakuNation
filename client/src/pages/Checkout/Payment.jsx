import { useNavigate, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CreditCard, 
    Banknote, 
    MapPin, 
    Lock, 
    ArrowLeft, 
    Ticket, 
    ShieldCheck, 
    CheckCircle2,
    Check
} from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import './Payment.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    const items    = useCartStore((s) => s.items);
    const clearCart = useCartStore((s) => s.clearCart);
    const user     = useAuthStore((s) => s.user);

    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading,       setLoading]       = useState(false);
    const [error,         setError]         = useState('');
    const [couponOpen,    setCouponOpen]    = useState(false);

    const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    // Handle Order Placement
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
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

        if (paymentMethod === 'COD') {
            try {
                const orderPayload = {
                    items: items.map((item) => ({
                        product:   item.id,
                        productId: item.id,
                        sizeLabel: item.selectedSize || null,
                        colorLabel: item.selectedColor || null,
                        quantity:  item.quantity,
                        price:     item.price,
                        productName: item.name,
                        productImage: item.image
                    })),
                    shippingAddress,
                    paymentMethod: 'COD',
                    subtotal,
                    shippingAmount: shippingAmount + 50, // COD extra charge
                    promoDiscount,
                    totalAmount: total + 50,
                };
                const token = localStorage.getItem('on_token');
                const { data } = await axios.post(`${API_URL}/orders`, orderPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                clearCart(token);
                navigate('/order-success', { state: { orderId: data.orderNumber } });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to place order.');
            } finally {
                setLoading(false);
            }
        } else {
            // Razorpay flow
            try {
                const token = localStorage.getItem('on_token');

                const res = await axios.post(`${API_URL}/payment/create-order`, {
                    amount: total,
                    currency: 'INR'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    setError('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: res.data.amount,
                    currency: res.data.currency,
                    name: 'Otaku Nation',
                    description: 'Order Payment',
                    order_id: res.data.orderId,
                    handler: async function (response) {
                        try {
                            const verifyToken = localStorage.getItem('on_token');
                            const verifyRes = await axios.post(`${API_URL}/payment/verify`, {
                                razorpay_order_id:   response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature:  response.razorpay_signature,
                                orderData: {
                                    items: items.map(i => ({
                                        product: i.id,
                                        productId: i.id,
                                        quantity: i.quantity,
                                        price: i.price,
                                        sizeLabel: i.selectedSize,
                                        productName: i.name,
                                        productImage: i.image
                                    })),
                                    shippingAddress,
                                    subtotal,
                                    shippingAmount,
                                    promoDiscount,
                                    totalAmount: total
                                }
                            }, {
                                headers: { Authorization: `Bearer ${verifyToken}` }
                            });

                            clearCart(verifyToken);
                            navigate(`/account/orders/${verifyRes.data.orderId}`);

                        } catch (err) {
                            setError('Payment verification failed.');
                        }
                    },
                    prefill: {
                        name: user?.firstName + ' ' + user?.lastName,
                        email: user?.email,
                        contact: shippingAddress.phone || ''
                    },
                    theme: { color: '#3b82f6' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                setError('Failed to initialize payment.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="payment-page-v2">
            {/* ── Progress Bar Top ── */}
            <div className="page-progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>

            <div className="payment-container">
                {/* ── 1. STEPPER ──────────────────────────────────── */}
                <div className="checkout-stepper-v2">
                    <div className="step completed">
                        <div className="step-circle"><Check size={14} strokeWidth={3} /></div>
                        <span className="step-label">Cart</span>
                    </div>
                    <div className="step-line green"></div>
                    <div className="step completed">
                        <div className="step-circle"><Check size={14} strokeWidth={3} /></div>
                        <span className="step-label">Address</span>
                    </div>
                    <div className="step-line green"></div>
                    <div className="step active">
                        <div className="step-circle">3</div>
                        <span className="step-label">Payment</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step pending">
                        <div className="step-circle">4</div>
                        <span className="step-label">Confirm</span>
                    </div>
                </div>

                <div className="payment-layout-grid">
                    {/* ── LEFT COLUMN ── */}
                    <div className="payment-main-col">
                        {/* 2. PAYMENT METHOD CARD */}
                        <div className="payment-card-box">
                            <div className="card-header-group">
                                <h2 className="card-title">Select Payment Method</h2>
                                <p className="card-subtitle">All transactions are secure and encrypted</p>
                            </div>

                            <div className="payment-options-group">
                                {/* Razorpay Card */}
                                <div 
                                    className={`payment-option-tile ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                >
                                    <div className="tile-content">
                                        <div className="tile-icon-box"><CreditCard size={20} /></div>
                                        <div className="tile-text">
                                            <strong>Online Payment (Razorpay)</strong>
                                            <p>Cards, UPI, NetBanking, Wallets</p>
                                        </div>
                                    </div>
                                    <div className="tile-radio">
                                        <div className={`radio-dot ${paymentMethod === 'razorpay' ? 'filled' : ''}`}></div>
                                    </div>
                                    
                                    {paymentMethod === 'razorpay' && (
                                        <div className="tile-details-fadein">
                                            <div className="method-badges-row">
                                                <span className="badge-pill">Visa</span>
                                                <span className="badge-pill">Mastercard</span>
                                                <span className="badge-pill">UPI</span>
                                                <span className="badge-pill">NetBanking</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* COD Card */}
                                <div 
                                    className={`payment-option-tile ${paymentMethod === 'COD' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('COD')}
                                >
                                    <div className="tile-content">
                                        <div className="tile-icon-box"><Banknote size={20} /></div>
                                        <div className="tile-text">
                                            <strong>Cash on Delivery (COD)</strong>
                                            <p>Pay when your order arrives</p>
                                        </div>
                                    </div>
                                    <div className="tile-radio">
                                        <div className={`radio-dot ${paymentMethod === 'COD' ? 'filled' : ''}`}></div>
                                    </div>
                                    
                                    {paymentMethod === 'COD' && (
                                        <div className="tile-details-fadein">
                                            <span className="cod-fee-note">₹50 COD fee will be added</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. DELIVERY ADDRESS CARD */}
                        <div className="payment-card-box">
                            <div className="address-card-header">
                                <div className="title-with-icon">
                                    <MapPin size={18} className="blue-icon" />
                                    <h3 className="card-mini-title">Delivering To</h3>
                                </div>
                                <button className="btn-change-link" onClick={() => navigate('/checkout')}>Change</button>
                            </div>
                            
                            <div className="address-content-wrap">
                                <div className="address-type-tag">HOME</div>
                                <div className="recipient-name">{shippingAddress?.recipientName}</div>
                                <div className="address-full-text">
                                    {shippingAddress?.addressLine1}, {shippingAddress?.addressLine2 && `${shippingAddress.addressLine2}, `}
                                    {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.postalCode}
                                </div>
                                <div className="recipient-phone">Phone: {shippingAddress?.phone}</div>
                            </div>
                        </div>

                        {/* 4. TRUST BADGES ROW */}
                        <div className="payment-trust-badges">
                            <span><Lock size={13} color="#10b981" /> SSL Encrypted</span>
                            <span className="badge-sep">•</span>
                            <span><CheckCircle2 size={13} color="#10b981" /> 100% Secure</span>
                            <span className="badge-sep">•</span>
                            <span><ShieldCheck size={13} color="#3b82f6" /> Razorpay Protected</span>
                        </div>

                        {/* 5. ACTION BUTTONS */}
                        {error && <div className="error-banner-small">⚠️ {error}</div>}
                        <div className="payment-footer-actions">
                            <button className="btn-ghost-back" onClick={() => navigate('/checkout')}>
                                <ArrowLeft size={16} /> Back to Address
                            </button>
                            <button className="btn-pay-solid" onClick={handleSubmit} disabled={loading}>
                                <Lock size={16} /> 
                                {loading ? 'Processing...' : `Secure Payment ${fmt(paymentMethod === 'COD' ? total + 50 : total)}`}
                            </button>
                        </div>
                        <div className="razorpay-powered">
                            <span>Powered by</span>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" />
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="payment-sidebar-col">
                        <div className="payment-card-box sticky-summary">
                            <h3 className="summary-title">Order Summary</h3>
                            
                            <div className="summary-items-scroll">
                                {items.map((item, i) => (
                                    <div key={i} className="summary-product-row">
                                        <div className="prod-thumb">
                                            <img src={item.image || "/assets/placeholder.png"} alt={item.name} />
                                        </div>
                                        <div className="prod-meta">
                                            <span className="prod-name">{item.name}</span>
                                            {item.selectedSize && <span className="prod-variant">{item.selectedSize}</span>}
                                            <span className="prod-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="prod-price">
                                            {fmt(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider-line"></div>

                            <div className="summary-pricing-stack">
                                <div className="price-line">
                                    <span>Subtotal</span>
                                    <span>{fmt(subtotal)}</span>
                                </div>
                                <div className="price-line">
                                    <span>Shipping</span>
                                    <span className="free-text">FREE</span>
                                </div>
                                {paymentMethod === 'COD' && (
                                    <div className="price-line">
                                        <span>COD Charge</span>
                                        <span>{fmt(50)}</span>
                                    </div>
                                )}
                                {promoDiscount > 0 && (
                                    <div className="price-line discount">
                                        <span>Discount ({promo?.code})</span>
                                        <span>-{fmt(promoDiscount)}</span>
                                    </div>
                                )}
                                <div className="grand-total-divider"></div>
                                <div className="price-line grand-total">
                                    <span>Total</span>
                                    <span>{fmt(paymentMethod === 'COD' ? total + 50 : total)}</span>
                                </div>
                            </div>

                            <div className="coupon-expand-wrap">
                                <button className="coupon-toggle-btn" onClick={() => setCouponOpen(!couponOpen)}>
                                    <Ticket size={14} /> Have a coupon?
                                </button>
                                {couponOpen && (
                                    <div className="coupon-input-group slide-in-top">
                                        <input type="text" placeholder="Enter code" className="coupon-field" />
                                        <button className="btn-apply-coupon">Apply</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Minimal Copyright */}
                <div className="minimal-footer">
                    <p>© 2026 OtakuNation. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
