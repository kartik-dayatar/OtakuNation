import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './ForgotPassword.css';
import './Login.css';

const API_URL = 'http://localhost:5000/api/users';

export default function ForgotPassword() {
    const navigate = useNavigate();
    
    // Multi-step state
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    
    // Form data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Timers
    const [resendTimer, setResendTimer] = useState(0);
    const [otpExpiryTimer, setOtpExpiryTimer] = useState(600); // 10 minutes in seconds
    
    // Refs for OTP inputs
    const otpRefs = useRef([]);

    // Masked email for display in step 2
    const maskEmail = (str) => {
        if (!str) return '';
        const [user, domain] = str.split('@');
        return `${user.substring(0, 2)}***@${domain}`;
    };

    // Countdown logic
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        let interval;
        if (step === 2 && otpExpiryTimer > 0) {
            interval = setInterval(() => {
                setOtpExpiryTimer((prev) => prev - 1);
            }, 1000);
        } else if (otpExpiryTimer === 0) {
            setError('OTP expired');
        }
        return () => clearInterval(interval);
    }, [step, otpExpiryTimer]);

    // ── STEP 1: SEND OTP ──────────────────────────────────
    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
            if (data.success) {
                setSuccessMsg(`OTP sent to ${maskEmail(email)}`);
                setStep(2);
                setResendTimer(60);
                setOtpExpiryTimer(600);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // ── STEP 2: VERIFY OTP ────────────────────────────────
    const handleOtpChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);

        // Move focus to next
        if (val && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    useEffect(() => {
        // Auto-submit when all 6 digits are filled
        if (otp.every(digit => digit !== '') && step === 2) {
            handleVerifyOTP();
        }
    }, [otp]);

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');
        const fullOtp = otp.join('');
        
        try {
            const { data } = await axios.post(`${API_URL}/verify-otp`, { email, otp: fullOtp });
            if (data.success) {
                setResetToken(data.resetToken);
                setStep(3);
                setSuccessMsg('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            // Reset OTP on error to allow retry
            if (!err.response?.data?.message?.includes('expired')) {
                // setOtp(['', '', '', '', '', '']); // Optional: clear on error
                // otpRefs.current[0].focus();
            }
        } finally {
            setLoading(false);
        }
    };

    // ── STEP 3: RESET PASSWORD ────────────────────────────
    const getPasswordStrength = (pass) => {
        if (!pass) return { text: '', class: '' };
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        const length = pass.length;

        if (length >= 10 && hasLetter && hasNumber && hasSpecial) return { text: 'Strong', class: 'strong' };
        if (length >= 8 && hasLetter && hasNumber) return { text: 'Fair', class: 'fair' };
        return { text: 'Weak', class: 'weak' };
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(`${API_URL}/reset-password`, {
                resetToken,
                newPassword
            });

            if (data.success) {
                setSuccessMsg('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <main className="login-main">
            <div className="forgot-password-container">
                <div className="forgot-password-stepper">
                    <div className={`step-item ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                        <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                        <div className="step-label">Email</div>
                    </div>
                    <div className={`step-item ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                        <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                        <div className="step-label">OTP</div>
                    </div>
                    <div className={`step-item ${step >= 3 ? (step > 3 ? 'completed' : 'active') : ''}`}>
                        <div className="step-number">{step > 3 ? '✓' : '3'}</div>
                        <div className="step-label">New Password</div>
                    </div>
                </div>

                {/* STEP 1: ENTER EMAIL */}
                {step === 1 && (
                    <div className="step-content">
                        <h1>Forgot Password</h1>
                        <p className="login-subtitle">Enter your registered email to receive a 6-digit verification code.</p>
                        
                        <form className="login-form" onSubmit={handleSendOTP}>
                            <label className="login-field">
                                <span className="login-label">Email Address</span>
                                <input
                                    type="email"
                                    placeholder="eg. user@example.com"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>

                            {error && <div className="field-error-msg" style={{ marginTop: '10px' }}>{error}</div>}

                            <button type="submit" className="btn primary login-btn-full" disabled={loading} style={{ marginTop: '32px' }}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <p className="login-bottom-text" style={{ marginTop: '24px' }}>
                                <Link to="/login" className="login-link-small"><FiArrowLeft /> Back to Login</Link>
                            </p>
                        </form>
                    </div>
                )}

                {/* STEP 2: ENTER OTP */}
                {step === 2 && (
                    <div className="step-content">
                        <h1>Verify OTP</h1>
                        <p className="login-subtitle">
                            We've sent a 6-digit code to <span className="masked-email">{maskEmail(email)}</span>.
                        </p>
                        
                        <div className="otp-inputs">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    ref={(el) => (otpRefs.current[idx] = el)}
                                    onChange={(e) => handleOtpChange(e, idx)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                    className="otp-box"
                                    autoFocus={idx === 0}
                                />
                            ))}
                        </div>

                        {error && <div className="field-error-msg" style={{ textAlign: 'center', marginBottom: '10px' }}>{error}</div>}
                        
                        {otpExpiryTimer > 0 ? (
                            <p className="resend-timer">OTP expires in <strong>{formatTime(otpExpiryTimer)}</strong></p>
                        ) : (
                            <p className="resend-timer" style={{ color: '#ef4444' }}>OTP expired. <button className="resend-btn" onClick={handleSendOTP}>Request new OTP</button></p>
                        )}

                        <div className="resend-timer" style={{ marginTop: '10px' }}>
                            Didn't receive the code? 
                            {resendTimer > 0 ? (
                                <span> Resend in {formatTime(resendTimer)}</span>
                            ) : (
                                <button className="resend-btn" onClick={handleSendOTP} disabled={loading}>Resend OTP</button>
                            )}
                        </div>

                        <button className="resend-btn" style={{ display: 'block', margin: '30px auto 0' }} onClick={() => setStep(1)}>
                            Change Email
                        </button>
                    </div>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                    <div className="step-content">
                        <h1>Set New Password</h1>
                        <p className="login-subtitle">Choose a strong password for your account.</p>

                        {successMsg && (
                            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiCheckCircle /> {successMsg}
                            </div>
                        )}
                        
                        <form className="login-form" onSubmit={handleResetPassword}>
                            <label className="login-field">
                                <span className="login-label">New Password</span>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 chars, 1 letter, 1 number"
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </label>

                            {newPassword && (
                                <>
                                    <div className="strength-meter">
                                        <div className={`strength-bar ${strength.class}`}></div>
                                    </div>
                                    <div className={`strength-text ${strength.class}`}>{strength.text} Password</div>
                                </>
                            )}

                            <label className="login-field">
                                <span className="login-label">Confirm Password</span>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Repeat your new password"
                                        className="form-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </label>

                            {error && <div className="field-error-msg" style={{ marginTop: '10px' }}>{error}</div>}

                            <button type="submit" className="btn primary login-btn-full" disabled={loading} style={{ marginTop: '32px' }}>
                                {loading ? 'Updating Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
