import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaThLarge, FaBox, FaUser, FaMapMarkerAlt, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import './Account.css';

export default function Account() {
    const { user, fetchProfile, updateProfile, addAddress, deleteAddress, loading } = useAuthStore();
    const [activeSection, setActiveSection] = useState('overview');
    const [editMode, setEditMode] = useState(null); // null, 'profile', 'address'
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (activeSection === 'profile' || activeSection === 'addresses') {
            fetchProfile();
        }
    }, [activeSection, fetchProfile]);

    // Local form states
    const [profileForm, setProfileForm] = useState({
        firstName: '', lastName: '', mobile: '', altMobile: '', 
        email: '', gender: 'MALE', dob: '', location: '', hintName: ''
    });

    const [addressForm, setAddressForm] = useState({
        name: '', street: '', city: '', state: '', pincode: '', mobile: ''
    });

    // Helpers
    const handleEditProfile = () => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                mobile: user.mobile || '',
                altMobile: user.altMobile || '',
                email: user.email || '',
                gender: user.gender || 'MALE',
                dob: user.dob ? user.dob.split('T')[0] : '', // Format for date input
                location: user.location || '',
                hintName: user.hintName || ''
            });
        }
        setEditMode('profile');
    };

    const handleCancelEdit = () => setEditMode(null);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const res = await updateProfile(profileForm);
        if (res.success) {
            setEditMode(null);
            setFeedback("Profile updated successfully!");
            setTimeout(() => setFeedback(null), 3000);
        } else {
            alert(res.message || "Failed to update");
        }
    };

    const handleAddAddress = () => {
        setAddressForm({ name: '', street: '', city: '', state: '', pincode: '', mobile: '' });
        setEditMode('address');
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const res = await addAddress(addressForm);
        if (res.success) {
            setEditMode(null);
            setFeedback("Address added successfully!");
            setTimeout(() => setFeedback(null), 3000);
        } else {
            alert(res.message || "Failed to add address");
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm("Are you sure you want to remove this address?")) {
            await deleteAddress(id);
        }
    };

    if (!user) return <div className="account-container"><p>Please log in.</p></div>;

    const addresses = user.addresses || [];

    // Render Functions
    const renderOverview = () => (
        <>
            <div className="content-header">
                <h2>Overview</h2>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total Orders</h3>
                    <div className="dashboard-value">-</div>
                    <Link to="/orders" className="dashboard-link">View all orders <FaChevronRight size={10} /></Link>
                </div>
                <div className="dashboard-card">
                    <h3>Wishlist Items</h3>
                    <div className="dashboard-value">4</div>
                    <Link to="/wishlist" className="dashboard-link">Go to Wishlist <FaChevronRight size={10} /></Link>
                </div>
                <div className="dashboard-card">
                    <h3>Otaku Points</h3>
                    <div className="dashboard-value">{user.otakuPoints || 0}</div>
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
                                <label className="form-label">First Name</label>
                                <input type="text" className="form-input" required 
                                    value={profileForm.firstName} onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input type="text" className="form-input" required 
                                    value={profileForm.lastName} onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input type="text" className="form-input" 
                                    value={profileForm.mobile} onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email ID (Read Only)</label>
                                <input type="email" className="form-input" readOnly disabled
                                    value={profileForm.email} placeholder="Add Email" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" value={profileForm.gender} onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" className="form-input" 
                                    value={profileForm.dob} onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-input" placeholder="Add Location" 
                                    value={profileForm.location} onChange={(e) => setProfileForm({...profileForm, location: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Alternate Mobile</label>
                                <input type="text" className="form-input" placeholder="Add Alternate Mobile" 
                                    value={profileForm.altMobile} onChange={(e) => setProfileForm({...profileForm, altMobile: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hint Name</label>
                                <input type="text" className="form-input" placeholder="Add Hint Name" 
                                    value={profileForm.hintName} onChange={(e) => setProfileForm({...profileForm, hintName: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Saving...' : 'Save Details'}</button>
                        </div>
                    </form>
                </>
            );
        }

        return (
            <>
                <div className="content-header">
                    <h2>Profile Details</h2>
                    {feedback && <span style={{ color: 'green', fontSize: '0.9rem' }}>{feedback}</span>}
                </div>
                <div className="profile-details-table">
                    <div className="detail-row">
                        <div className="detail-label">Full Name</div>
                        <div className="detail-value">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Mobile Number</div>
                        <div className="detail-value">{user.mobile || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Email ID</div>
                        <div className="detail-value">{user.email || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Gender</div>
                        <div className="detail-value">{user.gender || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Date of Birth</div>
                        <div className="detail-value">{user.dob ? new Date(user.dob).toLocaleDateString() : '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Location</div>
                        <div className="detail-value">{user.location || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Alternate Mobile</div>
                        <div className="detail-value">{user.altMobile || '- not added -'}</div>
                    </div>
                    <div className="detail-row">
                        <div className="detail-label">Hint Name</div>
                        <div className="detail-value">{user.hintName || '- not added -'}</div>
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
                                <input type="text" className="form-input" required placeholder="Name" 
                                    value={addressForm.name} onChange={(e) => setAddressForm({...addressForm, name: e.target.value})} />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Street Address</label>
                                <input type="text" className="form-input" required placeholder="Address (House No, Building, Street, Area)" 
                                    value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" className="form-input" required placeholder="City" 
                                    value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input type="text" className="form-input" required placeholder="State" 
                                    value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input type="text" className="form-input" required placeholder="Pincode" 
                                    value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile</label>
                                <input type="text" className="form-input" required placeholder="Mobile" 
                                    value={addressForm.mobile} onChange={(e) => setAddressForm({...addressForm, mobile: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Saving...' : 'Save Address'}</button>
                        </div>
                    </form>
                </>
            );
        }

        return (
            <>
                <div className="content-header">
                    <h2>Saved Addresses</h2>
                    {feedback && <span style={{ color: 'green', fontSize: '0.9rem', marginLeft: '20px' }}>{feedback}</span>}
                    <button className="address-btn edit" onClick={handleAddAddress} style={{ fontSize: '0.9rem' }}>+ Add New</button>
                </div>

                <div className="address-grid">
                    <button className="btn-add-new-address" onClick={handleAddAddress}>
                        + Add New Address
                    </button>

                    {addresses.map(addr => (
                        <div className={`address-card ${addr.isDefault ? 'default' : ''}`} key={addr._id || addr.id}>
                            <div className="address-name">
                                {addr.name}
                                {addr.isDefault && <span className="badge-default">DEFAULT</span>}
                            </div>
                            <div className="address-text">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</div>
                            <div className="address-mobile">Mobile: <strong>{addr.mobile}</strong></div>
                            <div className="address-actions">
                                <button className="address-btn remove" onClick={() => handleDeleteAddress(addr._id)}>REMOVE</button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Sidebar Config
    return (
        <main className="account-container">
            <div className="account-layout">
                {/* SIDEBAR */}
                <aside className="account-sidebar">
                    <div className="sidebar-header">
                        <h3>Account</h3>
                        <div className="user-name">{user.fullName || `${user.firstName} ${user.lastName}`}</div>
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
                            <Link to="/orders" className="sidebar-btn">
                                <FaBox style={{ marginRight: '10px' }} /> Orders & Returns
                            </Link>
                        </li>

                        <li className="sidebar-section">
                            <div className="section-label">ACCOUNT</div>
                            <button
                                className={`sidebar-btn ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('profile'); setEditMode(null); setFeedback(null); }}
                            >
                                <FaUser style={{ marginRight: '10px' }} /> Profile
                            </button>
                            <button
                                className={`sidebar-btn ${activeSection === 'addresses' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('addresses'); setEditMode(null); setFeedback(null); }}
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
                    {activeSection === 'profile' && renderProfile()}
                    {activeSection === 'addresses' && renderAddresses()}
                </section>
            </div>
        </main>
    );
}
