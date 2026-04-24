import { Tag, User, Filter, RotateCcw, Shirt, Box, Book, Watch, Footprints, Home, Brush } from 'lucide-react';
import './ShopSidebar.css';

import useProductStore from '../../store/productStore';

// Icon Mapping (Keep as it matches slugs to icons)
const categoryIcons = {
    apparel: Shirt,
    figures: Box,
    manga: Book,
    accessories: Watch,
    footwear: Footprints,
    'home-decor': Home,
    'ukiyo-district': Brush
};

const ShopSidebar = ({
    activeCategory,
    activeAnime,
    priceRange,
    maxPrice = 20000,
    // toggleCategory, // Not needed for sub-filters
    toggleAnime,
    setPriceRange,
    resetFilters,
    sidebarCategories, // Now represents selected SUB-FILTERS
    toggleSidebarCategory // Toggles sub-filters
}) => {
    const categories = useProductStore(state => state.categories);
    const animeSeries = useProductStore(state => state.animeSeries);

    // Determine what to show in the first section
    const isMainCategorySelected = activeCategory && activeCategory !== 'all';
    const activeCategoryObj = categories.find(c => c.slug === activeCategory);

    // Get the icon component dynamically, default to Tag
    const SectionIcon = isMainCategorySelected ? (categoryIcons[activeCategory] || Tag) : Tag;
    const sectionTitle = isMainCategorySelected ? 'Collection Filters' : 'Categories';

    return (
        <aside className={`shop-sidebar ${activeCategory === 'ukiyo-district' ? 'ukiyo-border' : ''}`}>
            {/* Dynamic Filter Section */}
            <div className="sidebar-group">
                <div className="sidebar-title">
                    <SectionIcon size={18} className="sidebar-icon" />
                    <span>{sectionTitle}</span>
                </div>

                <ul className="sidebar-list">
                    {isMainCategorySelected ? (
                        // Context-Aware Sub-Filters
                        activeCategoryObj?.subCategories?.map(subCat => (
                            <li className="sidebar-item" key={subCat}>
                                <label className={`sidebar-label ${sidebarCategories.includes(subCat) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={sidebarCategories.includes(subCat)}
                                        onChange={() => toggleSidebarCategory(subCat)}
                                        className="sidebar-checkbox"
                                    />
                                    <span className="label-text">{subCat}</span>
                                </label>
                            </li>
                        )) || <li className="sidebar-message">No specific filters available.</li>
                    ) : (
                        // Default Categories (when 'All' is selected)
                        // Render checkboxes for main categories
                        categories.map(cat => (
                            <li className="sidebar-item" key={cat.slug}>
                                <label className={`sidebar-label ${sidebarCategories.includes(cat.slug) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={sidebarCategories.includes(cat.slug)}
                                        onChange={() => toggleSidebarCategory(cat.slug)}
                                        className="sidebar-checkbox"
                                    />
                                    <span className="label-text">{cat.name}</span>
                                </label>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Anime Series (Always Visible) */}
            <div className="sidebar-group">
                <div className="sidebar-title">
                    <User size={18} className="sidebar-icon" />
                    <span>Anime Series</span>
                </div>
                <ul className="sidebar-list">
                    {animeSeries.map(anime => (
                        <li className="sidebar-item" key={anime.slug}>
                            <label className={`sidebar-label ${activeAnime.includes(anime.slug) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={activeAnime.includes(anime.slug)}
                                    onChange={() => toggleAnime(anime.slug)}
                                    className="sidebar-checkbox"
                                />
                                <span className="label-text">
                                    {anime.name}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range Slider */}
            <div className="sidebar-group">
                <div className="sidebar-title">
                    <Filter size={18} className="sidebar-icon" />
                    <span>Max Price: ₹{priceRange.toLocaleString()}</span>
                </div>
                <div className="price-slider-container">
                    <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="price-slider"
                        style={{
                            background: `linear-gradient(to right, #9333ea ${(priceRange / maxPrice) * 100}%, #e2e8f0 ${(priceRange / maxPrice) * 100}%)`
                        }}
                    />
                    <div className="price-labels">
                        <span>₹0</span>
                        <span>₹{maxPrice.toLocaleString()}+</span>
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <button className="reset-btn" onClick={resetFilters}>
                <RotateCcw size={16} />
                <span>Reset Filters</span>
            </button>
        </aside>
    );
};

export default ShopSidebar;
