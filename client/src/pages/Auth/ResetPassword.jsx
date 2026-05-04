import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword, loading } = useAuthStore();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const result = await resetPassword(token, password);
        if (result.success) {
            setMessage(result.message + ' Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setError(result.message);
        }
    };

    return (
        <main className="login-main">
            <section className="login-shell">
                <div className="login-hero auth-obsidian-hero">
                    <div className="auth-logo">OtakuNation</div>
                    <div className="login-hero-content">
                        <h2>Set New Password</h2>
                        <p className="auth-hero-sub">Secure your account.</p>
                        <p className="auth-hero-desc">
                            Create a strong, unique password to protect your OtakuNation account and continue your journey.
                        </p>
                    </div>
                </div>

                <div className="login-card">
                    <h1>Reset Password</h1>
                    <p className="login-subtitle">Enter your new password below.</p>

                    <form className="login-form" onSubmit={handleReset}>
                        <label className="login-field">
                            <span className="login-label">New Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter new password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </label>

                        <label className="login-field">
                            <span className="login-label">Confirm New Password</span>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        
                        <p className="login-bottom-text" style={{ marginTop: '24px' }}>
                            <Link to="/login" className="login-link-small">Back to Login</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
