import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaThLarge, FaBox, FaUser, FaMapMarkerAlt, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import './Account.css';

export default function Account() {
    const [activeSection, setActiveSection] = useState('overview');
    const [editMode, setEditMode] = useState(null); // null, 'profile', 'address'

    // Mock Data
    const [userProfile, setUserProfile] = useState({
        fullName: 'Kartik',
        mobile: '8866280488',
        email: '',
        gender: 'MALE',
        dob: '',
        location: '',
        altMobile: '',
        hintName: ''
    });

    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: 'Kartik Dayatar',
            address: '123, Anime St, Otaku City, Japan - 400001',
            mobile: '8866280488',
            isDefault: true
        },
        {
            id: 2,
            name: 'Office',
            address: '456, Manga Blvd, Tokyo, Japan - 100001',
            mobile: '9876543210',
            isDefault: false
        }
    ]);

    // Helpers
    const handleEditProfile = () => setEditMode('profile');
    const handleCancelEdit = () => setEditMode(null);
    const handleSaveProfile = (e) => {
        e.preventDefault();
        // Here you would save the profile data
        setEditMode(null);
    };

    const handleAddAddress = () => setEditMode('address');
    const handleSaveAddress = (e) => {
        e.preventDefault();
        // Here you would save the address
        setEditMode(null);
    };

    // Render Functions
    const renderOverview = () => (
        <>
            <div className="content-header">
                <h2>Overview</h2>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total Orders</h3>
                    <div className="dashboard-value">12</div>
                    <Link to="#" onClick={() => setActiveSection('orders')} className="dashboard-link">View all orders <FaChevronRight size={10} /></Link>
                </div>
                <div className="dashboard-card">
                    <h3>Wishlist Items</h3>
                    <div className="dashboard-value">4</div>
                    <Link to="/wishlist" className="dashboard-link">Go to Wishlist <FaChevronRight size={10} /></Link>
                </div>
                <div className="dashboard-card">
                    <h3>Otaku Points</h3>
                    <div className="dashboard-value">850</div>
                    <Link to="#" className="dashboard-link">Redeem <FaChevronRight size={10} /></Link>
                </div>
            </div>
            <div className="recent-orders">
                <h3>Recent Notifications</h3>
                <div className="empty-placeholder">
                    <p>No new notifications at the moment.</p>
                </div>
            </div>
        </>
    );

    const renderProfile = () => {
        if (editMode === 'profile') {
            return (
                <>
                    <div className="content-header">
                        <h2>Edit Profile</h2>
                    </div>
                    <form onSubmit={handleSaveProfile}>
                        <div className="edit-form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" defaultValue={userProfile.fullName} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input type="text" className="form-input" defaultValue={userProfile.mobile} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email ID</label>
                                <input type="email" className="form-input" defaultValue={userProfile.email} placeholder="Add Email" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" defaultValue={userProfile.gender}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" className="form-input" defaultValue={userProfile.dob} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-input" defaultValue={userProfile.location} placeholder="Add Location" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Alternate Mobile</label>
                                <input type="text" className="form-input" defaultValue={userProfile.altMobile} placeholder="Add Alternate Mobile" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hint Name</label>
                                <input type="text" className="form-input" defaultValue={userProfile.hintName} placeholder="Add Hint Name" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                            <button type="submit" className="btn-save">Save Details</button>
                        </div>
                    </form>
                </>
            );
        }

        return (
            <>
                <div className="content-header">
                    <h2>Profile Details</h2>
                </div>
                <div className="profile-details-table">
                    <div className="detail-row">
                        <div className="detail-label">Full Name</div>
                        <div className="detail-value">{userProfile.fullName || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Mobile Number</div>
                        <div className="detail-value">{userProfile.mobile || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Email ID</div>
                        <div className="detail-value">{userProfile.email || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Gender</div>
                        <div className="detail-value">{userProfile.gender || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Date of Birth</div>
                        <div className="detail-value">{userProfile.dob || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Location</div>
                        <div className="detail-value">{userProfile.location || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Alternate Mobile</div>
                        <div className="detail-value">{userProfile.altMobile || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Hint Name</div>
                        <div className="detail-value">{userProfile.hintName || '- not added -'}</div>
                    </div>
                </div>
                <button className="btn-edit-profile" onClick={handleEditProfile}>Edit</button>
            </>
        );
    };

    const renderAddresses = () => {
        if (editMode === 'address') {
            return (
                <>
                    <div className="content-header">
                        <h2>Add New Address</h2>
                    </div>
                    <form onSubmit={handleSaveAddress}>
                        <div className="edit-form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-input" placeholder="Name" />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-input" placeholder="Address (House No, Building, Street, Area)" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" className="form-input" placeholder="City" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input type="text" className="form-input" placeholder="State" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input type="text" className="form-input" placeholder="Pincode" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile</label>
                                <input type="text" className="form-input" placeholder="Mobile" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                            <button type="submit" className="btn-save">Save Address</button>
                        </div>
                    </form>
                </>
            );
        }

        return (
            <>
                <div className="content-header">
                    <h2>Saved Addresses</h2>
                    <button className="address-btn edit" onClick={handleAddAddress} style={{ fontSize: '0.9rem' }}>+ Add New</button>
                </div>

                <div className="address-grid">
                    <button className="btn-add-new-address" onClick={handleAddAddress}>
                        + Add New Address
                    </button>

                    {addresses.map(addr => (
                        <div className={`address-card ${addr.isDefault ? 'default' : ''}`} key={addr.id}>
                            <div className="address-name">
                                {addr.name}
                                {addr.isDefault && <span className="badge-default">DEFAULT</span>}
                            </div>
                            <div className="address-text">{addr.address}</div>
                            <div className="address-mobile">Mobile: <strong>{addr.mobile}</strong></div>
                            <div className="address-actions">
                                <button className="address-btn edit" onClick={handleAddAddress}>EDIT</button>
                                <button className="address-btn remove">REMOVE</button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    const demoOrders = [
        {
            id: "ORD-2024-889",
            date: "Oct 12, 2024",
            status: "delivered",
            total: "₹6,640",
            items: ["Demon Slayer Haori", "Naruto Headband"],
            images: [
                '/src/assets/images/products/Haori.jpg',
                '/src/assets/images/products/naruto-actionfigure.jpg',
            ]
        },
        {
            id: "ORD-2024-762",
            date: "Sep 28, 2024",
            status: "shipped",
            total: "₹996",
            items: ["AOT Jacket"],
            images: [
                '/src/assets/images/products/AOT-jackate.jpg',
            ]
        },
        {
            id: "ORD-2024-554",
            date: "Sep 15, 2024",
            status: "processing",
            total: "₹12,076",
            items: ["Luffy Gear5 Action Figure", "Yuji Jacket"],
            images: [
                '/src/assets/images/products/luffy-gear5-action-figure.png',
                '/src/assets/images/products/yuji-jackate.jpg',
                '/src/assets/images/products/JJK-manga.jpg',
            ]
        }
    ];

    const renderOrders = () => (
        <>
            <div className="content-header">
                <h2>Orders & Returns</h2>
            </div>
            <div className="orders-list">
                {demoOrders.map(order => (
                    <div key={order.id} className="order-card" style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px',
                        background: 'var(--color-surface, #fff)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            {/* Product image thumbnails */}
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                {[order.images[0]].map((img, i) => (
                                    <div key={i} style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border, #e2e8f0)',
                                        background: '#f1f5f9',
                                        flexShrink: 0
                                    }}>
                                        <img
                                            src={img}
                                            alt={order.items[i] || 'Product'}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                ))}
                                {false && (
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '10px',
                                        border: '1px solid var(--border, #e2e8f0)',
                                        background: '#f1f5f9', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: '700', color: '#64748b'
                                    }}>+{order.images.length - 3}</div>
                                )}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', color: 'var(--color-text)' }}>{order.items[0]} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h4>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                    Order #{order.id} &middot; {order.date}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '4px' }}>
                                    {order.total}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span className={`ot-status-badge ${order.status}`} style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                fontWeight: '700',
                                marginBottom: '12px',
                                background: order.status === 'delivered' ? '#def7ec' : '#e1effe',
                                color: order.status === 'delivered' ? '#03543f' : '#1e429f'
                            }}>
                                {order.status}
                            </span>
                            <br />
                            <Link to={`/order-tracking?orderId=${order.id}`} className="btn-track" style={{
                                textDecoration: 'none',
                                color: 'var(--color-primary)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                border: '1px solid var(--color-primary)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                display: 'inline-block',
                                marginTop: '8px',
                                transition: 'all 0.2s'
                            }}>
                                Track Order
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderEmpty = (title) => (
        <>
            <div className="content-header">
                <h2>{title}</h2>
            </div>
            <div className="empty-placeholder">
                <p>You have no {title.toLowerCase()} yet.</p>
                <Link to="/products" className="btn primary" style={{ marginTop: '16px', display: 'inline-block' }}>Start Shopping</Link>
            </div>
        </>
    );

    // Sidebar Config
    return (
        <main className="account-container">
            <div className="account-layout">
                {/* SIDEBAR */}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <h3>Account</h3>
                        <div className="user-name">{userProfile.fullName || 'User'}</div>
                    </div>

                    <ul className="sidebar-menu">
                        <li className="sidebar-section">
                            <button
                                className={`sidebar-btn ${activeSection === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveSection('overview')}
                            >
                                <FaThLarge style={{ marginRight: '10px' }} /> Overview
                            </button>
                        </li>

                        <li className="sidebar-section">
                            <div className="section-label">ORDERS</div>
                            <button
                                className={`sidebar-btn ${activeSection === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveSection('orders')}
                            >
                                <FaBox style={{ marginRight: '10px' }} /> Orders & Returns
                            </button>
                        </li>

                        <li className="sidebar-section">
                            <div className="section-label">ACCOUNT</div>
                            <button
                                className={`sidebar-btn ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('profile'); setEditMode(null); }}
                            >
                                <FaUser style={{ marginRight: '10px' }} /> Profile
                            </button>
                            <button
                                className={`sidebar-btn ${activeSection === 'addresses' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('addresses'); setEditMode(null); }}
                            >
                                <FaMapMarkerAlt style={{ marginRight: '10px' }} /> Addresses
                            </button>

                            <Link to="/logout" className="sidebar-btn logout">
                                <FaSignOutAlt style={{ marginRight: '10px' }} /> Logout
                            </Link>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT */}
                <section className="account-content">
                    {activeSection === 'overview' && renderOverview()}
                    {activeSection === 'orders' && renderOrders()}
                    {activeSection === 'profile' && renderProfile()}
                    {activeSection === 'addresses' && renderAddresses()}
                </section>
            </div>
        </main>
    );
}
