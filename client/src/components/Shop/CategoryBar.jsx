import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CategoryBar.css';

const categories = [
    { id: 'all', label: 'All' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'figures', label: 'Figures' },
    { id: 'manga', label: 'Manga' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'footwear', label: 'Footwear' },
    { id: 'home-decor', label: 'Home Decor' },
    { id: 'ukiyo-district', label: 'Ukiyo District' }
];

const CategoryBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'all';

    const handleSelectCategory = (id) => {
        if (id === 'all') {
            navigate('/products');
        } else {
            navigate(`/products?category=${id}`);
        }
    };

    return (
        <div className="category-bar-container">
            <div className="category-bar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => handleSelectCategory(cat.id)}
                    >
                        {cat.label}
                        {activeCategory === cat.id && (
                            <div className="active-indicator" layoutId="underline" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
