import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <main className="login-main">
            <section className="login-shell">
                {/* Left Side Hero */}
                <div className="login-hero auth-obsidian-hero">
                    <div className="auth-logo">OtakuNation</div>
                    <div className="login-hero-content">
                        <h2>Welcome Back</h2>
                        <p className="auth-hero-sub">Step back into the anime universe.</p>
                        <p className="auth-hero-desc">
                            Access your exclusive Otaku Nation account to track orders, management your wishlist, and secure limited edition drops before they're gone.
                        </p>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="login-card">
                    <h1>Log In Account</h1>
                    <p className="login-subtitle">Enter your personal data to access your account.</p>

                    <form className="login-form" onSubmit={handleLogin}>

                        <label className="login-field">
                            <span className="login-label">Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="eg. johnfrans@gmail.com"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>

                        <label className="login-field">
                            <span className="login-label">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="login-helper-text">Must be at least 8 characters.</span>
                        </label>

                        <div className="login-row-between">
                            <label className="login-remember">
                                <input type="checkbox" name="remember" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="login-link-small">Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn primary login-btn-full auth-primary-submit">Log In</button>

                        <p className="login-bottom-text">
                            Don't have an account? <Link to="/register" className="login-link-small">Sign up</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
