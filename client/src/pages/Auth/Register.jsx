import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing Login styles
// import './Register.css'; // Specific overrides moved to Login.css

export default function Register() {
    const navigate = useNavigate();
    
    // Controlled inputs to capture name and email
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const handleRegister = (e) => {
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

                    <form className="login-form" onSubmit={handleRegister}>
                        <div className="auth-social-row">
                            <button type="button" className="login-google-btn">
                                <span className="login-google-icon-placeholder">G</span> Google
                            </button>
                            <button type="button" className="login-github-btn">
                                <span className="login-github-icon-placeholder">GH</span> Github
                            </button>
                        </div>

                        <div className="login-or">
                            <span></span><p>Or</p><span></span>
                        </div>

                        <div className="register-fields-row">
                            <label className="login-field">
                                <span className="login-label">First Name</span>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    placeholder="eg. John" 
                                    className="form-input" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </label>
                            <label className="login-field">
                                <span className="login-label">Last Name</span>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    placeholder="eg. Francisco" 
                                    className="form-input" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </label>
                        </div>

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

                        <div className="register-fields-row">
                            <label className="login-field">
                                <span className="login-label">Password</span>
                                <input type="password" name="password" placeholder="Enter your password" className="form-input" />
                                <span className="login-helper-text">Must be at least 8 characters.</span>
                            </label>
                            <label className="login-field">
                                <span className="login-label">Confirm</span>
                                <input type="password" name="confirmPassword" placeholder="Confirm password" className="form-input" />
                            </label>
                        </div>

                        <label className="login-remember register-terms">
                            <input type="checkbox" name="terms" />
                            <span>I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="login-link-small">Terms &amp; Policy</a></span>
                        </label>

                        <button type="submit" className="btn primary login-btn-full auth-primary-submit">Sign Up</button>

                        <p className="login-bottom-text">
                            Already have an account? <Link to="/login" className="login-link-small">Log in</Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
