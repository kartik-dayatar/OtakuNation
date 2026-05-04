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
    const [searchResults, setSearchResults] = useState(null);
    const searchTerm = searchParams.get('search');

    // Update priceRange if products are loaded and it's still at default
    useEffect(() => {
        if (products.length > 0 && priceRange === 20000) {
            setPriceRange(maxProductPrice);
        }
    }, [products, maxProductPrice]);

    // Fetch categories and anime series on mount 
    useEffect(() => {
        fetchCategories();
        fetchAnimeSeries();
    }, [fetchCategories, fetchAnimeSeries]);

    // Sync state with URL params
    useEffect(() => {
        const fetchItems = async () => {
            const category = searchParams.get('category') || 'all';
            const anime = searchParams.get('anime') || 'all';
            const search = searchParams.get('search');

            if (search) {
                // SEARCH MODE
                try {
                    const { data } = await axios.get(`http://localhost:5000/api/products/search?q=${search}`);
                    setSearchResults(data);
                    // Also clear other filters to avoid confusion
                    setActiveCategory('all');
                    setActiveAnime([]);
                } catch (err) {
                    console.error("Search error:", err);
                    setSearchResults([]);
                }
            } else {
                // NORMAL MODE
                setSearchResults(null);
                setActiveCategory(category);
                if (anime !== 'all') {
                    setActiveAnime([anime]);
                } else {
                    setActiveAnime([]);
                }
                fetchProducts({ category, anime });
            }
            setSelectedSubFilters([]); 
        };

        fetchItems();
    }, [searchParams, fetchProducts]);

    const displayProducts = searchResults || products;

    const filteredProducts = useMemo(() => {
        const result = displayProducts.filter(p => {
            // If in search mode, we don't apply category filters by default unless searchResults is null
            if (!searchResults) {
                // 1. Category logic
                if (activeCategory && activeCategory !== 'all') {
                    if (p.category.toLowerCase() !== activeCategory.toLowerCase()) return false;
                    if (selectedSubFilters.length > 0) {
                        if (!p.subCategory || !selectedSubFilters.includes(p.subCategory)) return false;
                    }
                } else if (selectedSubFilters.length > 0) {
                    const pCat = p.category.toLowerCase();
                    if (!selectedSubFilters.some(f => f.toLowerCase() === pCat)) return false;
                }
            }

            // 3. Anime Filter
            if (activeAnime.length > 0) {
                if (!p.animeSeries || !activeAnime.includes(p.animeSeries)) return false;
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
    }, [displayProducts, searchResults, activeCategory, activeAnime, priceRange, sortBy, selectedSubFilters]);

    const toggleCategory = (cat) => {
        setActiveCategory(cat);
        setSelectedSubFilters([]);
    };

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

    const resetFilters = () => {
        setSelectedSubFilters([]);
        setActiveAnime([]);
        setPriceRange(20000);
        if (searchTerm) {
            setSearchParams({});
        }
    };

    return (
        <main className="shop-container">
            <CategoryBar />

            <div className="shop-layout">
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

                <section className="product-grid-section">
                    <div className="shop-header">
                        <div className="shop-title-group">
                            <h2 className="shop-title">
                                {searchTerm ? (
                                    <>Results for: <span className="search-term-highlight">"{searchTerm}"</span></>
                                ) : activeCategory === 'all' ? (
                                    'All Products'
                                ) : (
                                    `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`
                                )}
                                <span className="product-count">({filteredProducts.length} items)</span>
                            </h2>
                            {searchTerm && (
                                <button onClick={() => setSearchParams({})} className="clear-search-btn">
                                    Clear Search
                                </button>
                            )}
                        </div>

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
                        <div className="shop-loading">
                            <div className="loading-spinner"></div>
                            <h3>Fetching artifacts...</h3>
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
                        <div className="no-results-container">
                            <div className="no-results-icon">🔍</div>
                            <h3>No results found</h3>
                            <p>We couldn't find any products matching {searchTerm ? `"${searchTerm}"` : 'your filters'}.</p>
                            <button 
                                onClick={() => {
                                    setSearchParams({});
                                    resetFilters();
                                }} 
                                className="browse-all-btn"
                            >
                                Browse All Products
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
