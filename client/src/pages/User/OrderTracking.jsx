import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaGlobeAmericas, FaEnvelope, FaTag, FaBox, FaTruck, FaShippingFast, FaCheckCircle, FaArrowLeft, FaBolt, FaShip, FaPalette, FaKey } from 'react-icons/fa';
import { GiSpiralShell } from 'react-icons/gi';
import './OrderTracking.css';

export default function OrderTracking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderIdParam = searchParams.get('orderId');
    const [orderData, setOrderData] = useState(null);

    // Mock DB updated with Icon Components or names
    const mockOrders = {
        "ORD-2024-889": {
            orderDate: "Oct 12, 2024",
            orderStatus: "delivered",
            paymentMethod: "Credit Card ending in 4242",
            totalAmount: "₹6,640",
            shippingAddress: "123 Otaku Lane, Anime City, Tokyo 100-0001, Japan",
            trackingId: "TRK889220456",
            estimatedDelivery: "Delivered on Oct 18, 2024",
            items: [
                { name: "Demon Slayer Haori", desc: "Size: M · Qty: 1", price: "₹3,735", icon: <FaBolt color="#ffc107" /> },
                { name: "Naruto Headband - Hidden Leaf", desc: "Qty: 1", price: "₹1,577", icon: <GiSpiralShell color="#ff4500" /> },
                { name: "Mystery Anime Sticker Pack", desc: "Qty: 2", price: "₹1,328", icon: <FaBox color="#8b4513" /> }
            ]
        },
        "ORD-2024-762": {
            orderDate: "Sep 28, 2024",
            orderStatus: "shipped",
            paymentMethod: "PayPal (k***@email.com)",
            totalAmount: "₹996",
            shippingAddress: "456 Manga Blvd, Osaka 530-0001, Japan",
            trackingId: "TRK762887321",
            estimatedDelivery: "3-5 Business Days",
            items: [
                { name: "Attack on Titan Keychain Set", desc: "Qty: 1", price: "₹996", icon: <FaKey color="#64748b" /> }
            ]
        },
        "ORD-2024-554": {
            orderDate: "Sep 15, 2024",
            orderStatus: "processing",
            paymentMethod: "Debit Card ending in 8910",
            totalAmount: "₹12,076",
            shippingAddress: "789 Sakura St, Kyoto 600-8001, Japan",
            trackingId: "Awaiting shipment",
            estimatedDelivery: "5-7 Business Days (estimated)",
            items: [
                { name: "One Piece Going Merry Model Kit", desc: "1:100 Scale · Qty: 1", price: "₹6,557", icon: <FaShip color="#3b82f6" /> },
                { name: "Jujutsu Kaisen T-Shirt", desc: "Size: L · Qty: 1", price: "₹2,698", icon: <FaTag color="#ef4444" /> },
                { name: "My Hero Academia Poster Set", desc: "A3 Size · Qty: 2", price: "₹2,822", icon: <FaPalette color="#8b5cf6" /> }
            ]
        }
    };

    useEffect(() => {
        if (orderIdParam && mockOrders[orderIdParam]) {
            setOrderData(mockOrders[orderIdParam]);
        }
    }, [orderIdParam]);

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
                                <input type="text" name="orderId" className="track-input" placeholder="Order ID (e.g. ORD-2024-889)" required />
                            </div>
                        </div>

                        <button type="submit" className="track-btn">Track Order</button>
                    </form>

                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                        Demo IDs: <Link to="/order-tracking?orderId=ORD-2024-889">ORD-2024-889</Link>, <Link to="/order-tracking?orderId=ORD-2024-762">ORD-2024-762</Link>
                    </div>
                </div>
            </main>
        );
    }

    if (!orderData) {
        return (
            <div className="ot-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>Order Not Found</h2>
                <p>Could not find order #{orderIdParam}.</p>
                <Link to="/order-tracking" className="btn primary" style={{ marginTop: '20px', display: 'inline-block' }}>Try Another ID</Link>
            </div>
        );
    }

    const { orderDate, orderStatus, trackingId, estimatedDelivery, paymentMethod, shippingAddress, totalAmount, items } = orderData;

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

            <h1 className="ot-page-title">Order #{orderIdParam}</h1>
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
                        <div className="ot-detail-value">{orderIdParam}</div>
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
                        <div className="ot-detail-value">{totalAmount}</div>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <div className="ot-detail-label">Shipping Address</div>
                        <div className="ot-detail-value">{shippingAddress}</div>
                    </div>
                </div>
            </div>

            {/* Items Ordered */}
            <div className="ot-card">
                <h3 className="ot-card-title">Items Ordered</h3>
                {items.map((item, j) => (
                    <div key={j} className="ot-item">
                        <div className="ot-item-img">{item.icon}</div>
                        <div className="ot-item-info">
                            <h4>{item.name}</h4>
                            <p>{item.desc}</p>
                        </div>
                        <div className="ot-item-price">{item.price}</div>
                    </div>
                ))}
                <div style={{ marginTop: '16px' }}>
                    <div className="ot-total-row final">
                        <span>Total</span><span>{totalAmount}</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

