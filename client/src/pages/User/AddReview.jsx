import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import useProductStore from '../../store/productStore';
import useAuthStore from '../../store/authStore';
import './AddReview.css';

export default function AddReview() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    const product = useProductStore((state) => state.getProductById(productId));
    const addReview = useProductStore((state) => state.addReview);
    const user = useAuthStore((state) => state.user);

    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!product) {
        return (
            <div className="review-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Product Not Found</h2>
                <button onClick={() => navigate(-1)} className="btn primary" style={{ marginTop: '20px' }}>Go Back</button>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const review = {
            rating: rating,
            title: `Review for ${product.name}`,
            body: comment
        };

        addReview(productId, review);
        setSubmitted(true);

        // Redirect after 2 seconds
        setTimeout(() => {
            if (orderId) {
                navigate(`/order-tracking?orderId=${orderId}`);
            } else {
                navigate('/orders');
            }
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="review-success-overlay">
                <div className="review-success-card">
                    <div className="success-icon"><FaCheckCircle /></div>
                    <h2>Thank You!</h2>
                    <p>Your review for <strong>{product.name}</strong> has been submitted successfully.</p>
                    <p className="redirect-msg">Redirecting back to your order...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="review-container">
            <button onClick={() => navigate(-1)} className="review-back">
                <FaArrowLeft style={{ marginRight: '8px' }} /> Back
            </button>

            <div className="review-card-form">
                <div className="product-preview">
                    <img src={product.image} alt={product.name} className="product-img-small" />
                    <div className="product-text">
                        <span className="category-tag">{product.category}</span>
                        <h3>{product.name}</h3>
                    </div>
                </div>

                <div className="divider"></div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="rating-section">
                        <h4>How would you rate this product?</h4>
                        <div className="star-rating">
                            {[...Array(5)].map((star, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <label key={i}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={ratingValue}
                                            onClick={() => setRating(ratingValue)}
                                        />
                                        <FaStar
                                            className="star"
                                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                            size={40}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(null)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                        <span className="rating-label">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Great"}
                            {rating === 5 && "Excellent!"}
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comment">Write your review</label>
                        <textarea
                            id="comment"
                            className="review-textarea"
                            placeholder="What did you like or dislike? How was the quality? (Optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-review-btn">
                        Submit Review
                    </button>
                </form>
            </div>
        </main>
    );
}
