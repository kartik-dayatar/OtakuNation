import { FaGlobe, FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';
import narutoFloat from '../../assets/images/hero/naruto_float.png';
import './Contact.css';

export default function Contact() {
    return (
        <main className="contact-main">
            <section className="contact-hero">
                <div className="contact-heading">
                    <h1>CONTACT US</h1>
                    <p>Have questions or need support? Reach out to us!</p>
                </div>

                <div className="contact-shell">
                    <div className="contact-form-card">
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <label className="login-field">
                                <span className="login-label">Full Name</span>
                                <input type="text" name="fullName" placeholder="Your name" className="form-input" />
                            </label>

                            <label className="login-field">
                                <span className="login-label">Email</span>
                                <input type="email" name="email" placeholder="you@otakunation.com" className="form-input" />
                            </label>

                            <label className="login-field">
                                <span className="login-label">Message</span>
                                <textarea name="message" rows="4" placeholder="Tell us how we can help" className="form-input textarea"></textarea>
                            </label>

                            <button type="submit" className="btn primary contact-btn-full">Send message</button>
                        </form>
                    </div>

                    <div className="contact-info-side">
                        <div className="login-hero-images contact-hero-strip">
                            <div className="login-hero-image-slot" style={{ backgroundImage: `url(${narutoFloat})`, backgroundColor: '#f0f4ff' }}></div>
                        </div>

                        <div className="contact-details-card">
                            <h2>Get In Touch</h2>
                            <ul>
                                <li>
                                    <span className="contact-icon"><FaGlobe /></span>
                                    <span><strong>Website:</strong> <a href="#" className="contact-link">www.otakunation.com</a></span>
                                </li>
                                <li>
                                    <span className="contact-icon"><FaEnvelope /></span>
                                    <span><strong>Email:</strong> <a href="mailto:support@otakunation.com" className="contact-link">support@otakunation.com</a></span>
                                </li>
                                <li>
                                    <span className="contact-icon"><FaPhone /></span>
                                    <span><strong>Phone:</strong> +1 800 123 4567</span>
                                </li>
                                <li>
                                    <span className="contact-icon"><FaClock /></span>
                                    <span><strong>Hours:</strong> Mon–Fri: 9am – 6pm</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
