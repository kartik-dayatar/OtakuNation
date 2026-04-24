import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaFire,
    FaStar,
    FaBox,
    FaFilm,
    FaSmile,
    FaLock,
    FaCheckCircle,
    FaBolt,
    FaTruck,
    FaShieldAlt,
    FaTrophy,
    FaChevronLeft,
    FaChevronRight,
    FaArrowUp,
    FaLongArrowAltRight,
    FaGem,
    FaShippingFast
} from 'react-icons/fa';
import axios from 'axios';
import useProductStore from '../../store/productStore';
import useSiteStore from '../../store/siteStore';
import useArticleStore from '../../store/articleStore';
import './Home.css';

const API_URL = 'http://localhost:5000/api';

function Home() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollTrackRef = useRef(null);

    // Newsletter State
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setSubmittingNewsletter(true);
        setErrorMsg('');
        try {
            const { data } = await axios.post(`${API_URL}/newsletter/subscribe`, { email: newsletterEmail });
            setNewsletterSubscribed(true);
            setStatusMsg(data.message);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setSubmittingNewsletter(false);
        }
    };

    const { products, fetchProducts, loading: productLoading, animeSeries, fetchAnimeSeries } = useProductStore();
    const { fetchSettings, loading: siteLoading, heroSlides, statsData, whyUsData, testimonials } = useSiteStore();
    const { fetchArticles, getNews, getBlogs } = useArticleStore();

    // Ensure we fetch all necessary data
    useEffect(() => {
        fetchProducts();
        fetchSettings();
        fetchArticles();
        fetchAnimeSeries();
    }, [fetchProducts, fetchSettings, fetchArticles, fetchAnimeSeries]);

    // Carousel Auto-Play
    useEffect(() => {
        if (!heroSlides.length) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    // Derive Trending and Fresh Drops dynamically from the DB products array 
    const dbTrendingProducts = products.length > 0 ? products.slice(0, 8) : [];
    const dbFreshDrops = products.length > 0 ? products.slice(products.length >= 3 ? products.length - 3 : 0).reverse() : [];

    const nextSlide = () => {
        if (!heroSlides.length) return;
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    const prevSlide = () => {
        if (!heroSlides.length) return;
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }

    // Scroll Logic
    const scrollLeft = () => {
        if (scrollTrackRef.current) scrollTrackRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    };
    const scrollRight = () => {
        if (scrollTrackRef.current) scrollTrackRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    };

    // Fade In Observer Replacement
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

        // Back to top logic
        const handleScroll = () => {
            const btn = document.getElementById('backToTop');
            if (btn) btn.classList.toggle('visible', window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="home-wrapper">

            {/* 1. HERO CAROUSEL */}
            <section className="hero-carousel" id="hero">
                <div className="carousel-track">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ background: slide.bg }}
                        >
                            <div className="container slide-layout">
                                <div className="slide-content">
                                    <span className="slide-badge">{slide.badge}</span>
                                    <h1 className="slide-title">{slide.title}</h1>
                                    <p className="slide-subtitle">{slide.subtitle}</p>
                                    <div className="slide-actions">
                                        <button onClick={() => navigate(slide.primaryBtn.link)} className="btn primary btn-lg">
                                            {slide.primaryBtn.text}
                                        </button>
                                        <button onClick={() => navigate(slide.secondaryBtn.link)} className="btn ghost-light btn-lg">
                                            {slide.secondaryBtn.text}
                                        </button>
                                    </div>
                                </div>
                                <div className="slide-visual">
                                    {slide.visuals.map((vis, i) => (
                                        <div key={i} className={`hero-float-card ${vis.class}`}>
                                            <img
                                                src={vis.img}
                                                alt={vis.text}
                                                className="float-img"
                                                style={{}}
                                            />
                                            <span>{vis.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-arrow carousel-prev" onClick={prevSlide} aria-label="Previous"><FaChevronLeft /></button>
                <button className="carousel-arrow carousel-next" onClick={nextSlide} aria-label="Next"><FaChevronRight /></button>
                <div className="carousel-dots">
                    {heroSlides.map((_, i) => (
                        <button
                            key={i}
                            className={`dot ${i === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(i)}
                        ></button>
                    ))}
                </div>
            </section>

            {/* 2. STATS STRIP */}
            <section className="stats-strip">
                <div className="container">
                    <div className="stats-row">
                        {statsData.map((stat, i) => {
                            const Icon = {
                                package: FaBox,
                                film: FaFilm,
                                happy: FaSmile,
                                lock: FaLock,
                                check: FaCheckCircle
                            }[stat.icon] || FaBox;
                            return (
                                <div key={i} className="stat-item fade-in">
                                    <span className="stat-icon"><Icon /></span>
                                    <div><strong>{stat.strong}</strong><p>{stat.text}</p></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. SHOP BY ANIME */}
            <section className="section" id="shop-anime">
                <span id="categories" style={{ position: 'absolute', top: '-100px' }}></span>
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>Shop by Anime</h2>
                            <p>Find merch from your favorite series</p>
                        </div>
                        <button onClick={() => navigate('/products')} className="section-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            View All <FaLongArrowAltRight />
                        </button>
                    </div>
                    <div className="anime-scroll-wrapper">
                        <button className="scroll-arrow scroll-left" onClick={scrollLeft} aria-label="Scroll left"><FaChevronLeft /></button>
                        <div className="anime-scroll-track" ref={scrollTrackRef}>
                            {animeSeries.map((anime, i) => (
                                <div key={anime._id || i} onClick={() => navigate(`/products?anime=${anime.slug}`)} className="anime-card" style={{ cursor: 'pointer' }}>
                                    <div className="anime-card-img" style={{ background: `linear-gradient(135deg, ${anime.gradientFrom}, ${anime.gradientTo})` }}>
                                        {anime.thumbnailUrl && <img src={anime.thumbnailUrl.startsWith('/') ? anime.thumbnailUrl : `/assets/images/${anime.thumbnailUrl}`} alt={anime.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <h3>{anime.name}</h3><span className="anime-card-count">Explore &rarr;</span>
                                </div>
                            ))}
                        </div>
                        <button className="scroll-arrow scroll-right" onClick={scrollRight} aria-label="Scroll right"><FaChevronRight /></button>
                    </div>
                </div>
            </section>

            {/* 4. TRENDING PRODUCTS */}
            <section className="section section-alt" id="trending">
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>Trending Now <FaFire style={{ color: '#ff4d4d' }} /></h2>
                            <p>Most popular picks this week</p>
                        </div>
                        <button onClick={() => navigate('/products?type=trending')} className="section-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            See All <FaLongArrowAltRight />
                        </button>
                    </div>
                    <div className="trending-grid">
                        {productLoading && products.length === 0 ? <p style={{ textAlign: "center", width: "100%" }}>Loading items...</p> : dbTrendingProducts.map((item) => (
                            <div key={item._id || item.id} onClick={() => navigate(`/product/${item._id || item.id}`)} className="trending-card fade-in" style={{ cursor: 'pointer' }}>
                                <div className="trending-img">
                                    <img src={item.image || item.img || "/assets/placeholder.png"} alt={item.name} />
                                    <span className="trending-badge">{item.badge || 'Trending'}</span>
                                </div>
                                <div className="trending-info">
                                    <h3>{item.name}</h3>
                                    <p className="trending-anime">{item.category}</p>
                                    <div className="trending-bottom">
                                        <span className="trending-price">₹{item.price?.toLocaleString()}</span>
                                        <span className="trending-rating">
                                            <FaStar style={{ color: '#ffc107', marginRight: '4px' }} /> {item.rating || '5.0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FRESH DROPS PREVIEW */}
            <section className="fresh-drops-section">
                <div className="container">
                    <div className="fresh-drops-header fade-in">
                        <div>
                            <h2 className="fresh-drops-title">Fresh Drops <FaFire style={{ color: '#ff4d4d' }} /></h2>
                            <p className="fresh-drops-sub">Just landed. Limited stock.</p>
                        </div>
                        <button onClick={() => navigate('/new-arrivals')} className="fresh-drops-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            View All <FaLongArrowAltRight />
                        </button>
                    </div>
                    <div className="fresh-drops-grid">
                        {productLoading && products.length === 0 ? <p style={{ textAlign: "center", width: "100%" }}>Loading items...</p> : dbFreshDrops.map((item, i) => (
                            <div key={item._id || item.id || i} onClick={() => navigate(`/product/${item._id || item.id}`)} className="fd-card fade-in" style={{ cursor: 'pointer' }}>
                                <div className="fd-card-img">
                                    <img src={item.image || item.img || "/assets/placeholder.png"} alt={item.name} />
                                    <span className="fd-badge">Just Released</span>
                                </div>
                                <div className="fd-card-body">
                                    <h3>{item.name}</h3><span className="fd-price">₹{item.price?.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. WHY US */}
            <section className="section" id="why-us">
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>Why OtakuNation?</h2>
                            <p>The trusted choice for anime fans worldwide</p>
                        </div>
                    </div>
                    <div className="why-grid">
                        {whyUsData.map((item, i) => {
                            const Icon = {
                                quality: FaGem,
                                truck: FaShippingFast,
                                shield: FaLock,
                                crown: FaCheckCircle
                            }[item.icon] || FaBolt;
                            return (
                                <div key={i} className="why-card fade-in">
                                    <div className="why-icon"><Icon /></div>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 6. CUSTOMER REVIEWS */}
            <section className="section section-alt" id="reviews">
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>What Our Customers Say</h2>
                            <p>Real reviews from real otaku</p>
                        </div>
                    </div>
                    <div className="reviews-grid">
                        {testimonials.map((review, i) => (
                            <div key={i} className="review-card fade-in">
                                <div className="review-stars">
                                    {[...Array(5)].map((_, i) => <FaStar key={i} style={{ color: '#ffc107' }} />)}
                                </div>
                                <p className="review-text">{review.text}</p>
                                <div className="review-author">
                                    <div className="review-avatar" style={{ background: review.bg || '#3b82f6' }}>{review.initial || review.author[0]}</div>
                                    <div><strong>{review.author}</strong><span>Verified Buyer</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. ANIME NEWS */}
            <section className="section" id="news">
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>Latest Anime News</h2>
                            <p>Stay updated with the otaku world</p>
                        </div>
                    </div>
                    <div className="news-grid">
                        {getNews().map((news, i) => (
                            <article key={news._id || i} className="news-card fade-in">
                                <div className="news-img">
                                    <img src={news.imageUrl} alt={news.title} />
                                </div>
                                <div className="news-body"><span className="news-tag">{news.categoryTag || 'News'}</span>
                                    <h3>{news.title}</h3>
                                    <p>{news.excerpt}</p><a href="#" className="news-link">Read More <FaLongArrowAltRight /></a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. BLOG */}
            <section className="section section-alt" id="blog">
                <div className="container">
                    <div className="section-header fade-in">
                        <div>
                            <h2>From the Blog</h2>
                            <p>Guides, spotlights, and otaku culture</p>
                        </div>
                        <a href="#" className="section-link">All Posts &#8594;</a>
                    </div>
                    <div className="blog-grid">
                        {getBlogs().map((post, i) => (
                            <article key={post._id || i} className="blog-card fade-in">
                                <div className="blog-img">
                                    <img src={post.imageUrl} alt={post.title} />
                                </div>
                                <div className="blog-body"><span className="blog-date">{new Date(post.publishedAt || Date.now()).toLocaleDateString()}</span>
                                    <h3>{post.title}</h3>
                                    <p>{post.excerpt}</p><a href="#" className="blog-link">Read Article <FaLongArrowAltRight /></a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. NEWSLETTER */}
            <section className="newsletter-section" id="newsletter">
                <div className="newsletter-bg-animate"></div>
                <div className="container newsletter-inner fade-in">
                    <h2>Stay in the Loop</h2>
                    <p>Get exclusive drops, early access to sales, and anime news delivered to your inbox.</p>

                    {newsletterSubscribed ? (
                        <div className="newsletter-success" style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', marginTop: '20px' }}>
                            <FaCheckCircle style={{ fontSize: '2rem', color: '#10b981', marginBottom: '10px' }} />
                            <h3>{statusMsg || "You're on the list!"}</h3>
                        </div>
                    ) : (
                        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                required
                                aria-label="Email address"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                disabled={submittingNewsletter}
                            />
                            <button type="submit" className="btn primary btn-lg" disabled={submittingNewsletter}>
                                {submittingNewsletter ? '...' : 'Subscribe'}
                            </button>
                        </form>
                    )}

                    {errorMsg && <p style={{ color: '#ff4d4d', marginTop: '10px', fontSize: '0.9rem' }}>{errorMsg}</p>}
                    <span className="newsletter-note">No spam, ever. Unsubscribe anytime.</span>
                </div>
            </section>

            {/* Back to Top */}
            <button className="back-to-top" id="backToTop" aria-label="Back to top" onClick={scrollToTop}>
                <FaArrowUp />
            </button>

        </div>
    );
}

export default Home;


