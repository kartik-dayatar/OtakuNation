import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';
import './Payment.css';

export default function Payment() {
    const navigate = useNavigate();
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const formatCardNumber = (val) => {
        return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCardInput = (e) => {
        const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
        setCardNumber(raw);
    };

    const handleExpiryInput = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        setExpiry(val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock payment processing
        navigate('/order-confirmation');
    };

    return (
        <main className="checkout-container">
            {/* Progress Steps */}
            <div className="checkout-steps">
                <div className="step completed">
                    <div className="step-circle">✓</div>
                    <div className="step-label">Cart</div>
                </div>
                <div className="step completed">
                    <div className="step-circle">✓</div>
                    <div className="step-label">Address</div>
                </div>
                <div className="step active">
                    <div className="step-circle">3</div>
                    <div className="step-label">Payment</div>
                </div>
                <div className="step">
                    <div className="step-circle">4</div>
                    <div className="step-label">Confirm</div>
                </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 0.8fr' }}>
                {/* Payment Form */}
                <div className="form-card">
                    <div className="form-header">
                        <h2>Payment Method</h2>
                    </div>

                    <div className="payment-methods">
                        <div className="payment-method-card active">
                            <span>💳</span>
                            <span>Credit Card</span>
                        </div>
                        <div className="payment-method-card">
                            <span>🅿️</span>
                            <span>PayPal</span>
                        </div>
                    </div>

                    {/* Credit Card Visual */}
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

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-inner">
                            <div className="form-group full-width">
                                <label className="form-label">Card Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength="19"
                                    value={formatCardNumber(cardNumber)}
                                    onChange={handleCardInput}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Cardholder Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Naruto Uzumaki"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Expiry Date</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    value={expiry}
                                    onChange={handleExpiryInput}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">CVC</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="123"
                                    maxLength="3"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '0.85rem', marginTop: '16px' }}>
                            🔒 <strong>SSL Encrypted:</strong> Your transaction is 100% secure.
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', display: 'flex' }}>
                            <Link to="/checkout" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                                ← Back to Address
                            </Link>
                            <button type="submit" className="btn primary">Pay ₹12,035</button>
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

                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹12,035</span>
                    </div>

                    <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        By clicking "Pay Now", you agree to our Terms of Service. Purchases are simulated for this demo.
                    </div>
                </div>
            </div>
        </main>
    );
}
