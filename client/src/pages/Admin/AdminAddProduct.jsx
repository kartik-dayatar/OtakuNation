import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import { useToast } from '../../components/ui/Toast';
import './AdminAddProduct.css';

function AdminAddProduct() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const addProduct = useProductStore((state) => state.addProduct);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tags, setTags] = useState(['anime', 'new arrival']);
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDesc: '',
        animeSeries: '',
        brand: '',
        category: '',
        subCategory: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        sku: '',
        stock: '',
        lowStockThreshold: '5',
        weight: '',
        dimensions: '',
        sizes: '',
        colors: '',
        material: '',
        image: '',
        status: 'draft',
        featured: false,
        newArrival: true,
        bestSeller: false,
        metaTitle: '',
        metaDesc: '',
        slug: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Auto-generate slug
        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
            }));
        }

        // Auto-preview image if URL
        if(name === 'image') {
            setImagePreview(value);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const removeImage = () => {
        setImagePreview('');
        setFormData(prev => ({...prev, image: ''}));
    };

    const handleSubmit = (e, actionType) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.animeSeries || !formData.category || !formData.price || !formData.sku || !formData.stock) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        setIsSubmitting(true);

        const productData = {
            id: formData.sku, // using SKU as ID for mock
            name: formData.name,
            price: parseFloat(formData.price),
            originalPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
            category: formData.category,
            image: formData.image || imagePreview,
            inStock: parseInt(formData.stock) > 0,
            status: actionType === 'publish' ? 'Active' : 'Draft'
        };

        setTimeout(() => {
            addProduct(productData);
            setIsSubmitting(false);
            addToast(`Product ${actionType === 'publish' ? 'published' : 'saved as draft'} successfully!`, 'success');
            navigate('/admin/inventory');
        }, 600);
    };

    return (
        <div className="admin-add-product-page">
            <div className="admin-page-header flex-between mb-4">
                <div>
                    <h1 className="admin-page-title">Add New Product</h1>
                    <p className="admin-page-subtitle">Fill in the details below to add a new product to your store.</p>
                </div>
                <button type="button" className="btn ghost" onClick={() => navigate('/admin/inventory')}>
                    ← Back to Products
                </button>
            </div>

            <form id="add-product-form" className="form-grid">
                
                {/* ═══════════ LEFT COLUMN ═══════════ */}
                <div className="form-left">
                    
                    {/* Basic Information */}
                    <div className="form-section">
                        <h2 className="form-section-title">📝 Basic Information</h2>

                        <div className="form-group">
                            <label className="form-label">Product Name <span className="required">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Gojo Satoru Premium Figure" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description <span className="required">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" placeholder="Write a detailed description of the product..." required></textarea>
                            <p className="form-hint">Include key features, materials, and dimensions.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Short Description <span className="optional">(optional)</span></label>
                            <input type="text" name="shortDesc" value={formData.shortDesc} onChange={handleChange} className="form-input" placeholder="Brief summary for product cards (max 150 chars)" maxLength="150" />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Anime Series <span className="required">*</span></label>
                                <input type="text" name="animeSeries" value={formData.animeSeries} onChange={handleChange} className="form-input" placeholder="e.g. Jujutsu Kaisen" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Brand / Manufacturer <span className="optional">(optional)</span></label>
                                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="form-input" placeholder="e.g. Bandai, Good Smile" />
                            </div>
                        </div>
                    </div>

                    {/* Category & Classification */}
                    <div className="form-section">
                        <h2 className="form-section-title">📂 Category & Classification</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category <span className="required">*</span></label>
                                <select name="category" value={formData.category} onChange={handleChange} className="form-select" required>
                                    <option value="" disabled>Select a category</option>
                                    <option value="clothing">👕 Clothing</option>
                                    <option value="figures">⚡ Figures</option>
                                    <option value="accessories">🎒 Accessories</option>
                                    <option value="posters">🖼️ Posters</option>
                                    <option value="collectibles">⭐ Collectibles</option>
                                    <option value="manga">📓 Manga</option>
                                    <option value="plushies">🧸 Plushies</option>
                                    <option value="stationery">✏️ Stationery</option>
                                    <option value="home_decor">🏠 Home & Décor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sub-category <span className="optional">(optional)</span></label>
                                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} className="form-input" placeholder="e.g. Hoodies, Action Figures" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tags <span className="optional">(optional)</span></label>
                            <div className="tags-container">
                                {tags.map(tag => (
                                    <span key={tag} className="tag-chip">
                                        {tag} <button type="button" onClick={() => removeTag(tag)}>×</button>
                                    </span>
                                ))}
                                <input 
                                    type="text" 
                                    className="tag-input" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Type and press Enter to add tags..." 
                                />
                            </div>
                            <p className="form-hint">Press Enter to add tags. Tags help customers discover products.</p>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="form-section">
                        <h2 className="form-section-title">💰 Pricing & Inventory</h2>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label className="form-label">Selling Price (₹) <span className="required">*</span></label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" placeholder="0.00" min="0" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Compare at Price (₹) <span className="optional">(optional)</span></label>
                                <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleChange} className="form-input" placeholder="0.00" min="0" step="0.01" />
                                <p className="form-hint">Original price for showing discounts.</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost Price (₹) <span className="optional">(optional)</span></label>
                                <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="form-input" placeholder="0.00" min="0" step="0.01" />
                            </div>
                        </div>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label className="form-label">SKU <span className="required">*</span></label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-input" placeholder="e.g. FIG-JJK-001" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock Quantity <span className="required">*</span></label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-input" placeholder="0" min="0" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Low Stock Alert At</label>
                                <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="form-input" placeholder="5" min="0" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Weight (grams) <span className="optional">(optional)</span></label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" placeholder="e.g. 500" min="0" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dimensions (L × W × H cm) <span className="optional">(optional)</span></label>
                                <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="form-input" placeholder="e.g. 30 × 15 × 20" />
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="form-section">
                        <h2 className="form-section-title">🎨 Variants</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Available Sizes <span className="optional">(optional)</span></label>
                                <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} className="form-input" placeholder="e.g. S, M, L, XL, XXL" />
                                <p className="form-hint">Comma-separated. Leave blank if not applicable.</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Available Colors <span className="optional">(optional)</span></label>
                                <input type="text" name="colors" value={formData.colors} onChange={handleChange} className="form-input" placeholder="e.g. Black, White, Navy" />
                                <p className="form-hint">Comma-separated.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Material <span className="optional">(optional)</span></label>
                            <input type="text" name="material" value={formData.material} onChange={handleChange} className="form-input" placeholder="e.g. 100% Cotton, PVC, Polyester Blend" />
                        </div>
                    </div>

                </div>

                {/* ═══════════ RIGHT COLUMN ═══════════ */}
                <div className="form-right">

                    {/* Product Images */}
                    <div className="form-section">
                        <h2 className="form-section-title">🖼️ Product Images</h2>
                        
                        <div className="form-group">
                            <label className="form-label">Image URL</label>
                            <input 
                                type="url" 
                                name="image" 
                                value={formData.image} 
                                onChange={handleChange} 
                                className="form-input mb-3" 
                                placeholder="Paste image URL here..." 
                            />
                        </div>

                        {imagePreview ? (
                            <div className="image-preview-row">
                                <div className="image-preview-thumb w-full h-[200px] max-h-[200px]">
                                    <img src={imagePreview} alt="Preview" onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Invalid+URL'; }} />
                                    <button type="button" className="remove-img" onClick={removeImage}>×</button>
                                </div>
                            </div>
                        ) : (
                            <div className="image-upload-area">
                                <span className="upload-icon">📷</span>
                                <p className="upload-text">Paste a URL above</p>
                                <p className="upload-hint">Upload is mock-only in UI, paste URL to preview.</p>
                            </div>
                        )}
                        <p className="form-hint" style={{marginTop: '8px'}}>First image will be used as the main thumbnail.</p>
                    </div>

                    {/* Product Status */}
                    <div className="form-section">
                        <h2 className="form-section-title">⚙️ Status & Visibility</h2>

                        <div className="form-group">
                            <label className="form-label">Product Status <span className="required">*</span></label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-select" required>
                                <option value="active">Active — Live on store</option>
                                <option value="draft">Draft — Not visible</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Featured Product</h4>
                                <p>Show on homepage featured section.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>New Arrival</h4>
                                <p>Show in 'New Arrivals' section.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleChange} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Best Seller</h4>
                                <p>Mark as a best seller.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleChange} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="form-section">
                        <h2 className="form-section-title">🔍 SEO & Meta</h2>

                        <div className="form-group">
                            <label className="form-label">Meta Title <span className="optional">(optional)</span></label>
                            <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="form-input" placeholder="SEO title (auto-generated from product name if blank)" maxLength="70" />
                            <p className="form-hint">Recommended: 50-60 characters.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Meta Description <span className="optional">(optional)</span></label>
                            <textarea name="metaDesc" value={formData.metaDesc} onChange={handleChange} className="form-textarea" placeholder="Brief SEO description..." style={{minHeight: '80px'}} maxLength="160"></textarea>
                            <p className="form-hint">Recommended: 150-160 characters.</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL Slug <span className="optional">(optional)</span></label>
                            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input" placeholder="auto-generated-from-product-name" />
                        </div>
                    </div>

                </div>

            </form>
            
            {/* Action Buttons */}
            <div className="form-actions-footer">
                <button type="button" onClick={() => navigate('/admin/inventory')} className="btn secondary large" disabled={isSubmitting}>Cancel</button>
                <div style={{display: 'flex', gap: '12px'}}>
                    <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="btn ghost large" disabled={isSubmitting}>Save as Draft</button>
                    <button type="button" onClick={(e) => handleSubmit(e, 'publish')} className="btn primary large" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Product'}</button>
                </div>
            </div>
        </div>
    );
}

export default AdminAddProduct;
