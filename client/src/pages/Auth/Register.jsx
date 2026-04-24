import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css'; // Reusing Login styles

export default function Register() {
    const navigate = useNavigate();
    const { register, loading } = useAuthStore();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!firstName.trim()) newErrors.firstName = 'First name is required.';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
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
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!agreeTerms) newErrors.terms = 'You must agree to the Terms & Policy.';
        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        const result = await register({ firstName, lastName, email, password });
        if (result.success) {
            navigate('/');
        } else {
            setErrors({ api: result.message });
        }
    };

    const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

    return (
        <main className="login-main">
            <section className="login-shell">
                {/* Left Side Hero */}
                <div className="login-hero auth-obsidian-hero">
                    <div className="auth-logo">OtakuNation</div>
                    <div className="login-hero-content">
                        <h2>Get Started with Us</h2>
                        <p className="auth-hero-sub">Complete these easy steps to register your account.</p>
                        <p className="auth-hero-desc">
                            Join our community of anime enthusiasts. Create your profile today to unlock priority access to new arrivals, personalized recommendations, and a faster checkout experience.
                        </p>
                    </div>
                </div>

                {/* Right Side Card */}
                <div className="login-card">
                    <h1>Sign Up Account</h1>
                    <p className="login-subtitle">Enter your personal data to create your account.</p>

                    <form className="login-form" onSubmit={handleRegister} noValidate>

                        <div className="register-fields-row">
                            <label className="login-field">
                                <span className="login-label">First Name</span>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="eg. John"
                                    className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                                    value={firstName}
                                    onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                                />
                                {errors.firstName && <span className="field-error-msg">{errors.firstName}</span>}
                            </label>
                            <label className="login-field">
                                <span className="login-label">Last Name</span>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="eg. Francisco"
                                    className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                                    value={lastName}
                                    onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                                />
                                {errors.lastName && <span className="field-error-msg">{errors.lastName}</span>}
                            </label>
                        </div>

                        <label className="login-field">
                            <span className="login-label">Email</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="eg. johnfrans@gmail.com"
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                            />
                            {errors.email && <span className="field-error-msg">{errors.email}</span>}
                        </label>

                        <div className="register-fields-row">
                            <label className="login-field">
                                <span className="login-label">Password</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                                />
                                {errors.password
                                    ? <span className="field-error-msg">{errors.password}</span>
                                    : <span className="login-helper-text">Must be at least 8 characters.</span>
                                }
                            </label>
                            <label className="login-field">
                                <span className="login-label">Confirm</span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                                />
                                {errors.confirmPassword && <span className="field-error-msg">{errors.confirmPassword}</span>}
                            </label>
                        </div>

                        <label className="login-remember register-terms">
                            <input
                                type="checkbox"
                                name="terms"
                                checked={agreeTerms}
                                onChange={(e) => { setAgreeTerms(e.target.checked); clearError('terms'); }}
                            />
                            <span>I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="login-link-small">Terms &amp; Policy</a></span>
                        </label>
                        {errors.terms && <span className="field-error-msg" style={{ marginTop: '-8px' }}>{errors.terms}</span>}

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
                            {loading ? 'Creating account…' : 'Sign Up'}
                        </button>

                        <p className="login-bottom-text">
                            Already have an account? <Link to="/login" className="login-link-small">Log in</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
