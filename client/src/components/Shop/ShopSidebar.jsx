import { Tag, User, Filter, RotateCcw, Shirt, Box, Book, Watch, Footprints, Home, Brush } from 'lucide-react';
import './ShopSidebar.css';

// Sub-Category Mapping
const subCategoryData = {
    apparel: [
        'Oversized Tees', 'Kanji Chest Tees', 'Hoodies',
        'Sweatshirts', 'Jackets', 'Long Sleeves'
    ],
    figures: [
        'Premium PVC', 'Resin Statues', 'Nendoroids',
        '1/6 Scale', 'Busts'
    ],
    manga: [
        'Box Sets', 'Hardcovers', 'Artbooks',
        'Light Novels', 'Collector Editions'
    ],
    accessories: [
        'Caps', 'Pendants', 'Bracelets',
        'Keychains', 'Tote Bags', 'Pins'
    ],
    footwear: [
        'Sneakers', 'Slip-ons', 'High-tops',
        'Slides', 'Socks'
    ],
    'home-decor': [
        'Art Prints', 'Canvas Art', 'Neon Signs',
        'Wall Flags', 'Desk Mats', 'Rugs', 'Blankets'
    ],
    'ukiyo-district': [
        'Ukiyo-e Prints', 'Samurai Art', 'Folklore Art',
        'Wall Scrolls', 'Calligraphy', 'Haori'
    ]
};

// Icon Mapping
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
    // toggleCategory, // Not needed for sub-filters
    toggleAnime,
    setPriceRange,
    resetFilters,
    sidebarCategories, // Now represents selected SUB-FILTERS
    toggleSidebarCategory // Toggles sub-filters
}) => {
    // Determine what to show in the first section
    const isMainCategorySelected = activeCategory && activeCategory !== 'all';

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
                        subCategoryData[activeCategory]?.map(subCat => (
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
                        ['apparel', 'figures', 'manga', 'accessories', 'footwear', 'home-decor', 'ukiyo-district'].map(cat => (
                            <li className="sidebar-item" key={cat}>
                                <label className={`sidebar-label ${sidebarCategories.includes(cat) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={sidebarCategories.includes(cat)}
                                        onChange={() => toggleSidebarCategory(cat)}
                                        className="sidebar-checkbox"
                                    />
                                    <span className="label-text">{cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}</span>
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
                    {['naruto', 'one-piece', 'demon-slayer', 'jujutsu-kaisen'].map(anime => (
                        <li className="sidebar-item" key={anime}>
                            <label className={`sidebar-label ${activeAnime.includes(anime) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={activeAnime.includes(anime)}
                                    onChange={() => toggleAnime(anime)}
                                    className="sidebar-checkbox"
                                />
                                <span className="label-text">
                                    {anime.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                        max="20000"
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="price-slider"
                        style={{
                            background: `linear-gradient(to right, #9333ea ${(priceRange / 20000) * 100}%, #e2e8f0 ${(priceRange / 20000) * 100}%)`
                        }}
                    />
                    <div className="price-labels">
                        <span>₹0</span>
                        <span>₹20,000+</span>
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
