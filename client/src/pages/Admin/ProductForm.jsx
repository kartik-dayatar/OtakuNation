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
        image: '',
        badge: '',
        inStock: true
    });

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
                    image: product.image || (product.images ? product.images[0] : ''),
                    badge: product.badge || '',
                    inStock: product.inStock !== false
                });
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.price || !formData.category) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        };

        if (isEdit) {
            updateProduct(id, productData);
            addToast('Product updated successfully!', 'success');
        } else {
            addProduct(productData);
            addToast('Product added successfully!', 'success');
        }

        navigate('/admin/inventory');
    };

    return (
        <div className="product-form-container">
            <h1 style={{ marginBottom: '20px', color: '#111827' }}>
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="admin-product-form">
                <div className="form-group full-width">
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

                <div className="form-row">
                    <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="apparel">Apparel</option>
                            <option value="figures">Figures</option>
                            <option value="manga">Manga</option>
                            <option value="accessories">Accessories</option>
                            <option value="footwear">Footwear</option>
                            <option value="home-decor">Home Decor</option>
                            <option value="ukiyo-district">Ukiyo District</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Sub Category</label>
                        <input
                            type="text"
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleChange}
                            placeholder="e.g. Premium PVC"
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
                    <label>Image URL</label>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                        <div className="image-preview" style={{ marginTop: '10px' }}>
                            <img src={formData.image} alt="Preview" style={{ width: '100px', borderRadius: '8px' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Invalid+Image' }} />
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
