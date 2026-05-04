import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const ReviewModal = ({ isOpen, onClose, productId, orderId, productName, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const token = useAuthStore((state) => state.token) || localStorage.getItem('on_token');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (body.length < 10) {
            setError('Review must be at least 10 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/reviews', {
                productId,
                orderId,
                rating,
                title,
                body
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSuccess(productId);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <button className="review-modal-close" onClick={onClose} aria-label="Close modal">
                    <FaTimes size={20} />
                </button>

                <h2 className="review-modal-title">Write a Review</h2>
                <p className="review-modal-subtitle">Share your thoughts on <strong>{productName}</strong></p>

                <form onSubmit={handleSubmit} className="review-modal-form">
                    <div className="rating-section">
                        <label>Overall Rating</label>
                        <div className="star-rating">
                            {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <FaStar
                                        key={i}
                                        className={`star ${ratingValue <= (hover || rating) ? 'active' : ''}`}
                                        size={32}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(null)}
                                        onClick={() => setRating(ratingValue)}
                                    />
                                );
                            })}
                        </div>
                        <span className="rating-text">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Great"}
                            {rating === 5 && "Excellent!"}
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rev-title">Review Title (Optional)</label>
                        <input
                            id="rev-title"
                            type="text"
                            placeholder="Example: Great quality, exactly as described"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rev-body">Review Description</label>
                        <textarea
                            id="rev-body"
                            placeholder="Share your experience with this product..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            required
                        ></textarea>
                        <div className="char-count">{body.length}/1000</div>
                    </div>

                    {error && <div className="modal-error-msg">{error}</div>}

                    <div className="modal-actions">
                        <button type="submit" className="btn primary full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button type="button" className="btn ghost full" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .review-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .review-modal-content {
                    background: #fff;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 16px;
                    padding: 32px;
                    position: relative;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: modalSlideUp 0.3s ease-out;
                }
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .review-modal-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .review-modal-close:hover { color: #374151; }
                .review-modal-title { margin-bottom: 8px; font-size: 24px; color: #111827; }
                .review-modal-subtitle { color: #6b7280; margin-bottom: 24px; font-size: 14px; }
                .review-modal-form .form-group { margin-bottom: 20px; }
                .review-modal-form label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #374151; }
                .review-modal-form input, .review-modal-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 15px;
                }
                .review-modal-form input:focus, .review-modal-form textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .star-rating { display: flex; gap: 8px; margin-bottom: 8px; }
                .star { cursor: pointer; color: #e5e7eb; transition: color 0.2s; }
                .star.active { color: #fbbf24; }
                .rating-text { font-size: 14px; font-weight: 500; color: #fbbf24; }
                .char-count { text-align: right; font-size: 12px; color: #9ca3af; margin-top: 4px; }
                .modal-error-msg { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; text-align: center; }
                .modal-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
                .btn.full { width: 100%; justify-content: center; height: 48px; }
            `}</style>
        </div>
    );
};

export default ReviewModal;
