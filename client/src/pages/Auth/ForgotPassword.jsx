import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing Login styles for consistent branding

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleResetPassword = (e) => {
        e.preventDefault();
        // Here you would typically handle the API call to send a reset link
        // For now, we'll navigate back to login after an alert or just redirect
        alert("If an account exists with this email, a password reset link has been sent.");
        navigate('/login');
    };

    return (
        <main className="login-main">
            <section className="login-shell">
                {/* Left Side Hero */}
                <div className="login-hero auth-obsidian-hero">
                    <div className="auth-logo">OtakuNation</div>
                    <div className="login-hero-content">
                        <h2>Reset Password</h2>
                        <p className="auth-hero-sub">Lost your way? We've got you covered.</p>
                        <p className="auth-hero-desc">
                            Enter the email address associated with your OtakuNation account, and we'll send you a secure link to reset your password and get you back into the universe.
                        </p>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="login-card">
                    <h1>Forgot Password</h1>
                    <p className="login-subtitle">Enter your email to receive a password reset link.</p>

                    <form className="login-form" onSubmit={handleResetPassword}>
                        <label className="login-field">
                            <span className="login-label">Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="eg. johnfrans@gmail.com"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <button type="submit" className="btn primary login-btn-full auth-primary-submit" style={{ marginTop: '32px' }}>Send Reset Link</button>

                        <p className="login-bottom-text" style={{ marginTop: '24px' }}>
                            Remember your password? <Link to="/login" className="login-link-small">Log in</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
