import React from 'react';
import { Download, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import './Inventory.css';

function Inventory() {
    const products = useProductStore((state) => state.products);
    const deleteProduct = useProductStore((state) => state.deleteProduct);
    const navigate = useNavigate();

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    return (
        <div className="admin-inventory-page">
            <div className="content-header flex-between mb-4">
                <div>
                    <h1 className="admin-page-title">Inventory Management</h1>
                    <p className="admin-page-subtitle">Manage products, pricing, and stock levels.</p>
                </div>
                <button 
                    className="btn primary flex-icon"
                    onClick={() => navigate('/admin/inventory/new')}
                >
                    <span>➕</span> Add Product
                </button>
            </div>

            <div className="admin-panel full-width">
                {/* Toolbar */}
                <div className="admin-toolbar">
                    <div className="toolbar-left">
                        <select className="admin-select" aria-label="Filter by Category">
                            <option value="all">All Categories</option>
                            <option value="clothing">Clothing</option>
                            <option value="figures">Figures</option>
                            <option value="accessories">Accessories</option>
                        </select>
                        <select className="admin-select" aria-label="Filter by Status">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className="toolbar-right">
                        <button className="btn text small flex-icon"><Download size={16}/> Export</button>
                        <select className="admin-select small" aria-label="Sort Order">
                            <option value="newest">Newest First</option>
                            <option value="stock_low">Stock: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table className="admin-table advanced-table table-fixed">
                        <thead>
                            <tr>
                                <th width="40"><input type="checkbox" /></th>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Reviews</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((product) => {
                                const inStockLabel = product.inStock ? `${Math.floor(Math.random() * 50) + 1} in stock` : 'Out of stock';
                                const stockClass = product.inStock ? 'in-stock' : 'out-stock';
                                const imageSrc = product.image || product.images?.[0] || 'https://via.placeholder.com/50';

                                return (
                                    <tr key={product.id}>
                                        <td><input type="checkbox" /></td>
                                        <td>
                                            <div className="table-product-card">
                                                <div className="tp-img">
                                                    <img src={imageSrc} alt={product.name} />
                                                </div>
                                                <div className="tp-info">
                                                    <strong>{product.name}</strong>
                                                    <span style={{textTransform: 'capitalize'}}>{product.category.replace('-', ' ')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="mono">SKU-{product.id}</td>
                                        <td className="price fw-600">₹{product.price.toFixed(2)}</td>
                                        <td><span className={`stock-badge ${stockClass}`}>{inStockLabel}</span></td>
                                        <td>{Math.floor(Math.random() * 200)}</td>
                                        <td><span className="status-pill status-active">Active</span></td>
                                        <td className="text-right flex-end">
                                            <div className="action-menu">
                                                <button 
                                                    className="icon-btn-small" 
                                                    onClick={() => navigate(`/admin/inventory/edit/${product.id}`)}
                                                >
                                                    <Edit2 size={16}/>
                                                </button>
                                                <button 
                                                    className="icon-btn-small delete-btn" 
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>No products in inventory</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="admin-pagination">
                    <span className="pagination-info">Showing 1 to {products.length} of {products.length} products</span>
                    <div className="pagination-controls">
                        <button disabled>Previous</button>
                        <div className="page-numbers">
                            <button className="active">1</button>
                        </div>
                        <button disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Inventory;
