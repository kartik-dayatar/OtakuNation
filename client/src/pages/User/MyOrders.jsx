import React from 'react';
import { Link } from 'react-router-dom';
import './MyOrders.css';

export default function MyOrders() {
    // Mock Data
    const orders = [
        {
            id: "ORD-2024-889",
            date: "Oct 12, 2024",
            status: "delivered",
            total: "₹6,640",
            items: ["Demon Slayer Haori", "Naruto Headband"],
            image: "⚡"
        },
        {
            id: "ORD-2024-762",
            date: "Sep 28, 2024",
            status: "shipped",
            total: "₹996",
            items: ["Attack on Titan Keychain Set"],
            image: "🗝️"
        },
        {
            id: "ORD-2024-554",
            date: "Sep 15, 2024",
            status: "processing",
            total: "₹12,076",
            items: ["One Piece Going Merry Model Kit", "Jujutsu Kaisen T-Shirt", "MHA Poster Set"],
            image: "⛵"
        }
    ];

    return (
        <main className="my-orders-page">
            <div className="account-layout">
                {/* Reusing Sidebar for consistency - typically this would be a shared component */}
                <aside className="account-sidebar">
                    <ul className="sidebar-menu">
                        <li><Link to="/account" className="sidebar-link">Dashboard</Link></li>
                        <li><Link to="/orders" className="sidebar-link active">My Orders</Link></li>
                        <li><Link to="/wishlist" className="sidebar-link">My Wishlist</Link></li>
                        <li><Link to="#" className="sidebar-link">Addresses</Link></li>
                        <li><Link to="#" className="sidebar-link">Profile Settings</Link></li>
                        <li><Link to="/logout" className="sidebar-link logout">Log out</Link></li>
                    </ul>
                </aside>

                <section className="account-content">
                    <div className="page-header">
                        <h1>My Orders</h1>
                        <p>Track your past purchases and check their status.</p>
                    </div>

                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-id">{order.id}</span>
                                        <span className="order-date">{order.date}</span>
                                    </div>
                                    <div className={`order-status ${order.status}`}>{order.status}</div>
                                </div>
                                <div className="order-body">
                                    <div className="order-preview-icon">{order.image}</div>
                                    <div className="order-details">
                                        <h4>{order.items[0]} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h4>
                                        <p>Total: <strong>{order.total}</strong></p>
                                    </div>
                                    <Link to={`/order-tracking?orderId=${order.id}`} className="btn ghost-sm">
                                        Track Order
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <div className="empty-state">
                                <h3>No orders yet</h3>
                                <Link to="/products" className="btn primary">Start Shopping</Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
