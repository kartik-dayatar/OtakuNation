import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaGlobeAmericas, FaEnvelope, FaTag, FaBox, FaTruck, FaShippingFast, FaCheckCircle, FaArrowLeft, FaBolt, FaShip, FaPalette, FaKey } from 'react-icons/fa';
import { GiSpiralShell } from 'react-icons/gi';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import './OrderTracking.css';

export default function OrderTracking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderIdParam = searchParams.get('orderId');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);


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

    if (!orderIdParam) {
        return (
            <main className="track-hero">
                <div className="track-card">
                    <div className="track-header">
                        <h1 className="track-title">
                            <span className="track-icon"><FaGlobeAmericas /></span>
                            Track Your Order
                        </h1>
                        <p className="track-subtitle">Enter your order details to check delivery status.</p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.orderId.value;
                        if (val) navigate(`/order-tracking?orderId=${val}`);
                    }}>
                        <div className="track-form-group">
                            <div className="track-input-wrapper">
                                <span className="track-input-icon"><FaEnvelope /></span>
                                <input type="email" name="email" className="track-input" placeholder="Email Address" required />
                            </div>
                        </div>

                        <div className="track-form-group">
                            <div className="track-input-wrapper">
                                <span className="track-input-icon"><FaTag /></span>
                                <input type="text" name="orderId" className="track-input" placeholder="Order ID (e.g. 64abc123...)" required />
                            </div>
                        </div>

                        <button type="submit" className="track-btn">Track Order</button>
                    </form>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Loading order details...</h2>
            </div>
        );
    }

    if (!orderData || error) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Order Not Found</h2>
                <p>{error || `Could not find order #${orderIdParam.substring(0, 8)}.`}</p>
                <Link to="/order-tracking" className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>Try Another ID</Link>
            </div>
        );
    }

    const { status: orderStatus, isPaid, shippingAddress, totalAmount: total, items } = orderData;
    const orderDate = new Date(orderData.createdAt).toLocaleDateString();
    const trackingId = orderData.trackingCode || (orderStatus === 'processing' ? 'Awaiting shipment' : `TRK${orderData._id.substring(0, 6).toUpperCase()}`);
    const estimatedDelivery = orderStatus === 'delivered' ? 'Delivered' : (orderStatus === 'shipped' ? '3-5 Business Days' : '5-7 Business Days (estimated)');
    const paymentMethod = isPaid ? 'Paid via Razorpay' : 'Pending Payment';
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
    else if (stepIndex === 1) fillWidth = "33%";
    else if (stepIndex === 2) fillWidth = "66%";
    else fillWidth = "100%";

    return (
        <main className="ot-container">
            <Link to="/orders" className="ot-back"><FaArrowLeft style={{ marginRight: '8px' }} /> Back to Orders</Link>

            <h1 className="ot-page-title">Order #{orderIdParam.substring(0, 8).toUpperCase()}</h1>
            <p className="ot-page-sub">
                Placed on {orderDate} &middot; <span className={`ot-status-badge ${orderStatus}`}>{orderStatus.replace("_", " ")}</span>
            </p>

            {/* Progress Tracker */}
            <div className="ot-progress">
                <div className="ot-progress-fill" style={{ width: fillWidth }}></div>
                {stepLabels.map((label, i) => (
                    <div key={i} className={`ot-step ${i <= stepIndex ? 'active' : ''}`}>
                        <div className="ot-step-icon">{stepIcons[i]}</div>
                        <div className="ot-step-label">{label}</div>
                    </div>
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

            {/* Order Details */}
            <div className="ot-card">
                <h3 className="ot-card-title">Order Details</h3>
                <div className="ot-details-grid">
                    <div>
                        <div className="ot-detail-label">Order ID</div>
                        <div className="ot-detail-value">{orderIdParam.substring(0, 8).toUpperCase()}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Date Placed</div>
                        <div className="ot-detail-value">{orderDate}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Payment Method</div>
                        <div className="ot-detail-value">{paymentMethod}</div>
                    </div>
                    <div>
                        <div className="ot-detail-label">Total Amount</div>
                        <div className="ot-detail-value">{totalAmountStr}</div>
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
                        resolvedUrl = `/src/assets/images/products/${resolvedUrl}`;
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
                                    <button
                                        className="ot-review-btn"
                                        onClick={() => navigate(`/add-review/${item.product}?orderId=${orderIdParam}`)}
                                    >
                                        Add Review
                                    </button>
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
        </main>
    );
}

