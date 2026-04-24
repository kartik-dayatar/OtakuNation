import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    CreditCard,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import './AdminOrderDetails.css';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrder, fetchOrderById, updateOrderStatus, loading, error } = useAdminStore();
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchOrderById(id);
    }, [id, fetchOrderById]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) return;
        
        setUpdatingStatus(true);
        try {
            await updateOrderStatus(id, newStatus);
            // Re-fetch to confirm sync
            await fetchOrderById(id);
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading && !currentOrder) {
        return (
            <div className="admin-loading-container">
                <div className="loader"></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-container">
                <AlertCircle size={48} color="#ef4444" />
                <h2>Error Loading Order</h2>
                <p>{error}</p>
                <button className="btn primary" onClick={() => navigate('/admin/orders')}>Back to Orders</button>
            </div>
        );
    }

    if (!currentOrder) return null;

    const { 
        orderNumber, 
        createdAt, 
        status, 
        paymentStatus, 
        paymentMethod, 
        totalAmount, 
        items, 
        shippingAddress, 
        user 
    } = currentOrder;

    const isPaid = paymentStatus === 'paid';
    const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const getStatusIcon = (s) => {
        switch (s) {
            case 'confirmed': return <Clock size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'out_for_delivery': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="admin-order-details-page">
            <div className="content-header mb-4">
                <Link to="/admin/orders" className="back-link">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>
                <div className="flex-between align-end mt-2">
                    <div>
                        <h1 className="admin-page-title">Order #{orderNumber}</h1>
                        <p className="admin-page-subtitle">Placed on {orderDate}</p>
                    </div>
                    <div className={`status-badge-lg ${status}`}>
                        {getStatusIcon(status)}
                        <span>{status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}</span>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                {/* Left Column: Order Summary & Items */}
                <div className="details-main">
                    <div className="admin-card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Items Ordered</h3>
                            <span className="item-count">{items.length} Items</span>
                        </div>
                        <div className="order-items-list">
                            {items.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                    <div className="item-img-wrapper">
                                        <img 
                                            src={item.productImage ? (item.productImage.startsWith('http') ? item.productImage : `/src/assets/images/products/${item.productImage}`) : '/assets/placeholder.png'} 
                                            alt={item.productName} 
                                        />
                                    </div>
                                    <div className="item-info">
                                        <h4>{item.productName || 'Product'}</h4>
                                        <p className="item-meta">SKU: {item.product?.substring(0, 8).toUpperCase() || 'N/A'}</p>
                                        {item.sizeLabel && <p className="item-meta">Size: {item.sizeLabel}</p>}
                                    </div>
                                    <div className="item-pricing text-right">
                                        <div className="item-qty">₹{item.unitPrice.toLocaleString()} × {item.quantity}</div>
                                        <div className="item-subtotal">₹{item.lineTotal.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="order-summary-footer">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{currentOrder.subtotal?.toLocaleString() || totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={currentOrder.shippingAmount === 0 ? "text-success" : ""}>
                                    {currentOrder.shippingAmount === 0 ? "Free" : `₹${currentOrder.shippingAmount}`}
                                </span>
                            </div>
                            {currentOrder.discountAmount > 0 && (
                                <div className="summary-row">
                                    <span>Discount</span>
                                    <span className="text-danger">-₹{currentOrder.discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="card-header">
                            <h3 className="card-title">Order Timeline & Management</h3>
                        </div>
                        <div className="status-management">
                            <p className="mb-3">Update the fulfillment status of this order:</p>
                            <div className="status-buttons">
                                {['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].map((s) => (
                                    <button 
                                        key={s}
                                        className={`status-btn ${s} ${status === s ? 'active' : ''}`}
                                        disabled={status === s || updatingStatus}
                                        onClick={() => handleStatusUpdate(s)}
                                    >
                                        {s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.replace(/_/g, ' ').slice(1)}
                                    </button>
                                ))}
                            </div>
                            {updatingStatus && <p className="mt-2 text-muted italic">Updating status...</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="details-sidebar">
                    <div className="admin-card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Customer Information</h3>
                        </div>
                        <div className="customer-info-box">
                            <div className="info-row">
                                <User size={18} className="text-muted" />
                                <div>
                                    <strong>{user?.firstName} {user?.lastName}</strong>
                                    <p className="text-muted small">Customer ID: {user?._id?.substring(0, 8)}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <Mail size={18} className="text-muted" />
                                <span>{user?.email || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <Phone size={18} className="text-muted" />
                                <span>{user?.phone || shippingAddress?.phone || '+91 99999 99999'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Shipping Address</h3>
                        </div>
                        <div className="shipping-box">
                            <div className="info-row align-start">
                                <MapPin size={18} className="text-muted mt-1" />
                                <div>
                                    <strong>{shippingAddress?.recipientName || `${user?.firstName} ${user?.lastName}`}</strong>
                                    <p>{shippingAddress?.addressLine1}</p>
                                    {shippingAddress?.addressLine2 && <p>{shippingAddress?.addressLine2}</p>}
                                    <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}</p>
                                    <p>{shippingAddress?.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="card-header">
                            <h3 className="card-title">Payment Details</h3>
                        </div>
                        <div className="payment-box">
                            <div className="info-row">
                                <CreditCard size={18} className="text-muted" />
                                <div>
                                    <strong>{paymentMethod || 'Razorpay'}</strong>
                                    <div className={`status-pill ${isPaid ? 'status-delivered' : 'status-cancelled'} mt-1`}>
                                        {isPaid ? 'Payment Captured' : 'Payment Pending'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-top">
                                <div className="flex-between">
                                    <span className="text-muted">Transaction ID:</span>
                                    <span className="small fw-600">{currentOrder.razorpayPaymentId || currentOrder.paymentReference || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
