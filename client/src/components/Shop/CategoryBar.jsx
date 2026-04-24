import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CategoryBar.css';
import useProductStore from '../../store/productStore';

const CategoryBar = () => {
    const categoriesFromStore = useProductStore(state => state.categories);
    const loading = useProductStore(state => state.loadingCategories);
    
    // Add "All" category at the start
    const categories = [
        { slug: 'all', name: 'All' },
        ...categoriesFromStore
    ];
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
                        key={cat.slug}
                        className={`category-item ${activeCategory === cat.slug ? 'active' : ''}`}
                        onClick={() => handleSelectCategory(cat.slug)}
                    >
                        {cat.name}
                        {activeCategory === cat.slug && (
                            <div className="active-indicator" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;
