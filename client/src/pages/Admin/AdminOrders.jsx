import React, { useState, useMemo, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import './AdminOrders.css';

// Tab definitions — maps tab label to which fulfillment statuses it includes
const TABS = [
    { label: 'All Orders',  statuses: null },
    { label: 'Pending',     statuses: ['Pending'] },
    { label: 'Processing',  statuses: ['Processing'] },
    { label: 'Delivered',   statuses: ['Delivered'] },
    { label: 'Cancelled',   statuses: ['Cancelled'] },
];

function AdminOrders() {
    const [activeTab, setActiveTab] = useState('All Orders');
    const [search, setSearch] = useState('');
    
    const { orders: mockOrders, fetchOrders } = useAdminStore();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getFulfillmentClass = (status) => {
        switch (status) {
            case 'Delivered':   return 'status-delivered';
            case 'Processing':  return 'status-processing';
            case 'Pending':     return 'status-pending';
            case 'Cancelled':   return 'status-cancelled';
            default:            return '';
        }
    };

    const getPaymentClass = (status) => {
        switch (status) {
            case 'Paid':      return 'payment-paid';
            case 'Refunded':  return 'payment-refunded';
            case 'Unpaid':    return 'payment-unpaid';
            default:          return '';
        }
    };

    // Count per tab for the badge numbers
    const tabCounts = useMemo(() => {
        const counts = {};
        TABS.forEach(({ label, statuses }) => {
            counts[label] = statuses
                ? mockOrders.filter(o => statuses.includes(o.fulfillment)).length
                : mockOrders.length;
        });
        return counts;
    }, [mockOrders]);

    // Apply tab filter + search filter
    const filteredOrders = useMemo(() => {
        const currentTab = TABS.find(t => t.label === activeTab);
        let result = currentTab?.statuses
            ? mockOrders.filter(o => currentTab.statuses.includes(o.fulfillment))
            : [...mockOrders];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.customer.toLowerCase().includes(q) ||
                o.email.toLowerCase().includes(q)
            );
        }

        return result;
    }, [activeTab, search, mockOrders]);

    return (
        <div className="admin-orders-page">
            <div className="content-header flex-between mb-4">
                <div>
                    <h1 className="admin-page-title">Order Returns &amp; Fulfillment</h1>
                    <p className="admin-page-subtitle">Track, fulfill, and manage customer orders.</p>
                </div>
                <button className="btn ghost flex-icon">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="admin-panel full-width">
                {/* Status Tabs */}
                <div className="admin-tabs-bar">
                    {TABS.map(({ label }) => (
                        <button
                            key={label}
                            className={`tab ${activeTab === label ? 'active' : ''}`}
                            onClick={() => setActiveTab(label)}
                        >
                            {label}
                            {tabCounts[label] > 0 && (
                                <span className="tab-count">{tabCounts[label]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div className="orders-search">
                        <Search size={14} color="#9ca3af" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table advanced-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Payment</th>
                                <th>Fulfillment</th>
                                <th className="text-right">Total</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="fw-600">{order.id}</td>
                                    <td className="td-date">
                                        {order.date}
                                        <span>{order.time}</span>
                                    </td>
                                    <td>
                                        <div className="customer-cell">
                                            <strong>{order.customer}</strong>
                                            <span>{order.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`payment-badge ${getPaymentClass(order.payment)}`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${getFulfillmentClass(order.fulfillment)}`}>
                                            {order.fulfillment}
                                        </span>
                                    </td>
                                    <td className="price text-right fw-600">₹{order.total.toFixed(2)}</td>
                                    <td className="text-center">
                                        <button className={`btn ${order.fulfillment === 'Pending' ? 'primary' : 'ghost'} small round-btn`}>
                                            {order.fulfillment === 'Pending' ? 'Fulfill' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                                        No orders found{search ? ` for "${search}"` : ''}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="admin-pagination">
                    <span className="pagination-info">
                        Showing {filteredOrders.length} of {mockOrders.length} orders
                        {activeTab !== 'All Orders' && ` · Filtered by: ${activeTab}`}
                    </span>
                    <div className="pagination-controls">
                        <button disabled>Previous</button>
                        <button className="active">1</button>
                        <button>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOrders;
