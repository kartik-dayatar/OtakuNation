import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useProductStore from '../../store/productStore';
import './Wishlist.css';

export default function Wishlist() {
    // Mock wishlist data - using real products
    const products = useProductStore((state) => state.products);
    const [wishlist, setWishlist] = useState(products.slice(0, 6));
    const navigate = useNavigate();

    const addItem = useCartStore((state) => state.addItem);

    const handleRemove = (id) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

    const handleAddToCart = (item) => {
        addItem(item, item.sizes ? item.sizes[0] : 'M'); // Default to M or first size
        navigate('/cart');
    };

    return (
        <main className="wishlist-main">
            <section className="wishlist-hero">
                <div className="wishlist-heading">
                    <h1><span className="wishlist-heart">❤</span>My Wishlist</h1>
                    <p>Your saved anime favourites in one place.</p>
                </div>

                <div className="wishlist-shell">
                    {wishlist.length > 0 ? (
                        <div className="wishlist-grid">
                            {wishlist.map(item => (
                                <article className="wishlist-card" key={item.id}>
                                    <div className="wishlist-image-slot">
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
                                    </div>
                                    <div className="wishlist-content">
                                        <Link to={`/product/${item.id}`} className="wishlist-title-link">
                                            <h2>{item.name}</h2>
                                        </Link>
                                        <p className="wishlist-price">₹{item.price.toLocaleString()}</p>

                                        <div className="stock-indicator">
                                            <span className={`dot ${item.inStock ? 'green' : 'red'}`}></span>
                                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                    </div>

                                    <div className="wishlist-actions">
                                        <button
                                            className="btn primary"
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.inStock}
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            className="btn ghost wishlist-remove"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">❤️</div>
                            <h2>Your wishlist is empty</h2>
                            <p>Save items you love here for later.</p>
                            <Link to="/products" className="btn primary">Start Browsing</Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
