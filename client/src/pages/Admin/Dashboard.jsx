import React from 'react';
import { IndianRupee, Package, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    return (
        <div className="admin-dashboard-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard Overview</h1>
                    <p className="admin-page-subtitle">Welcome back! Here's what's happening in your store today.</p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon-wrap revenue">
                        <IndianRupee size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Total Revenue</h3>
                        <p className="metric-value">₹24,589.00</p>
                        <span className="metric-trend positive">↑ 12.5% this month</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon-wrap orders">
                        <Package size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Pending Orders</h3>
                        <p className="metric-value">24</p>
                        <span className="metric-trend neutral">Needs shipping</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon-wrap alerts">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Low Stock Items</h3>
                        <p className="metric-value">8</p>
                        <span className="metric-trend negative">Urgent restock needed</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon-wrap customers">
                        <Users size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Active Customers</h3>
                        <p className="metric-value">1,245</p>
                        <span className="metric-trend positive">↑ 54 new this week</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout for Tables */}
            <div className="dashboard-split">
                {/* Recent Orders Table */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>Recent Orders</h2>
                        <button className="btn text small flex-icon">View All <ChevronRight size={16}/></button>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="fw-600">#ORD-8902</td>
                                    <td>Sakura M.</td>
                                    <td>Today, 10:42 AM</td>
                                    <td className="fw-500">₹373.50</td>
                                    <td><span className="status-pill status-pending">Pending</span></td>
                                    <td><button className="btn primary small round-btn">Ship</button></td>
                                </tr>
                                <tr>
                                    <td className="fw-600">#ORD-8901</td>
                                    <td>Kenji R.</td>
                                    <td>Today, 09:12 AM</td>
                                    <td className="fw-500">₹738.70</td>
                                    <td><span className="status-pill status-processing">Processing</span></td>
                                    <td><button className="btn ghost small round-btn">View</button></td>
                                </tr>
                                <tr>
                                    <td className="fw-600">#ORD-8900</td>
                                    <td>Aiko T.</td>
                                    <td>Yesterday</td>
                                    <td className="fw-500">₹157.70</td>
                                    <td><span className="status-pill status-delivered">Delivered</span></td>
                                    <td><button className="btn ghost small round-btn">View</button></td>
                                </tr>
                                <tr>
                                    <td className="fw-600">#ORD-8899</td>
                                    <td>Haruto K.</td>
                                    <td>Yesterday</td>
                                    <td className="fw-500">₹1,070.70</td>
                                    <td><span className="status-pill status-cancelled">Cancelled</span></td>
                                    <td><button className="btn ghost small round-btn">View</button></td>
                                </tr>
                                <tr>
                                    <td className="fw-600">#ORD-8898</td>
                                    <td>Yuki S.</td>
                                    <td>Mar 7, 2026</td>
                                    <td className="fw-500">₹240.70</td>
                                    <td><span className="status-pill status-delivered">Delivered</span></td>
                                    <td><button className="btn ghost small round-btn">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>Inventory Alerts</h2>
                        <button className="btn text small flex-icon">Manage Stock <ChevronRight size={16}/></button>
                    </div>
                    <div className="inventory-list">
                        <div className="inventory-item">
                            <div className="inv-product">
                                <div className="inv-img" style={{backgroundImage: "url('https://picsum.photos/seed/da/40/40')"}}></div>
                                <div>
                                    <h4>Demon Slayer Haori</h4>
                                    <p>Clothing</p>
                                </div>
                            </div>
                            <div className="inv-status danger">
                                <strong>2 left</strong>
                            </div>
                        </div>

                        <div className="inventory-item">
                            <div className="inv-product">
                                <div className="inv-img" style={{backgroundImage: "url('https://picsum.photos/seed/db/40/40')"}}></div>
                                <div>
                                    <h4>Gojo Satoru Figure</h4>
                                    <p>Figures</p>
                                </div>
                            </div>
                            <div className="inv-status danger">
                                <strong>Out of Stock</strong>
                            </div>
                        </div>

                        <div className="inventory-item">
                            <div className="inv-product">
                                <div className="inv-img" style={{backgroundImage: "url('https://picsum.photos/seed/dc/40/40')"}}></div>
                                <div>
                                    <h4>Luffy Straw Hat</h4>
                                    <p>Accessories</p>
                                </div>
                            </div>
                            <div className="inv-status warning">
                                <strong>5 left</strong>
                            </div>
                        </div>

                        <div className="inventory-item">
                            <div className="inv-product">
                                <div className="inv-img" style={{backgroundImage: "url('https://picsum.photos/seed/dd/40/40')"}}></div>
                                <div>
                                    <h4>Anya Forger Plush</h4>
                                    <p>Plushies</p>
                                </div>
                            </div>
                            <div className="inv-status warning">
                                <strong>8 left</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
