import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import './NewArrivals.css';

export default function NewArrivals() {
    const navigate = useNavigate();
    const { products, fetchProducts, loading } = useProductStore();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        // Countdown Timer logic - Let's set it to end of current week for a dynamic feel
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday
        end.setHours(23, 59, 59, 999);

        const tick = () => {
            const diff = Math.max(0, end.getTime() - Date.now());
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft({ days: d, hours: h, mins: m, secs: s });
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const pad = (n) => n < 10 ? '0' + n : n;

    // Define New Arrivals as the 10 most recent products
    const sortedProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const featuredDrop = sortedProducts[0];
    const sideDrops = sortedProducts.slice(1, 3);
    const allNewArrivals = sortedProducts.slice(3, 12);

    if (loading && products.length === 0) {
        return (
            <div className="na-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
                <h3 style={{ marginLeft: '15px' }}>Discovering new artifacts...</h3>
            </div>
        );
    }

    return (
        <div className="na-wrapper">
            {/* 1. PREMIUM HERO */}
            <section className="na-hero">
                <div className="na-hero-bg"></div>
                <div className="na-hero-overlay"></div>
                <div className="na-hero-glow"></div>
                <div className="container na-hero-content">
                    <span className="na-hero-tag">Exclusive Collection</span>
                    <h1 className="na-hero-title">NEW SEASON DROP</h1>
                    <p className="na-hero-sub">Limited releases. Fresh from the studio.</p>
                    <a href="#drops" className="na-hero-cta">Shop Now ↓</a>
                </div>
            </section>

            {/* 2. DROP COUNTDOWN */}
            <section className="na-countdown-strip">
                <div className="container na-countdown-inner">
                    <span className="na-countdown-label">🔥 Next Drop In:</span>
                    <div className="na-timer">
                        <div className="na-timer-unit"><span>{pad(timeLeft.days)}</span><small>Days</small></div>
                        <div className="na-timer-sep">:</div>
                        <div className="na-timer-unit"><span>{pad(timeLeft.hours)}</span><small>Hours</small></div>
                        <div className="na-timer-sep">:</div>
                        <div className="na-timer-unit"><span>{pad(timeLeft.mins)}</span><small>Min</small></div>
                        <div className="na-timer-sep">:</div>
                        <div className="na-timer-unit"><span>{pad(timeLeft.secs)}</span><small>Sec</small></div>
                    </div>
                </div>
            </section>

            {/* 3. FEATURED DROP */}
            {featuredDrop && (
                <section className="section" id="drops">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <h2>Featured Drop</h2>
                                <p>The one everyone's talking about</p>
                            </div>
                        </div>
                        <div className="na-featured-grid">
                            <Link to={`/product/${featuredDrop._id || featuredDrop.id}`} className="na-featured-card">
                                <div className="na-featured-img" style={{ background: `url(${featuredDrop.image || '/assets/placeholder.png'}) center/cover no-repeat` }}>
                                    <span className="na-badge-glow">NEW</span>
                                    {featuredDrop.stock < 10 && <span className="na-scarcity">Only {featuredDrop.stock} left</span>}
                                </div>
                                <div className="na-featured-info">
                                    <span className="na-drop-label">Exclusive Drop</span>
                                    <h3>{featuredDrop.name}</h3>
                                    <p className="na-featured-desc">{featuredDrop.description}</p>
                                    <div className="na-featured-meta">
                                        <span className="na-featured-price">₹{featuredDrop.price?.toLocaleString()}</span>
                                        <span className="na-featured-rating">⭐ {featuredDrop.rating || '5.0'} &middot; {featuredDrop.reviews || 0} reviews</span>
                                    </div>
                                    <span className="na-add-btn">View Details →</span>
                                </div>
                            </Link>
                            
                            {sideDrops.map(drop => (
                                <Link key={drop._id || drop.id} to={`/product/${drop._id || drop.id}`} className="na-side-card">
                                    <div className="na-side-img" style={{ background: `url(${drop.image || '/assets/placeholder.png'}) center/cover no-repeat` }}>
                                        <span className="na-badge-glow">NEW</span>
                                        {drop.stock < 10 && <span className="na-scarcity">Only {drop.stock} left</span>}
                                    </div>
                                    <div className="na-side-info">
                                        <span className="na-drop-label">Limited Edition</span>
                                        <h3>{drop.name}</h3>
                                        <span className="na-side-price">₹{drop.price?.toLocaleString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. FULL GRID */}
            {allNewArrivals.length > 0 && (
                <section className="section na-grid-section">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <h2>All New Arrivals</h2>
                                <p>Fresh drops added recently</p>
                            </div>
                        </div>
                        <div className="na-grid">
                            {allNewArrivals.map(item => (
                                <Link key={item._id || item.id} to={`/product/${item._id || item.id}`} className="na-card">
                                    <div className="na-card-img" style={{ background: `url(${item.image || '/assets/placeholder.png'}) center/cover no-repeat` }}>
                                        <span className="na-badge-glow">NEW</span>
                                        {item.stock < 10 && <span className="na-scarcity">Only {item.stock} left</span>}
                                    </div>
                                    <div className="na-card-body">
                                        <h3>{item.name}</h3>
                                        <p className="na-card-anime">{item.category}</p>
                                        <div className="na-card-bottom">
                                            <span className="na-card-price">₹{item.price?.toLocaleString()}</span>
                                            <span className="na-card-rating">⭐ {item.rating || '5.0'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {products.length === 0 && !loading && (
                <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                    <h2>No new arrivals at the moment</h2>
                    <p style={{ color: '#64748b' }}>Check back later for exclusive drops!</p>
                    <Link to="/products" className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>Browse Catalog</Link>
                </div>
            )}
        </div>
    );
}
