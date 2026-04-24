import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaShieldAlt, FaUndo, FaLock, FaBolt } from 'react-icons/fa';
import useCartStore from '../../store/cartStore';
import useProductStore from '../../store/productStore';
import useWishlistStore from '../../store/wishlistStore';
import { useToast } from '../../components/ui/Toast';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProductById, products, fetchProducts, fetchCategories, categories, loading } = useProductStore();
    const product = getProductById(id);
    const addItem = useCartStore((s) => s.addItem);
    const toggleWishlist = useWishlistStore((s) => s.toggleItem);
    const isWishlisted = useWishlistStore((s) => s.isWishlisted(id));
    const { addToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    // Find the category object to check settings
    const currentCategory = categories.find(c => c.slug === product?.category || c._id === product?.category);
    const sizeLabel = currentCategory?.hasSizeOption ? 'Select Size' : 'Select Option';

    // Ensure we fetch products and categories if the user navigated directly to the URL
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

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
            addItem(product, product.sizes ? product.sizes[selectedSize] : 'Standard');
        }
        addToast(`${product.name} added to cart!`, 'success');
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        for (let i = 0; i < quantity; i++) {
            addItem(product, product.sizes ? product.sizes[selectedSize] : 'Standard');
        }
        navigate('/cart');
    };

    return (
        <main className="product-details-container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link to="/home">Home</Link> &gt;
                <Link to="/products">Shop</Link> &gt;
                <span>{product.name}</span>
            </nav>

            {/* Product Layout */}
            <div className="product-layout">
                {/* Left: Gallery */}
                <div className="product-gallery">
                    <div className="main-image">
                        <img
                            src={(product.images && product.images[selectedImage]) ? product.images[selectedImage] : (product.image || "/assets/placeholder.png")}
                            alt={product.name}
                        />
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
                <div className="product-info">
                    <div className="product-meta">
                        <span className="category-tag">{product.category}</span>
                        <span className="separator">•</span>
                        <div className="rating">
                            ★★★★★ ({product.reviews} reviews)
                        </div>
                    </div>

                    <h1>{product.name}</h1>
                    <div className="price">₹{product.price.toLocaleString()}</div>

                    <p className="description">
                        {product.description}
                    </p>

                    {/* Variant Selector */}
                    {product.sizes && (
                        <div className="variant-selector">
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
                    <div className="stock-status">
                        <span className="stock-dot"></span> In Stock and ready to ship
                    </div>

                    {/* Actions */}
                    <form onSubmit={handleAdd} className="pro-actions">
                        <div className="qty-input-group">
                            <button type="button" className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <span className="qty-value">{quantity}</span>
                            <button type="button" className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                        <button type="submit" className="btn secondary add-to-cart-btn">
                            <FaShoppingCart style={{ marginRight: '8px' }} />
                            Add to Cart
                        </button>
                        <button
                            type="button"
                            className="btn primary buy-now-btn"
                            onClick={handleBuyNow}
                        >
                            <FaBolt style={{ marginRight: '8px' }} />
                            Buy Now
                        </button>
                        <button
                            type="button"
                            className={`btn ghost icon-btn wishlist-toggle-btn ${isWishlisted ? 'wishlisted' : ''}`}
                            onClick={() => toggleWishlist(product)}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                        </button>
                    </form>

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
                        <span className="big-star">★</span>
                        <span className="rating-num">{product.rating}</span>
                        <span className="review-count">({product.reviews} ratings)</span>
                    </div>
                </div>

                <div className="reviews-list">
                    {product.reviewsList ? (
                        product.reviewsList.map((review, idx) => (
                            <div className="review-card" key={idx}>
                                <div className="review-top">
                                    <div className="review-user-avatar">{review.user.charAt(0)}</div>
                                    <div className="review-meta">
                                        <div className="review-user">{review.user}</div>
                                        <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                    </div>
                                    <div className="review-date">{review.date}</div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="review-card empty-reviews">
                            <p>Be the first to leave a review for <strong>{product.name}</strong>!</p>
                            <Link to={`/add-review/${product.id}`} className="btn primary" style={{ marginTop: '12px', display: 'inline-flex' }}>Write a Review</Link>
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
