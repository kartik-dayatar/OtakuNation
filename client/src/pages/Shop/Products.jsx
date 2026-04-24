import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useProductStore from '../../store/productStore';
import ShopSidebar from '../../components/Shop/ShopSidebar';
import CategoryBar from '../../components/Shop/CategoryBar';
import ProductCard from '../../components/Shop/ProductCard';
import { staggerContainer, fadeInUp } from '../../utils/motionVariants';
import './Products.css';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [selectedSubFilters, setSelectedSubFilters] = useState([]); // Renamed from sidebarCategories
    const [activeAnime, setActiveAnime] = useState([]);
    const [sortBy, setSortBy] = useState('trending');
    const { products, fetchProducts, fetchCategories, fetchAnimeSeries, loading, categories, animeSeries } = useProductStore();

    const maxProductPrice = useMemo(() => {
        if (products.length === 0) return 20000;
        return Math.max(...products.map(p => p.price));
    }, [products]);

    const [priceRange, setPriceRange] = useState(20000);

    // Update priceRange if products are loaded and it's still at default
    useEffect(() => {
        if (products.length > 0 && priceRange === 20000) {
            setPriceRange(maxProductPrice);
        }
    }, [products, maxProductPrice]);

    // Fetch products, categories and anime series on mount 
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchAnimeSeries();
    }, [fetchProducts, fetchCategories, fetchAnimeSeries]);

    // Handle Category Filter (Top Navbar)
    const toggleCategory = (cat) => {
        setActiveCategory(cat);
        // Reset sub-filters when changing main category
        setSelectedSubFilters([]);
    };

    // Handle Sidebar Sub-Category Toggle
    const toggleSidebarCategory = (subCat) => {
        if (selectedSubFilters.includes(subCat)) {
            setSelectedSubFilters(selectedSubFilters.filter(c => c !== subCat));
        } else {
            setSelectedSubFilters([...selectedSubFilters, subCat]);
        }
    };

    const toggleAnime = (anime) => {
        if (activeAnime.includes(anime)) {
            setActiveAnime(activeAnime.filter(a => a !== anime));
        } else {
            setActiveAnime([...activeAnime, anime]);
        }
    };

    // Reset Filters
    const resetFilters = () => {
        // Don't reset activeCategory if it's set via URL, mostly just reset the refining filters
        setSelectedSubFilters([]);
        setActiveAnime([]);
        setPriceRange(20000);
    };



    const filteredProducts = useMemo(() => {
        const result = products.filter(p => {
            // 1. Category logic
            if (activeCategory && activeCategory !== 'all') {
                // A. Specific Category Mode (e.g., "Apparel")
                if (p.category.toLowerCase() !== activeCategory.toLowerCase()) return false;

                // Sub-Category Refinement
                if (selectedSubFilters.length > 0) {
                    // Safety check for subCategory existence
                    if (!p.subCategory || !selectedSubFilters.includes(p.subCategory)) {
                        return false;
                    }
                }
            } else {
                // B. "All" Mode
                // Sidebar filters act as Main Category selectors here (e.g., check "Apparel", "Figures")
                if (selectedSubFilters.length > 0) {
                    // Check if product's category matches any of the selected sidebar categories
                    // Compare case-insensitive to be safe
                    const pCat = p.category.toLowerCase();
                    const isMatch = selectedSubFilters.some(f => f.toLowerCase() === pCat);
                    if (!isMatch) return false;
                }
            }

            // 3. Anime Filter
            if (activeAnime.length > 0) {
                if (!p.animeSeries || !activeAnime.includes(p.animeSeries)) {
                    return false;
                }
            }

            // 4. Price Filter
            if (p.price > priceRange) return false;

            return true;
        });

        return result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'newest') return b.id - a.id;
            return b.reviews - a.reviews;
        });
    }, [activeCategory, activeAnime, priceRange, sortBy, selectedSubFilters]);

    let pageTitle = "All Products";
    let pageSubtitle = "Explore our premium collection.";
    if (activeCategory !== 'all') {
        pageTitle = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
        pageSubtitle = `Curated ${activeCategory} for true fans.`;
    }



    // Sync state with URL params
    useEffect(() => {
        const category = searchParams.get('category') || 'all';
        const anime = searchParams.get('anime') || 'all';

        setActiveCategory(category);
        if (anime !== 'all') {
            setActiveAnime([anime]);
        } else {
            setActiveAnime([]);
        }

        setSelectedSubFilters([]); // Clear sub-filters on URL change

        // Trigger fetch with full param set
        fetchProducts({ category, anime });
    }, [searchParams, fetchProducts]);

    return (
        <main className="shop-container">
            {/* Category Sub-Navbar */}
            <CategoryBar />

            <div className="shop-layout">
                {/* Sidebar Filters */}
                <ShopSidebar
                    activeCategory={activeCategory}
                    activeAnime={activeAnime}
                    priceRange={priceRange}
                    maxPrice={maxProductPrice}
                    toggleCategory={toggleCategory}
                    toggleAnime={toggleAnime}
                    setPriceRange={setPriceRange}
                    resetFilters={resetFilters}
                    sidebarCategories={selectedSubFilters}
                    toggleSidebarCategory={toggleSidebarCategory}
                />

                {/* Product Grid */}
                <section className="product-grid-section">
                    <div className="shop-header">
                        <h2 className="shop-title">
                            {activeCategory === 'all' ? 'All Products' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
                            <span className="product-count">({filteredProducts.length} items)</span>
                        </h2>

                        <div className="sort-container">
                            <span className="sort-label">Sort by:</span>
                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="trending">Trending</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', width: '100%' }}>
                            <h3>Loading magical artifacts...</h3>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="products-grid">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id || product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    style={{ overflow: 'visible' }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>No products found based on your filters.</p>
                            <button onClick={resetFilters} className="clear-filters-btn">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
