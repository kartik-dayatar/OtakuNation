import React, { useEffect } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import './AdminCustomers.css';

function AdminCustomers() {
    const { customers, fetchCustomers } = useAdminStore();

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const getInitials = (name) => name.charAt(0).toUpperCase();

    return (
        <div className="admin-customers-page">
            <div className="mb-4">
                <h1 className="admin-page-title">Customers</h1>
                <p className="admin-page-subtitle">Manage customer accounts and view their purchase history.</p>
            </div>

            <div className="admin-panel full-width">
                {/* Toolbar */}
                <div className="admin-toolbar">
                    <div className="toolbar-left">
                        <select className="admin-select" aria-label="Filter by Status">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select className="admin-select" aria-label="Filter by Orders">
                            <option value="all">Any Orders</option>
                            <option value="placed">Placed Orders</option>
                            <option value="none">No Orders</option>
                        </select>
                    </div>
                    <div className="toolbar-right">
                        <button className="btn text small flex-icon"><Download size={16}/> Export</button>
                        <select className="admin-select small" aria-label="Sort Order">
                            <option value="newest">Newest First</option>
                            <option value="spent_high">Most Spent</option>
                            <option value="orders_high">Most Orders</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table advanced-table">
                        <thead>
                            <tr>
                                <th width="40"><input type="checkbox" /></th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Total Orders</th>
                                <th>Total Spent</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? customers.map(customer => (
                                <tr key={customer.id}>
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div className="table-customer-card">
                                            <div className="table-avatar" style={{backgroundColor: customer.color}}>
                                                {getInitials(customer.name)}
                                            </div>
                                            <div className="tc-info">
                                                <strong>{customer.name}</strong>
                                                <span>Registered: {customer.joined}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.orders}</td>
                                    <td className="price fw-600">₹{customer.spent.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-pill status-${customer.status.toLowerCase()}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-menu">
                                            <button className="icon-btn-small" title="View"><Eye size={16}/></button>
                                            <button className="icon-btn-small" title="Delete"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                 <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="admin-pagination">
                    <span className="pagination-info">Showing {customers.length} customers</span>
                    <div className="pagination-controls">
                        <button disabled>Previous</button>
                        <button className="active">1</button>
                        <button disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCustomers;
