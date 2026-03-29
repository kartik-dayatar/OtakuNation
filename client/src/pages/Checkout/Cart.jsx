import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaLock, FaSyncAlt, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { GiFox, GiTShirt, GiBroadsword, GiPirateFlag } from 'react-icons/gi';
import './Cart.css';

const INITIAL_CART = [
    { id: 1, name: "Naruto Sage Mode Figure", price: 2499, qty: 1, icon: "fox", desc: "Collectible • 18cm PVC" },
    { id: 2, name: "Attack on Titan Hoodie", price: 1999, qty: 2, icon: "tshirt", desc: "Survey Corps • Size L" },
    { id: 3, name: "Demon Slayer Katana Replica", price: 4999, qty: 1, icon: "sword", desc: "Nichirin Blade • Steel" },
    { id: 4, name: "One Piece Wanted Poster Set", price: 799, qty: 3, icon: "pirate", desc: "Pack of 9 • A4 Matte" }
];

const iconMap = {
    fox: <GiFox size={24} />,
    tshirt: <GiTShirt size={24} />,
    sword: <GiBroadsword size={24} />,
    pirate: <GiPirateFlag size={24} />
};

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 149;
const DISCOUNT_PERCENT = 10;

export default function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(INITIAL_CART);
    const [totals, setTotals] = useState({ subtotal: 0, shipping: 0, discount: 0, total: 0 });

    useEffect(() => {
        recalculate();
    }, [cartItems]);

    const recalculate = () => {
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.qty;
        });

        const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const discount = Math.round((subtotal * DISCOUNT_PERCENT) / 100);
        const total = subtotal + shipping - discount;

        setTotals({ subtotal, shipping, discount, total });
    };

    const changeQty = (id, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty < 1 ? item : { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const formatCurrency = (num) => '₹' + num.toLocaleString('en-IN');

    if (cartItems.length === 0) {
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
                        <span className="cart-heading">Cart <span className="cart-count-badge">{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span></span>
                    </div>

                    <div className="cart-list">
                        {cartItems.map(item => (
                            <article key={item.id} className="cart-row">
                                <div className="cart-product">
                                    <div className="cart-image-slot">
                                        <span style={{ display: 'flex' }}>{iconMap[item.icon]}</span>
                                    </div>
                                    <div className="cart-product-info">
                                        <h2>{item.name}</h2>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                                <div className="cart-price">{formatCurrency(item.price)}</div>
                                <div className="cart-qty">
                                    <button className="cart-qty-btn" onClick={() => item.qty === 1 ? removeItem(item.id) : changeQty(item.id, -1)}>−</button>
                                    <span className="qty-value">{item.qty}</span>
                                    <button className="cart-qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                                </div>
                                <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
                                    <FaTrash />
                                </button>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Mini Billing / Order Summary Section */}
                <aside className="cart-summary">
                    <h2>Order Summary</h2>
                    <ul className="billing-items-list">
                        {cartItems.map(item => (
                            <li key={item.id} className="billing-item">
                                <span className="billing-item-name">{item.name}</span>
                                <span className="billing-item-qty">×{item.qty}</span>
                                <span className="billing-item-total">{formatCurrency(item.price * item.qty)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span>{totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}</span>
                    </div>
                    <div className="cart-summary-row savings">
                        <span>Discount (10%)</span>
                        <span>−{formatCurrency(totals.discount)}</span>
                    </div>
                    <div className="cart-summary-divider"></div>
                    <div className="cart-summary-row cart-summary-total">
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                    <button onClick={() => navigate('/checkout')} className="btn primary cart-checkout-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '20px' }}>
                        Proceed to Checkout <FaLock size={14} />
                    </button>
                    <Link to="/home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <FaArrowLeft size={12} /> Continue Shopping
                    </Link>
                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaLock size={12} /> Secure Checkout &bull; 30-Day Returns
                    </div>
                </aside>
            </section>
        </main>
    );
}
