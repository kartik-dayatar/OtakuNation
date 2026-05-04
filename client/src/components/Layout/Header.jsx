import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBolt, FaSearch, FaHeart, FaShoppingCart, FaUserCircle, FaUser, FaBox, FaSignOutAlt } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import './Header.css';

function Header({ variant = 'pre-login' }) {
    const navigate = useNavigate();
    // storeName uses a hardcoded fallback — no API call needed on public pages
    const storeName = 'OtakuNation';
    const cartCount = useCartStore((state) => state.getCount());
    const storeWords = storeName.split(' ');
    const brandFirst = storeWords[0]?.toUpperCase() || 'OTAKU';
    const brandSecond = storeWords.slice(1).join(' ').toUpperCase();
    const wishlistCount = useWishlistStore((state) => state.items.length);
    const { user, logout } = useAuthStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    const searchRef = useRef(null);
    const isPostLogin = variant === 'post-login' || !!user;

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live Search Logic (Debounced)
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/search?q=${searchTerm}`);
                setSuggestions(data.slice(0, 5));
                setShowSuggestions(true);
            } catch (err) {
                console.error("Live search error:", err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        
        setShowSuggestions(false);
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    };

    const handleSuggestionClick = (id) => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        navigate(`/product/${id}`);
    };

    return (
        <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="top-bar">
                {/* LEFT: Logo */}
                <div className="logo-container">
                    <Link to="/home" className="logo-link">
                        <div className="logo-badge">
                            <FaBolt className="logo-bolt" />
                        </div>
                        <span className="brand-name">
                            {brandFirst} <span className="brand-accent">{brandSecond}</span>
                        </span>
                    </Link>
                </div>

                {/* CENTER: Search Bar */}
                <div className="search-bar-container" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <input
                            type="text"
                            name="search"
                            className="search-input"
                            placeholder="Search for anime gear..."
                            aria-label="Search"
                            value={searchTerm}
                            autoComplete="off"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                        />
                        <button type="submit" className="search-submit" aria-label="Search">
                            <FaSearch />
                        </button>
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="search-suggestions">
                            {suggestions.map((p) => (
                                <div 
                                    key={p.id || p._id} 
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(p._id || p.id)}
                                >
                                    <div className="suggestion-thumb">
                                        <img src={p.image} alt={p.name} />
                                    </div>
                                    <div className="suggestion-info">
                                        <div className="suggestion-name">{p.name}</div>
                                        <div className="suggestion-price">₹{p.price.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CENTER-RIGHT: Navigation */}
                <nav className="main-nav">
                    <NavLink to="/home" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                    <NavLink to="/products" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Shop</NavLink>
                    <NavLink to="/new-arrivals" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>New Arrivals</NavLink>
                    <NavLink to="/contact" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
                </nav>

                {/* RIGHT: Actions */}
                <div className="header-actions">
                    <Link to="/wishlist" className="action-icon-btn" aria-label="Wishlist">
                        <FaHeart />
                        {wishlistCount > 0 && <span className="dot-badge">{wishlistCount}</span>}
                    </Link>

                    <Link to="/cart" className="action-icon-btn" aria-label="Cart">
                        <FaShoppingCart />
                        {user && cartCount > 0 && <span className="dot-badge">{cartCount}</span>}
                    </Link>

                    <div className="auth-container">
                        {isPostLogin ? (
                            <div className="user-dropdown-container">
                                <div className="user-avatar-trigger">
                                    <FaUserCircle size={28} />
                                </div>
                                <div className="user-dropdown-menu">
                                    <Link to="/account" className="dropdown-item">
                                        <FaUser className="drop-icon" /> Profile
                                    </Link>
                                    <Link to="/account/orders" className="dropdown-item">
                                        <FaBox className="drop-icon" /> Orders
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" className="dropdown-item admin-link">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button onClick={logout} className="dropdown-item logout-btn">
                                        <FaSignOutAlt className="drop-icon" /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="pre-login-buttons">
                                <Link to="/login" className="nav-auth-btn sign-in">Sign in</Link>
                                <Link to="/register" className="nav-auth-btn sign-up">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;

