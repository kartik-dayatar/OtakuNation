import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaLock, FaArrowLeft } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';
import './Cart.css';

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 149;
const DISCOUNT_PERCENT = 10;

export default function Cart() {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);

    const formatCurrency = (num) => '₹' + num.toLocaleString('en-IN');

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const discount = Math.round((subtotal * DISCOUNT_PERCENT) / 100);
    const total = subtotal + shipping - discount;

    if (items.length === 0) {
        return (
            <main className="cart-main">
                <section className="cart-shell" id="cartSection">
                    <div className="cart-empty-message">
                        <div className="empty-icon"><FaShoppingCart size={48} /></div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any anime gear yet.</p>
                        <Link to="/products" className="btn primary">Browse Products</Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-main">
            <section className="cart-shell" id="cartSection">
                {/* Cart Items */}
                <div className="cart-items">
                    <div className="cart-items-header">
                        <span className="cart-heading">
                            Cart <span className="cart-count-badge">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                        </span>
                    </div>

                    <div className="cart-list">
                        {items.map((item) => (
                            <article key={`${item.id}-${item.selectedSize}`} className="cart-row">
                                {/* Product image + info — clicking navigates to product detail */}
                                <div className="cart-product">
                                    <Link to={`/product/${item.id}`} className="cart-image-link">
                                        <div className="cart-image-slot">
                                            <img
                                                src={item.image || (item.images && item.images[0]) || '/assets/placeholder.png'}
                                                alt={item.name}
                                                className="cart-product-img"
                                            />
                                        </div>
                                    </Link>
                                    <div className="cart-product-info">
                                        <Link to={`/product/${item.id}`} className="cart-product-name-link">
                                            <h2>{item.name}</h2>
                                        </Link>
                                        <p>
                                            {item.category && <span>{item.category}</span>}
                                            {item.selectedSize && <span> • Size {item.selectedSize}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="cart-price">{formatCurrency(item.price)}</div>

                                <div className="cart-qty">
                                    <button
                                        className="cart-qty-btn"
                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                        aria-label="Decrease quantity"
                                    >−</button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="cart-qty-btn"
                                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                        aria-label="Increase quantity"
                                    >+</button>
                                </div>

                                <button
                                    className="cart-remove"
                                    onClick={() => removeItem(item.id, item.selectedSize)}
                                    aria-label="Remove item"
                                >
                                    <FaTrash />
                                </button>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <aside className="cart-summary">
                    <h2>Order Summary</h2>
                    <ul className="billing-items-list">
                        {items.map((item) => (
                            <li key={`${item.id}-${item.selectedSize}`} className="billing-item">
                                <span className="billing-item-name">{item.name}</span>
                                <span className="billing-item-qty">×{item.quantity}</span>
                                <span className="billing-item-total">{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                    </div>
                    <div className="cart-summary-row savings">
                        <span>Discount (10%)</span>
                        <span>−{formatCurrency(discount)}</span>
                    </div>
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row cart-summary-total">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="btn primary cart-checkout-btn"
                        style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '20px' }}
                    >
                        Proceed to Checkout <FaLock size={14} />
                    </button>
                    <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <FaArrowLeft size={12} /> Continue Shopping
                    </Link>
                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaLock size={12} /> Secure Checkout • 30-Day Returns
                    </div>
                </aside>
            </section>
        </main>
    );
}
