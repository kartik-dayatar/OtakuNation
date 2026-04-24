import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar,
    Package, IndianRupee, ShoppingBag, Star, Clock,
    CheckCircle, XCircle, Truck, AlertCircle
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import './AdminCustomerDetails.css';

const STATUS_CONFIG = {
    delivered:        { color: '#16a34a', bg: '#dcfce7', label: 'Delivered',        icon: CheckCircle },
    processing:       { color: '#6366f1', bg: '#eef2ff', label: 'Processing',       icon: Clock },
    shipped:          { color: '#2563eb', bg: '#eff6ff', label: 'Shipped',           icon: Truck },
    out_for_delivery: { color: '#06b6d4', bg: '#ecfeff', label: 'Out for Delivery',  icon: Truck },
    confirmed:        { color: '#d97706', bg: '#fef3c7', label: 'Confirmed',         icon: CheckCircle },
    cancelled:        { color: '#dc2626', bg: '#fee2e2', label: 'Cancelled',         icon: XCircle },
    returned:         { color: '#7c3aed', bg: '#f5f3ff', label: 'Returned',          icon: AlertCircle },
};

const AdminCustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentCustomer, loading, error, fetchCustomerById } = useAdminStore();

    useEffect(() => {
        fetchCustomerById(id);
    }, [id, fetchCustomerById]);

    if (loading) {
        return (
            <div className="acd-loading">
                <div className="acd-spinner"></div>
                <p>Loading customer details…</p>
            </div>
        );
    }

    if (error || !currentCustomer) {
        return (
            <div className="acd-error">
                <AlertCircle size={40} />
                <h3>{error || 'Customer not found'}</h3>
                <button className="btn primary" onClick={() => navigate('/admin/customers')}>Back to Customers</button>
            </div>
        );
    }

    const { user, orders } = currentCustomer;

    const totalSpent = orders.reduce((s, o) => {
        const active = ['confirmed','processing','shipped','out_for_delivery','delivered'];
        return active.includes(o.status) ? s + o.totalAmount : s;
    }, 0);

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const getInitials = (u) =>
        `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

    const AVATAR_COLORS = ['#6366f1','#0891b2','#16a34a','#d97706','#9333ea'];
    const avatarColor = AVATAR_COLORS[user._id.charCodeAt(0) % AVATAR_COLORS.length];

    return (
        <div className="acd-page">

            {/* Back + Header */}
            <div className="acd-header">
                <button className="acd-back-btn" onClick={() => navigate('/admin/customers')}>
                    <ArrowLeft size={18} /> Back to Customers
                </button>
                <div className="acd-read-only-badge">
                    <AlertCircle size={13} /> Read Only
                </div>
            </div>

            {/* Profile Hero */}
            <div className="acd-hero">
                <div className="acd-avatar" style={{ background: avatarColor }}>
                    {getInitials(user)}
                </div>
                <div className="acd-hero-info">
                    <h1 className="acd-name">{user.firstName} {user.lastName}</h1>
                    <p className="acd-email"><Mail size={14} /> {user.email}</p>
                    <p className="acd-join"><Calendar size={14} /> Member since {fmtDate(user.createdAt)}</p>
                </div>
                <div className="acd-hero-stats">
                    <div className="acd-hero-stat">
                        <ShoppingBag size={18} className="hs-icon blue" />
                        <div>
                            <strong>{orders.length}</strong>
                            <span>Total Orders</span>
                        </div>
                    </div>
                    <div className="acd-hero-stat">
                        <IndianRupee size={18} className="hs-icon green" />
                        <div>
                            <strong>₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            <span>Total Spent</span>
                        </div>
                    </div>
                    <div className="acd-hero-stat">
                        <Star size={18} className="hs-icon purple" />
                        <div>
                            <strong>{user.otakuPoints || 0}</strong>
                            <span>Otaku Points</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="acd-grid">

                {/* Left: Profile Info */}
                <div className="acd-col">

                    {/* Personal Details */}
                    <div className="acd-card">
                        <h3 className="acd-card-title"><User size={16} /> Personal Details</h3>
                        <div className="acd-field-list">
                            <div className="acd-field">
                                <span className="acd-field-label">First Name</span>
                                <span className="acd-field-value">{user.firstName || '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Last Name</span>
                                <span className="acd-field-value">{user.lastName || '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Email</span>
                                <span className="acd-field-value">{user.email}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Mobile</span>
                                <span className="acd-field-value">{user.mobile || '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Gender</span>
                                <span className="acd-field-value">{user.gender || '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Date of Birth</span>
                                <span className="acd-field-value">{user.dob ? fmtDate(user.dob) : '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Location</span>
                                <span className="acd-field-value">{user.location || '—'}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Account Status</span>
                                <span className={`acd-status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Role</span>
                                <span className="acd-field-value capitalize">{user.role}</span>
                            </div>
                            <div className="acd-field">
                                <span className="acd-field-label">Member Since</span>
                                <span className="acd-field-value">{fmtDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Saved Addresses */}
                    <div className="acd-card">
                        <h3 className="acd-card-title"><MapPin size={16} /> Saved Addresses</h3>
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="acd-address-list">
                                {user.addresses.map((addr, i) => (
                                    <div key={i} className={`acd-address-item ${addr.isDefault ? 'default' : ''}`}>
                                        {addr.isDefault && <span className="default-badge">Default</span>}
                                        <p className="addr-name"><strong>{addr.name}</strong></p>
                                        <p className="addr-line">{addr.street}</p>
                                        <p className="addr-line">{addr.city}, {addr.state} – {addr.pincode}</p>
                                        {addr.mobile && <p className="addr-line"><Phone size={12} /> {addr.mobile}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="acd-empty-text">No saved addresses.</p>
                        )}
                    </div>
                </div>

                {/* Right: Order History */}
                <div className="acd-col">
                    <div className="acd-card">
                        <h3 className="acd-card-title"><Package size={16} /> Order History ({orders.length})</h3>
                        {orders.length === 0 ? (
                            <p className="acd-empty-text">This customer has no orders yet.</p>
                        ) : (
                            <div className="acd-orders-list">
                                {orders.map(order => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={order._id} className="acd-order-row">
                                            <div className="acd-order-top">
                                                <div className="acd-order-id">
                                                    <span className="order-num">#{order.orderNumber}</span>
                                                    <span className="order-date">{fmtDate(order.createdAt)}</span>
                                                </div>
                                                <span
                                                    className="acd-order-status"
                                                    style={{ color: cfg.color, background: cfg.bg }}
                                                >
                                                    <Icon size={11} /> {cfg.label}
                                                </span>
                                            </div>
                                            <div className="acd-order-items">
                                                {order.items.slice(0, 2).map((item, i) => (
                                                    <span key={i} className="acd-item-chip">{item.productName} × {item.quantity}</span>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <span className="acd-item-chip more">+{order.items.length - 2} more</span>
                                                )}
                                            </div>
                                            <div className="acd-order-bottom">
                                                <span className="acd-order-method">{order.paymentMethod}</span>
                                                <span className={`acd-pay-status ${order.paymentStatus}`}>{order.paymentStatus}</span>
                                                <strong className="acd-order-total">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomerDetails;
