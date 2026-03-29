import React from 'react';
import './GiftCards.css';

export default function GiftCards() {
    return (
        <main className="gift-main">
            <section className="gift-shell">
                <h1 className="gift-heading">Gift Cards</h1>
                <p className="gift-subtitle">
                    Share your love for anime with digital and physical gift cards.
                </p>

                <div className="gift-grid">
                    <article className="gift-card">
                        <div className="gift-image-slot" style={{ background: 'linear-gradient(135deg, #a7f3d0, #34d399)' }}>
                            <span style={{ fontSize: '3rem' }}>🎁</span>
                        </div>
                        <h2>Starter Gift Card</h2>
                        <p className="gift-amount">From ₹500</p>
                    </article>

                    <article className="gift-card">
                        <div className="gift-image-slot" style={{ background: 'linear-gradient(135deg, #bfdbfe, #60a5fa)' }}>
                            <span style={{ fontSize: '3rem' }}>🎉</span>
                        </div>
                        <h2>Fan Favourite Gift Card</h2>
                        <p className="gift-amount">From ₹1,000</p>
                    </article>

                    <article className="gift-card">
                        <div className="gift-image-slot" style={{ background: 'linear-gradient(135deg, #ddd6fe, #a78bfa)' }}>
                            <span style={{ fontSize: '3rem' }}>💎</span>
                        </div>
                        <h2>Collector Gift Card</h2>
                        <p className="gift-amount">From ₹2,000</p>
                    </article>
                </div>
            </section>
        </main>
    );
}
