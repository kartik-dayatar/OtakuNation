import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import './AdminOrders.css';

// Extended mock data to match JSP
const mockOrders = [
    { id: 'ORD-8902', date: 'Mar 9, 2026', time: '10:42 AM', customer: 'Sakura M.', email: 'sakura@example.com', total: 373.50, payment: 'Paid', fulfillment: 'Unfulfilled' },
    { id: 'ORD-8901', date: 'Mar 9, 2026', time: '09:12 AM', customer: 'Kenji R.', email: 'kenji.r@mail.com', total: 738.70, payment: 'Paid', fulfillment: 'Processing' },
    { id: 'ORD-8900', date: 'Mar 8, 2026', time: '04:30 PM', customer: 'Aiko T.', email: 'aiko.tanaka@example.jp', total: 157.70, payment: 'Paid', fulfillment: 'Delivered' },
    { id: 'ORD-8899', date: 'Mar 8, 2026', time: '01:15 PM', customer: 'Haruto K.', email: 'haru99@mail.com', total: 1070.70, payment: 'Refunded', fulfillment: 'Cancelled' },
    { id: 'ORD-8898', date: 'Mar 7, 2026', time: '11:05 AM', customer: 'Yuki S.', email: 'yuki.s@example.com', total: 549.00, payment: 'Unpaid', fulfillment: 'Pending' },
];

function AdminOrders() {
    const [activeTab, setActiveTab] = useState('All Orders');

    const getFulfillmentClass = (status) => {
        switch(status) {
            case 'Delivered': return 'status-delivered';
            case 'Processing': return 'status-processing';
            case 'Unfulfilled':
            case 'Pending': return 'status-pending';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getPaymentClass = (status) => {
        switch(status) {
            case 'Paid': return 'payment-paid';
            case 'Refunded': return 'payment-refunded';
            case 'Unpaid': return 'payment-unpaid';
            default: return '';
        }
    };

    return (
        <div className="admin-orders-page">
            <div className="content-header flex-between mb-4">
                <div>
                    <h1 className="admin-page-title">Order Returns & Fulfillment</h1>
                    <p className="admin-page-subtitle">Track, fulfill, and manage customer orders.</p>
                </div>
                <button className="btn ghost flex-icon">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="admin-panel full-width">
                {/* Toolbar - Tabs */}
                <div className="admin-tabs-bar">
                    {['All Orders', 'Unfulfilled', 'Processing', 'Completed'].map(tab => (
                        <button 
                            key={tab}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab} {tab === 'Unfulfilled' && <span className="tab-count">24</span>}
                        </button>
                    ))}
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
                            {mockOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="fw-600">{order.id}</td>
                                    <td className="td-date">
                                        {order.date}<br/>
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
                                        <button className={`btn ${order.fulfillment === 'Unfulfilled' ? 'primary' : 'ghost'} small round-btn`}>
                                            {order.fulfillment === 'Unfulfilled' ? 'Fulfill' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="admin-pagination">
                    <span className="pagination-info">Showing 1 to 5 of 1,204 orders</span>
                    <div className="pagination-controls">
                        <button disabled>Previous</button>
                        <button className="active">1</button>
                        <button>2</button>
                        <button>3</button>
                        <span>...</span>
                        <button>241</button>
                        <button>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOrders;
