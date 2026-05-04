import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaShieldAlt, FaUndo, FaLock, FaBolt } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';
import useProductStore from '../../store/productStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { useToast } from '../../components/ui/Toast';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchProductById, getProductById, products, fetchProducts, fetchCategories, categories, loading } = useProductStore();
    const product = getProductById(id);
    const addItem = useCartStore((s) => s.addItem);
    const toggleWishlist = useWishlistStore((s) => s.toggleItem);
    const isWishlisted = useWishlistStore((s) => s.isWishlisted(id));
    const { token } = useAuthStore();
    const { addToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviewsData, setReviewsData] = useState({ reviews: [], count: 0, avgRating: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(false);
    // Find the category object to check settings
    const currentCategory = categories.find(c => c.slug === product?.category || c._id === product?.category);
    const sizeLabel = currentCategory?.hasSizeOption ? 'Select Size' : 'Select Option';

    // Ensure we fetch product details, categories if the user navigated directly to the URL
    useEffect(() => {
        if (id) {
            fetchProductById(id);
        }
        fetchCategories();
    }, [id, fetchProductById, fetchCategories]);

    useEffect(() => {
        if (!id) return;
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const { data } = await axios.get(`http://localhost:5000/api/reviews/product/${id}`);
                setReviewsData(data);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [id]);

    if (loading && !product) {
        return <div className="product-details-container" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Loading product details...</h2>
        </div>;
    }

    if (!product) {
        return <div className="product-details-container" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Product not found</h2>
            <Link to="/products" className="btn primary" style={{ marginTop: '20px' }}>Back to Shop</Link>
        </div>;
    }

    const handleAdd = (e) => {
        e.preventDefault();
        for (let i = 0; i < quantity; i++) {
            addItem(product, product.sizes ? product.sizes[selectedSize] : 'Standard', token);
        }
        addToast(`${product.name} added to cart!`, 'success');
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        for (let i = 0; i < quantity; i++) {
            addItem(product, product.sizes ? product.sizes[selectedSize] : 'Standard', token);
        }
        navigate('/cart');
    };

    return (
        <main className="product-details-container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link to="/home">Home</Link> <span className="bc-sep">›</span>
                <Link to="/products">Shop</Link> <span className="bc-sep">›</span>
                <span className="current-page">{product.name}</span>
            </nav>

            {/* Product Layout */}
            <div className="product-layout">
                {/* Left: Gallery */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        <div className="main-image">
                            <img
                                src={(product.images && product.images[selectedImage]) ? product.images[selectedImage] : (product.image || "/assets/placeholder.png")}
                                alt={product.name}
                            />
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className="thumbnail-list">
                        {product.images && product.images.map((img, i) => (
                            <div
                                key={i}
                                className={`thumbnail ${selectedImage === i ? 'active' : ''}`}
                                onClick={() => setSelectedImage(i)}
                            >
                                <img src={img} alt={`Thumb ${i}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="product-info-panel">
                    <div className="product-header">
                        <span className="category-badge">{product.category}</span>
                        <h1>{product.name}</h1>
                        <div className="rating-row">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.round(product.ratingAvg || 0) ? 'star filled' : 'star'}>★</span>
                                ))}
                            </div>
                            <span className="review-link">({product.reviewCount || 0} reviews)</span>
                        </div>
                    </div>

                    <div className="price-tag">₹{product.price.toLocaleString()}</div>

                    <div className="product-description-container">
                        <p className="description">
                            {product.description}
                        </p>
                    </div>

                    {/* Variant Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="variant-section">
                            <span className="variant-label">{sizeLabel}</span>
                            <div className="size-options">
                                {product.sizes.map((size, i) => (
                                    <button
                                        type="button"
                                        key={size}
                                        className={`size-btn ${selectedSize === i ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(i)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Status */}
                    <div className="availability">
                        <span className="stock-dot"></span> 
                        <span className="stock-text">In Stock and ready to ship</span>
                    </div>

                    {/* Actions */}
                    <div className="purchase-actions">
                        <div className="qty-picker">
                            <button type="button" className="qty-op" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <span className="qty-num">{quantity}</span>
                            <button type="button" className="qty-op" onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        
                        <div className="cta-buttons">
                            <button onClick={handleBuyNow} type="button" className="btn-buy-now">
                                Buy Now
                            </button>
                            <button onClick={handleAdd} type="button" className="btn-add-to-cart">
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                className={`wishlist-heart ${isWishlisted ? 'is-active' : ''}`}
                                onClick={() => toggleWishlist(product)}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="trust-badges">
                        <div className="trust-item">
                            <FaShieldAlt className="trust-icon" />
                            <span>Official Merchandise</span>
                        </div>
                        <div className="trust-item">
                            <FaUndo className="trust-icon" />
                            <span>30-Day Returns</span>
                        </div>
                        <div className="trust-item">
                            <FaLock className="trust-icon" />
                            <span>Secure Checkout</span>
                        </div>
                        <div className="trust-item">
                            <FaBolt className="trust-icon" />
                            <span>Fast Shipping</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specifications Section */}
            {product.specifications && (
                <section className="specs-section">
                    <h2>Product Specifications</h2>
                    <div className="specs-grid">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div className="spec-item" key={key}>
                                <span className="spec-label">{key}</span>
                                <span className="spec-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews Section */}
            <section className="reviews-section">
                <div className="reviews-header">
                    <h2>Customer Reviews</h2>
                    <div className="overall-rating">
                        <div className="rating-summary">
                            <span className="rating-num">{product.ratingAvg?.toFixed(1) || '0.0'}</span>
                            <div className="summary-stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.round(product.ratingAvg || 0) ? 'star filled' : 'star'}>★</span>
                                ))}
                            </div>
                            <span className="review-count">Based on {product.reviewCount || 0} reviews</span>
                        </div>
                    </div>
                </div>

                <div className="reviews-list">
                    {reviewsLoading ? (
                        <div className="reviews-loading">Loading reviews...</div>
                    ) : reviewsData.reviews.length > 0 ? (
                        reviewsData.reviews.map((review, idx) => (
                            <div className="review-card" key={idx}>
                                <div className="review-top">
                                    <div className="review-user-avatar">
                                        {(review.user?.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div className="review-meta">
                                        <div className="review-user">
                                            {review.user?.firstName} {review.user?.lastName?.[0]}.
                                            {review.verifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                                        </div>
                                        <div className="review-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </div>
                                </div>
                                {review.title && <h4 className="review-title">{review.title}</h4>}
                                <p className="review-comment">{review.body}</p>
                            </div>
                        ))
                    ) : (
                        <div className="review-card empty-reviews">
                            <p>No reviews yet. Be the first to review!</p>
                            <p className="empty-sub">Purchased this item? You can leave a review from your order tracking page.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Related Products Carousel */}
            <section className="related-products">
                <div className="related-header">
                    <h2>You may also like</h2>
                </div>
                <div className="shop-carousel-container">
                    <div className="shop-carousel">
                        {(() => {
                            const related = products.filter(p => p.category === product.category && p.id !== product.id);
                            const others = products.filter(p => p.category !== product.category);
                            const displayList = [...related, ...others].slice(0, 8);

                            return displayList.map(p => (
                                <Link to={`/product/${p._id || p.id}`} key={p._id || p.id} className="carousel-card">
                                    <div className="carousel-image">
                                        <img src={p.image} alt={p.name} />
                                    </div>
                                    <div className="carousel-info">
                                        <h4>{p.name}</h4>
                                        <p>₹{p.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ));
                        })()}
                    </div>
                </div>
            </section>
        </main>
    );
}
