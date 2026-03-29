import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useToast } from '../ui/Toast'; // Assuming we use the existing global ToastProvider

function Footer() {
    const { addToast } = useToast();

    // Check URL params for 'toast' (e.g. ?toast=added) - User requested logic
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('toast') === 'added') {
            addToast('Item added to cart successfully!', 'success');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [addToast]);

    return (
        <footer className="site-footer">
            <div className="footer-top">
                {/* Col 1: Brand */}
                <div className="footer-brand">
                    <div className="logo">
                        <Link to="/">
                            <img src="/assets/Logo.png" alt="OtakuNation" style={{ height: '32px', width: 'auto' }} />
                        </Link>
                    </div>
                    <p>Your premium destination for officially licensed anime merchandise, apparel, and collectibles.</p>
                </div>

                {/* Col 2: Shop */}
                <div className="footer-links">
                    <h4>Shop</h4>
                    <Link to="/">All Products</Link>
                    <Link to="/products?type=new">New Arrivals</Link>
                    <Link to="/products?type=trending">Best Sellers</Link>
                    <Link to="/products?type=collections">Collections</Link>
                </div>

                {/* Col 3: Support */}
                <div className="footer-links">
                    <h4>Support</h4>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/account">My Account</Link>
                    <Link to="/order-tracking">Track Order</Link>
                    <Link to="/gift-cards">Gift Cards</Link>
                </div>

                {/* Col 4: Stay Connected */}
                <div className="footer-links">
                    <h4>Stay Connected</h4>
                    <a href="#">Instagram</a>
                    <a href="#">Twitter/X</a>
                    <a href="#">Discord Community</a>
                    <Link to="/admin">Admin Panel</Link>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} OtakuNation. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
