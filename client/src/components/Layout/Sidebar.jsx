import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../../data/products';
import { sidebarSlide, staggerContainer, staggerItem } from '../../utils/motionVariants';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
    // We'll use local state for collapsible sections if needed in future
    const [activeSection, setActiveSection] = useState('browse');

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={`sidebar ${isOpen ? 'open' : ''}`}
                initial={false}
                animate={isOpen ? 'visible' : 'hidden'}
                variants={sidebarSlide}
            >
                <div className="sidebar-header">
                    <Link to="/home" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">AnimeStore</span>
                    </Link>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-section">
                        <h3 className="sidebar-label">Browse</h3>
                        <nav className="sidebar-nav">
                            <NavLink to="/home" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <span className="link-icon">🏠</span>
                                <span className="link-text">Home</span>
                            </NavLink>
                            <NavLink to="/products" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <span className="link-icon">🛍️</span>
                                <span className="link-text">All Products</span>
                            </NavLink>
                            <NavLink to="/new-arrivals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <span className="link-icon">🔥</span>
                                <span className="link-text">New Arrivals</span>
                                <span className="sidebar-badge">New</span>
                            </NavLink>
                        </nav>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-label">Categories</h3>
                        <nav className="sidebar-nav">
                            {categories.map((cat) => (
                                <NavLink
                                    key={cat.id}
                                    to={`/products?category=${cat.id}`}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    <span className="link-icon">{cat.icon}</span>
                                    <span className="link-text">{cat.name}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-label">Account</h3>
                        <nav className="sidebar-nav">
                            <NavLink to="/account" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <span className="link-icon">👤</span>
                                <span className="link-text">Profile</span>
                            </NavLink>
                            <NavLink to="/wishlist" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                                <span className="link-icon">♡</span>
                                <span className="link-text">Wishlist</span>
                            </NavLink>
                        </nav>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="sidebar-user-card">
                        <div className="user-avatar">KD</div>
                        <div className="user-info">
                            <div className="user-name">Kartik Dayatar</div>
                            <div className="user-status">Premium Member</div>
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}

export default Sidebar;
