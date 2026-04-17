import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { adminLogin, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        const result = await adminLogin({ email, password });
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message);
        }
    };

    return (
        <main className="login-main">
            <section className="login-shell">
                {/* Left hero */}
                <div className="login-hero auth-obsidian-hero">
                    <div className="auth-logo">OtakuNation</div>
                    <div className="login-hero-content">
                        <h2>Admin Access</h2>
                        <p className="auth-hero-sub">Restricted to authorised staff only.</p>
                        <p className="auth-hero-desc">
                            Manage inventory, process orders, review customers and configure the store from one powerful dashboard.
                        </p>
                    </div>
                </div>

                {/* Right card */}
                <div className="login-card">
                    <h1>Admin Sign In</h1>
                    <p className="login-subtitle">Enter your admin credentials to access the panel.</p>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>

                        <label className="login-field">
                            <span className="login-label">Admin Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@otakunation.com"
                                className={`form-input ${error ? 'input-error' : ''}`}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            />
                        </label>

                        <label className="login-field">
                            <span className="login-label">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter admin password"
                                className={`form-input ${error ? 'input-error' : ''}`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            />
                        </label>

                        {error && (
                            <div className="field-error-msg" style={{ textAlign: 'center', marginBottom: '4px' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn primary login-btn-full auth-primary-submit"
                            disabled={loading}
                        >
                            {loading ? 'Signing in…' : 'Sign In to Admin'}
                        </button>

                        <p className="login-bottom-text">
                            <Link to="/" className="login-link-small">← Back to Store</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
