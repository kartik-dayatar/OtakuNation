import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import { useToast } from '../../components/ui/Toast';
import './ProductForm.css';

function ProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const getProductById = useProductStore((state) => state.getProductById);
    const addProduct = useProductStore((state) => state.addProduct);
    const updateProduct = useProductStore((state) => state.updateProduct);

    const [formData, setFormData] = useState({
        name: '',
        category: 'apparel',
        subCategory: '',
        price: '',
        originalPrice: '',
        description: '',
        badge: '',
        sku: '',
        stock: '',
        inStock: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (isEdit) {
            const product = getProductById(id);
            if (product) {
                setFormData({
                    name: product.name || '',
                    category: product.category || 'apparel',
                    subCategory: product.subCategory || '',
                    price: product.price || '',
                    originalPrice: product.originalPrice || '',
                    description: product.description || '',
                    badge: product.badge || '',
                    sku: product.sku || '',
                    stock: product.stockQuantity || product.stock || '',
                    inStock: product.inStock !== false
                });
                setImagePreview(product.image || '');
            } else {
                addToast('Product not found', 'error');
                navigate('/admin/inventory');
            }
        }
    }, [id, isEdit, getProductById, navigate, addToast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category || !formData.sku) {
            addToast('Please fill all required fields (Name, Price, Category, SKU)', 'error');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('subCategory', formData.subCategory);
        data.append('price', formData.price);
        data.append('originalPrice', formData.originalPrice);
        data.append('description', formData.description);
        data.append('badge', formData.badge);
        data.append('sku', formData.sku);
        data.append('stock', formData.stock);
        data.append('inStock', formData.inStock);
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await updateProduct(id, data);
                addToast('Product updated successfully!', 'success');
            } else {
                await addProduct(data);
                addToast('Product added successfully!', 'success');
            }
            navigate('/admin/inventory');
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to save product', 'error');
        }
    };

    return (
        <div className="product-form-container">
            <h1 style={{ marginBottom: '20px', color: '#111827' }}>
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="admin-product-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Gojo Satoru Figure"
                        />
                    </div>
                    <div className="form-group">
                        <label>SKU *</label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            placeholder="e.g. FIG-GJS-01"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="clothing">Clothing</option>
                            <option value="figures">Figures</option>
                            <option value="manga">Manga</option>
                            <option value="accessories">Accessories</option>
                            <option value="posters">Posters</option>
                            <option value="collectibles">Collectibles</option>
                            <option value="plushies">Plushies</option>
                            <option value="stationery">Stationery</option>
                            <option value="home_decor">Home & Décor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Price (₹) *</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Original Price (₹) (Optional - shows struck through)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Product Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {imagePreview && (
                        <div className="image-preview" style={{ marginTop: '10px' }}>
                            <img src={imagePreview} alt="Preview" style={{ width: '100px', borderRadius: '8px' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Invalid+Image' }} />
                        </div>
                    )}
                </div>

                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                    ></textarea>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Badge text (e.g. Best Seller, New)</label>
                        <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="inStock"
                                checked={formData.inStock}
                                onChange={handleChange}
                            />
                            Product is In Stock
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn ghost" onClick={() => navigate('/admin/inventory')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn primary">
                        {isEdit ? 'Save Changes' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductForm;
