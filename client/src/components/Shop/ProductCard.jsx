import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import './ProductCard.css';

const gradients = [
    'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#2563eb 100%)', // Blue/Dark
    'linear-gradient(135deg,#1a0a2e 0%,#3b1d6e 50%,#7c3aed 100%)', // Purple
    'linear-gradient(135deg,#0c1220 0%,#1e293b 50%,#334155 100%)', // Dark Slate
    'linear-gradient(135deg,#ef4444,#b91c1c)', // Red
    'linear-gradient(135deg,#8b5cf6,#6d28d9)', // Violet
    'linear-gradient(135deg,#f97316,#dc2626)', // Orange/Red
    'linear-gradient(135deg,#0891b2,#22d3ee)', // Cyan
    'linear-gradient(135deg,#ec4899,#8b5cf6)', // Pink/Purple
    'linear-gradient(135deg,#f59e0b,#ea580c)', // Amber/Orange
    'linear-gradient(135deg,#10b981,#059669)', // Emerald
    'linear-gradient(135deg,#6366f1,#3b82f6)', // Indigo/Blue
    'linear-gradient(135deg,#f43f5e,#ec4899)'  // Rose/Pink
];

const getGradient = (id) => gradients[(id || 0) % gradients.length];

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const cartStore = useCartStore();
    const wishlistStore = useWishlistStore();
    
    const [isAdded, setIsAdded] = useState(false);

    const isWishlisted = useWishlistStore(s => 
        s.items.some(i => i._id === product._id || i.product === product._id));

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        if (isWishlisted) {
            wishlistStore.removeFromWishlist(product._id);
        } else {
            wishlistStore.addToWishlist(product._id);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        
        cartStore.addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image || product.images?.[0]?.url,
            quantity: 1
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
    };

    return (
        <Link to={`/product/${product._id || product.id}`} className="product-card-enhanced">
            <div className="product-image-container">
                {/* Gradient Background Replacement */}
                {product.image ? (
                    <img src={product.image} alt={product.name} className="product-card-img" loading="lazy" />
                ) : (
                    <div className="product-placeholder">
                        <span className="placeholder-icon"><Zap size={24} /></span>
                    </div>
                )} 

                {/* Floating Actions - Top Right Overlay */}
                <div className="product-card-actions">
                    <button 
                        className={`action-btn ${isWishlisted ? 'active' : ''}`} 
                        onClick={handleWishlist}
                        style={{ color: isWishlisted ? '#ef4444' : 'inherit' }}
                    >
                        <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
                    </button>
                    <button 
                        className={`action-btn ${isAdded ? 'success' : ''}`} 
                        onClick={handleAddToCart}
                        style={{ color: isAdded ? '#10b981' : 'inherit' }}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>

                {/* Badge */}
                {product.badge && (
                    <div className={`product-badge ${product.badge === 'Limited Edition' ? 'limited' : ''}`}>
                        {product.badge}
                    </div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-meta-row">
                    <span className="product-category">{product.categoryName || product.category}</span>
                    <span className="product-rating">★ {product.rating || 'New'}</span>
                </div>
                <div className="product-price-row">
                    <span className="product-price">₹{product.price.toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
