import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBolt, FaSearch, FaHeart, FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';
import './Header.css';

/**
 * Header component
 *
 * variant="pre-login"  → public pages (home, shop, product detail, new-arrivals, contact)
 *                        Shows: Sign In + Sign Up buttons
 *
 * variant="post-login" → pages that require the user to be logged in
 *                        Shows: username pill instead of auth buttons
 *
 * When no variant is passed it defaults to "pre-login".
 */
function Header({ variant = 'pre-login' }) {
    const navigate = useNavigate();
    const cartCount = useCartStore((state) => state.getCount());
    const [searchTerm, setSearchTerm] = useState('');

    const isPostLogin = variant === 'post-login';

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/products?search=${searchTerm}`);
    };

    return (
        <header className="site-header">
            <div className="top-bar">
                {/* LEFT: Logo */}
                <div className="logo-container">
                    <Link to="/home" className="logo-link">
                        <div className="logo-badge">
                            <FaBolt className="logo-bolt" />
                        </div>
                        <span className="brand-name">
                            OTAKU <span className="brand-accent">NATION</span>
                        </span>
                    </Link>
                </div>

                {/* CENTER: Search Bar */}
                <div className="search-bar-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search for anime gear..."
                            aria-label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" aria-label="Search">
                            <FaSearch />
                        </button>
                    </form>
                </div>

                {/* CENTER-RIGHT: Navigation */}
                <nav className="main-nav">
                    <Link to="/home">Home</Link>
                    <Link to="/products">Shop</Link>
                    <Link to="/new-arrivals">New Arrivals</Link>
                    <Link to="/contact">Contact</Link>
                </nav>

                {/* RIGHT: Actions */}
                <div className="header-actions">
                    <div className="auth-container">
                        {isPostLogin ? (
                            /* ── POST-LOGIN NAVBAR: show username ── */
                            <Link to="/account" className="user-pill">
                                <FaUserCircle size={20} />
                                <span className="user-name" style={{ marginLeft: "8px" }}>Otaku</span>
                            </Link>
                        ) : (
                            /* ── PRE-LOGIN NAVBAR: show Sign In / Sign Up ── */
                            <div className="pre-login-buttons">
                                <Link to="/login" className="btn ghost">Sign in</Link>
                                <Link to="/register" className="btn primary">Sign up</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/wishlist" className="btn ghost icon-btn" aria-label="Wishlist">
                        <FaHeart />
                    </Link>

                    <Link to="/cart" className="btn ghost icon-btn" aria-label="Cart">
                        <FaShoppingCart />
                        {cartCount > 0 && (
                            <span className="badge">{cartCount}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
