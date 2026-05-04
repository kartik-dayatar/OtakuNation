import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css'; // Reusing Login styles for consistent branding

export default function ForgotPassword() {
    const { forgotPassword, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (!email) {
            setError('Please enter your email.');
            return;
        }

        const result = await forgotPassword(email);
        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
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

                        {message && (
                            <div className="field-success-msg" style={{ color: 'green', textAlign: 'center', marginBottom: '10px' }}>
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="field-error-msg" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn primary login-btn-full auth-primary-submit" style={{ marginTop: '16px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="login-bottom-text" style={{ marginTop: '24px' }}>
                            Remember your password? <Link to="/login" className="login-link-small">Log in</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
