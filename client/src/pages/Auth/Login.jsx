import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css';

export default function Login() {
    const navigate  = useNavigate();
    const { login, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        }
        return newErrors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        const result = await login({ email, password });
        if (result.success) {
            // Redirect admin to admin panel, regular user to home
            if (result.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setErrors({ api: result.message });
        }
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
                            Access your exclusive Otaku Nation account to track orders, manage your wishlist, and secure limited edition drops before they're gone.
                        </p>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="login-card">
                    <h1>Log In Account</h1>
                    <p className="login-subtitle">Enter your personal data to access your account.</p>

                    <form className="login-form" onSubmit={handleLogin} noValidate>

                        <label className="login-field">
                            <span className="login-label">Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="eg. johnfrans@gmail.com"
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                            />
                            {errors.email && <span className="field-error-msg">{errors.email}</span>}
                        </label>

                        <label className="login-field">
                            <span className="login-label">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                className={`form-input ${errors.password ? 'input-error' : ''}`}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                            />
                            {errors.password
                                ? <span className="field-error-msg">{errors.password}</span>
                                : <span className="login-helper-text">Must be at least 8 characters.</span>
                            }
                        </label>

                        <div className="login-row-between">
                            <label className="login-remember">
                                <input type="checkbox" name="remember" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="login-link-small">Forgot password?</Link>
                        </div>

                        {errors.api && (
                            <div className="field-error-msg" style={{ textAlign: 'center', marginBottom: '4px' }}>
                                {errors.api}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn primary login-btn-full auth-primary-submit"
                            disabled={loading}
                        >
                            {loading ? 'Logging in…' : 'Log In'}
                        </button>

                        <p className="login-bottom-text">
                            Don't have an account? <Link to="/register" className="login-link-small">Sign up</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
