import React, { useEffect } from 'react';
import { IndianRupee, Package, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { stats, orders, fetchDashboardStats, fetchOrders } = useAdminStore();

    useEffect(() => {
        fetchDashboardStats();
        fetchOrders(); // We can slice the latest 5 here
    }, [fetchDashboardStats, fetchOrders]);

    const recentOrders = orders.slice(0, 5);

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
                <div className="metric-card" style={{ cursor: 'default' }}>
                    <div className="metric-icon-wrap revenue">
                        <IndianRupee size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Total Revenue</h3>
                        <p className="metric-value">₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className="metric-trend positive">↑ Up to date</span>
                    </div>
                </div>

                <div className="metric-card metric-card--link" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
                    <div className="metric-icon-wrap orders">
                        <Package size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Pending Orders</h3>
                        <p className="metric-value">{stats.pendingOrders}</p>
                        <span className="metric-trend neutral">Needs shipping</span>
                    </div>
                </div>

                <div className="metric-card metric-card--link" onClick={() => navigate('/admin/inventory')} style={{ cursor: 'pointer' }}>
                    <div className="metric-icon-wrap alerts">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Low Stock Items</h3>
                        <p className="metric-value">{stats.lowStockItems}</p>
                        <span className="metric-trend negative">Urgent restock needed</span>
                    </div>
                </div>

                <div className="metric-card metric-card--link" onClick={() => navigate('/admin/customers')} style={{ cursor: 'pointer' }}>
                    <div className="metric-icon-wrap customers">
                        <Users size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Active Customers</h3>
                        <p className="metric-value">{stats.customers}</p>
                        <span className="metric-trend positive">Total users</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout for Tables */}
            <div className="dashboard-split">
                {/* Recent Orders Table */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>Recent Orders</h2>
                        <button
                            className="btn text small flex-icon"
                            onClick={() => navigate('/admin/orders')}
                        >
                            View All <ChevronRight size={16}/>
                        </button>
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
                                {recentOrders.length > 0 ? recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-600">#{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.date}</td>
                                        <td className="price fw-600">₹{order.total.toFixed(2)}</td>
                                        <td><span className={`status-pill status-${order.fulfillment.toLowerCase()}`}>{order.fulfillment}</span></td>
                                        <td><button className={`btn ${order.fulfillment === 'Pending' ? 'primary' : 'ghost'} small round-btn`} onClick={() => navigate('/admin/orders')}>{order.fulfillment === 'Pending' ? 'Ship' : 'View'}</button></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No recent orders.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="admin-panel">
                    <div className="panel-header">
                        <h2>Inventory Alerts</h2>
                        <button
                            className="btn text small flex-icon"
                            onClick={() => navigate('/admin/inventory')}
                        >
                            Manage Stock <ChevronRight size={16}/>
                        </button>
                    </div>
                    <div className="inventory-list">
                        <p style={{padding: '16px', color: '#6b7280'}}>To view all stock warnings, check your inventory tab.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
