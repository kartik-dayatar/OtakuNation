import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './NewArrivals.css';

export default function NewArrivals() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        // Countdown Timer logic
        const end = Date.now() + (2 * 86400000 + 14 * 3600000 + 21 * 60000);

        const tick = () => {
            const diff = Math.max(0, end - Date.now());
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
                    <a href="#drops" className="na-hero-cta">Shop Now &#8595;</a>
                </div>
            </section>

            {/* 2. DROP COUNTDOWN */}
            <section className="na-countdown-strip">
                <div className="container na-countdown-inner">
                    <span className="na-countdown-label">&#128293; Next Drop In:</span>
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
            <section className="section" id="drops">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2>Featured Drop</h2>
                            <p>The one everyone's talking about</p>
                        </div>
                    </div>
                    <div className="na-featured-grid">
                        <Link to="/product/100" className="na-featured-card">
                            <div className="na-featured-img" style={{ background: 'url(/src/assets/images/products/gojo-figure.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span>
                                <span className="na-scarcity">Only 8 left</span>
                            </div>
                            <div className="na-featured-info">
                                <span className="na-drop-label">Exclusive Drop</span>
                                <h3>Gojo Satoru — Unlimited Void Premium Figure</h3>
                                <p className="na-featured-desc">Hand-painted 1/7 scale figure with LED domain expansion base. Limited to 500 units worldwide. Bandai Spirits x OtakuNation exclusive.</p>
                                <div className="na-featured-meta">
                                    <span className="na-featured-price">₹15,687</span>
                                    <span className="na-featured-rating">&#11088; 5.0 &middot; 42 reviews</span>
                                </div>
                                <span className="na-add-btn">Add to Cart &#8594;</span>
                            </div>
                        </Link>
                        <Link to="/product/101" className="na-side-card">
                            <div className="na-side-img" style={{ background: 'url(/src/assets/images/products/hashira-statchu.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Only 12 left</span>
                            </div>
                            <div className="na-side-info">
                                <span className="na-drop-label">Limited Edition</span>
                                <h3>Demon Slayer Hashira Collection Box</h3><span className="na-side-price">₹10,707</span>
                            </div>
                        </Link>
                        <Link to="/product/102" className="na-side-card">
                            <div className="na-side-img" style={{ background: 'url(/src/assets/images/products/anya-plush.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Exclusive</span>
                            </div>
                            <div className="na-side-info">
                                <span className="na-drop-label">Studio Collab</span>
                                <h3>Anya Forger — Waku Waku Edition</h3><span className="na-side-price">₹6,142</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. FULL GRID */}
            <section className="section na-grid-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2>All New Arrivals</h2>
                            <p>Fresh drops added this week</p>
                        </div>
                    </div>
                    <div className="na-grid">
                        <Link to="/product/103" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/tanjiro-earings.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Only 15 left</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Tanjiro Kamado Earrings Set</h3>
                                <p className="na-card-anime">Demon Slayer</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹1,992</span><span className="na-card-rating">&#11088; 4.8</span></div>
                            </div>
                        </Link>
                        <Link to="/product/104" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/sukuna-fingure-replica.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Limited Edition</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Sukuna Finger Replica Set</h3>
                                <p className="na-card-anime">Jujutsu Kaisen</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹4,648</span><span className="na-card-rating">&#11088; 4.9</span></div>
                            </div>
                        </Link>
                        <Link to="/product/105" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/luffy-G5-tee.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Exclusive Drop</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Gear 5 Luffy Oversized Tee</h3>
                                <p className="na-card-anime">One Piece</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹3,154</span><span className="na-card-rating">&#11088; 4.7</span></div>
                            </div>
                        </Link>
                        <Link to="/product/106" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/deku.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Only 20 left</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Deku Full Cowling LED Lamp</h3>
                                <p className="na-card-anime">My Hero Academia</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹4,067</span><span className="na-card-rating">&#11088; 4.6</span></div>
                            </div>
                        </Link>
                        <Link to="/product/107" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/AOT-jackate.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Limited Edition</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Levi Ackerman Scout Cloak</h3>
                                <p className="na-card-anime">Attack on Titan</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹5,976</span><span className="na-card-rating">&#11088; 4.9</span></div>
                            </div>
                        </Link>
                        <Link to="/product/108" className="na-card">
                            <div className="na-card-img" style={{ background: 'url(/src/assets/images/products/vagita-figure.jpg) center/cover no-repeat' }}>
                                <span className="na-badge-glow">NEW</span><span className="na-scarcity">Only 6 left</span>
                            </div>
                            <div className="na-card-body">
                                <h3>Vegeta Final Flash Figure</h3>
                                <p className="na-card-anime">Dragon Ball Z</p>
                                <div className="na-card-bottom"><span className="na-card-price">₹7,885</span><span className="na-card-rating">&#11088; 4.8</span></div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
