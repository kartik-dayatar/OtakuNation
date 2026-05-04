import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaGlobeAmericas, FaEnvelope, FaTag, FaBox, FaTruck, FaShippingFast, FaCheckCircle, FaArrowLeft, FaBolt, FaShip, FaPalette, FaKey } from 'react-icons/fa';
import { GiSpiralShell } from 'react-icons/gi';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import ReviewModal from '../../components/Shop/ReviewModal';
import { CancelOrderModal, ReturnOrderModal } from '../../components/User/OrderActionModals';
import { useToast } from '../../components/ui/Toast';
import './OrderTracking.css';

export default function OrderTracking() {
    const { orderId: orderIdParam } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token) || localStorage.getItem('on_token');
    const user = useAuthStore((state) => state.user);

    // Review System State
    const [reviewStatus, setReviewStatus] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Cancel/Return State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const { addToast } = useToast();


    useEffect(() => {
        if (!orderIdParam) return;

        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`http://localhost:5000/api/orders/${orderIdParam}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrderData(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Order not found or unauthorized');
                setOrderData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderIdParam, token]);

    const items = React.useMemo(() => orderData?.items || [], [orderData]);

    // Check review eligibility for each product once order is loaded and delivered
    useEffect(() => {
        if (orderData?.status === 'delivered' && items.length > 0) {
            const checkReviews = async () => {
                const statuses = {};
                for (const item of items) {
                    const pid = item.product || item.productId;
                    if (!pid) continue;
                    try {
                        const { data } = await axios.get(`http://localhost:5000/api/reviews/can-review/${pid}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        statuses[pid] = data;
                    } catch (err) {
                        console.error("Review check failed:", err);
                    }
                }
                setReviewStatus(statuses);
            };
            checkReviews();
        }
    }, [orderData, items, token]);

    const handleReviewSuccess = (productId) => {
        setReviewStatus(prev => ({
            ...prev,
            [productId]: { canReview: false, reason: 'already_reviewed' }
        }));
    };

    const handleCancelOrder = async (reason) => {
        setActionLoading(true);
        try {
            const { data } = await axios.post(`http://localhost:5000/api/orders/${orderIdParam}/cancel`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderData(data);
            addToast("Order cancelled successfully", "success");
            if (data.paymentStatus === 'refund_initiated') {
                addToast("Your refund will be initiated within 24 hours", "info");
            }
            setShowCancelModal(false);
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to cancel order", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReturnOrder = async (reason) => {
        setActionLoading(true);
        try {
            const { data } = await axios.post(`http://localhost:5000/api/orders/${orderIdParam}/return`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderData(data);
            addToast("Return request submitted!", "success");
            setShowReturnModal(false);
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to request return", "error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Loading order details...</h2>
            </div>
        );
    }

    if (!orderIdParam || error) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Order Not Found</h2>
                <p>{error || "No order ID provided. Please check your orders list."}</p>
                <Link to="/account/orders" className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>View My Orders</Link>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Loading order details...</h2>
            </div>
        );
    }

    const { 
        status: orderStatus, 
        isPaid, 
        paymentMethod: pmField, 
        shippingAddress, 
        totalAmount: total, 
        deliveredAt,
        returnStatus,
        returnRequested,
        returnRequestedAt
    } = orderData;
    const orderDate = new Date(orderData.createdAt).toLocaleDateString();
    const trackingId = orderData.trackingCode || (orderStatus === 'processing' ? 'Awaiting shipment' : `TRK${orderData._id.substring(0, 6).toUpperCase()}`);
    const estimatedDelivery = orderStatus === 'delivered' ? 'Delivered' : (orderStatus === 'shipped' ? '3-5 Business Days' : '5-7 Business Days (estimated)');
    const paymentMethodLabel = pmField === 'razorpay' ? 'Online Payment (Razorpay)'
        : pmField === 'COD' ? 'Cash on Delivery'
        : isPaid ? 'Online Payment (Razorpay)' : 'Cash on Delivery';
    const totalAmountStr = `₹${(total || 0).toLocaleString()}`;

    // Progress Logic
    let stepIndex = 0;
    if (orderStatus === 'placed') stepIndex = 0;
    else if (orderStatus === 'processing') stepIndex = 0;
    else if (orderStatus === 'shipped') stepIndex = 1;
    else if (orderStatus === 'out_for_delivery') stepIndex = 2;
    else if (orderStatus === 'delivered') stepIndex = 3;

    const stepLabels = ["Placed", "Shipped", "Out for Delivery", "Delivered"];
    const stepIcons = [<FaBox />, <FaTruck />, <FaShippingFast />, <FaCheckCircle />];

    let fillWidth = "0%";
    if (stepIndex === 0) fillWidth = "0%";
    else fillWidth = "100%";

    // Return Logic
    const canCancel = ["confirmed", "processing"].includes(orderStatus);
    
    let canReturn = false;
    let returnDeadline = null;
    let daysRemaining = 0;

    if (orderStatus === 'delivered' && deliveredAt) {
        const dDate = new Date(deliveredAt);
        returnDeadline = new Date(dDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        daysRemaining = (returnDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        canReturn = daysRemaining > 0 && !returnRequested;
    }

    return (
        <main className="ot-container">
            <Link to="/account/orders" className="ot-back"><FaArrowLeft style={{ marginRight: '8px' }} /> Back to Orders</Link>

            <h1 className="ot-page-title">Order #{orderIdParam.toUpperCase()}</h1>
            <p className="ot-page-sub">
                Placed on {orderDate} &middot; <span className={`ot-status-badge ${orderStatus}`}>{orderStatus.replace("_", " ")}</span>
            </p>

            {/* Progress Tracker */}
            <div className="ot-progress">
                {stepLabels.map((label, i) => (
                    <React.Fragment key={i}>
                        <div className={`ot-step ${i <= stepIndex ? 'active' : ''}`}>
                            <div className="ot-step-icon">{stepIcons[i]}</div>
                            <div className="ot-step-label">{label}</div>
                        </div>
                        {i < stepLabels.length - 1 && (
                            <div className="ot-connector" style={{
                                flex: 1,
                                height: '3px',
                                borderRadius: '2px',
                                background: i < stepIndex ? '#22c55e' : '#e5e7eb',
                                transition: 'background 0.3s ease'
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Tracking Info */}
            <div className="ot-tracking">
                <div className="ot-tracking-icon"><FaTruck /></div>
                <div className="ot-tracking-info">
                    <strong>Tracking ID: {trackingId}</strong>
                    <span>Estimated Delivery: {estimatedDelivery}</span>
                </div>
            </div>

            {/* Post-purchase Actions */}
            {(canCancel || canReturn || returnRequested) && (
                <div className="ot-actions-card">
                    {canCancel && (
                        <div className="ot-cancel-section">
                            <h3>Need to cancel?</h3>
                            <p>You can cancel your order before it ships.</p>
                            <button className="ot-cancel-btn" onClick={() => setShowCancelModal(true)}>Cancel Order</button>
                        </div>
                    )}

                    {canReturn && (
                        <div className="ot-return-section">
                            <h3>Return Item?</h3>
                            <p>Something not right? You can request a return within 7 days.</p>
                            <button className="ot-return-btn" onClick={() => setShowReturnModal(true)}>Request Return</button>
                            {returnDeadline && (
                                <p className={`ot-return-deadline ${daysRemaining <= 3 ? 'warning' : ''}`}>
                                    Return by: {returnDeadline.toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}

                    {returnRequested && (
                        <div className="ot-return-status-section">
                            <div className="ot-return-header">
                                <span className={`ot-return-badge ${returnStatus}`}>
                                    {returnStatus === 'requested' ? 'Return Requested' : 
                                     returnStatus === 'approved' ? 'Return Approved' : 
                                     returnStatus === 'rejected' ? 'Return Rejected' : ''}
                                </span>
                            </div>
                            <p className="ot-return-note">
                                {returnStatus === 'requested' && "We'll contact you within 24-48 hours"}
                                {returnStatus === 'approved' && "Please ship the item back to us"}
                                {returnStatus === 'rejected' && "Contact support for more information"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details */}
            <div className="ot-card">
                <h3 className="ot-card-title">Order Details</h3>
                <div className="ot-details-grid">
                    <div>
                        <div className="ot-detail-label">Order ID</div>
                        <div className="ot-detail-value" style={{ fontSize: '12px', wordBreak: 'break-all', fontFamily: 'monospace' }}>{orderIdParam.toUpperCase()}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Date Placed</div>
                        <div className="ot-detail-value">{orderDate}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Payment Method</div>
                        <div className="ot-detail-value">{paymentMethodLabel}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Total Amount</div>
                        <div className="ot-detail-value">{totalAmountStr}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Email</div>
                        <div className="ot-detail-value">{user?.email || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <div className="ot-detail-label">Shipping Address</div>
                        <div className="ot-detail-value">
                            {shippingAddress?.addressLine1}, {shippingAddress?.city}, {shippingAddress?.postalCode}, {shippingAddress?.country}
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Ordered */}
            <div className="ot-card">
                <h3 className="ot-card-title">Items Ordered</h3>
                {items.map((item, j) => {
                    const itemName = item.productName || "Product";
                    let resolvedUrl = item.productImage || "/assets/placeholder.png";
                    if (resolvedUrl && !resolvedUrl.startsWith('http') && !resolvedUrl.startsWith('/src') && !resolvedUrl.startsWith('/assets') && !resolvedUrl.startsWith('data:')) {
                        resolvedUrl = `http://localhost:5000/uploads/products/${resolvedUrl}`;
                    }

                    return (
                        <div key={j} className="ot-item">
                            <div className="ot-item-img">
                                <img src={resolvedUrl} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="ot-item-info">
                                <h4>{itemName}</h4>
                                <p>Qty: {item.quantity || 1}</p>
                                
                                {orderStatus === 'delivered' && item.product && (
                                    <div className="ot-item-actions">
                                        {reviewStatus[item.product]?.canReview ? (
                                            <button
                                                className="ot-review-btn"
                                                onClick={() => {
                                                    setSelectedProduct({ id: item.product, name: itemName });
                                                    setShowReviewModal(true);
                                                }}
                                            >
                                                Write a Review
                                            </button>
                                        ) : reviewStatus[item.product]?.reason === 'already_reviewed' ? (
                                            <span className="ot-reviewed-badge">Reviewed ✓</span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            <div className="ot-item-price">₹{(item.unitPrice * (item.quantity || 1)).toLocaleString()}</div>
                        </div>
                    );
                })}
                <div style={{ marginTop: '16px' }}>
                    <div className="ot-total-row final">
                        <span>Total</span><span>{totalAmountStr}</span>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    productId={selectedProduct.id}
                    orderId={orderIdParam}
                    productName={selectedProduct.name}
                    onSuccess={handleReviewSuccess}
                />
            )}

            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelOrder}
                loading={actionLoading}
            />

            <ReturnOrderModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onConfirm={handleReturnOrder}
                loading={actionLoading}
            />
        </main>
    );
}

