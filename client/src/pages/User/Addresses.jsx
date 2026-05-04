import React, { useState, useEffect } from 'react';
import { MapPin, Home, Briefcase, Map, Trash2, Edit2, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Addresses() {
    const { user, fetchProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, loading } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [currentAddrId, setCurrentAddrId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [addressForm, setAddressForm] = useState({
        recipientName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', phone: '', type: 'HOME'
    });

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleAddAddress = () => {
        setAddressForm({ recipientName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', phone: '', type: 'HOME' });
        setCurrentAddrId(null);
        setEditMode(true);
    };

    const handleEditClick = (addr) => {
        setAddressForm({
            recipientName: addr.recipientName || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            phone: addr.phone || '',
            type: addr.type || 'HOME'
        });
        setCurrentAddrId(addr._id);
        setEditMode(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        let res;
        if (currentAddrId) {
            res = await updateAddress(currentAddrId, addressForm);
        } else {
            res = await addAddress({ ...addressForm, country: 'India' });
        }

        if (res.success) {
            setEditMode(false);
            setFeedback(currentAddrId ? "Address updated successfully!" : "Address added successfully!");
            setTimeout(() => setFeedback(null), 3000);
        } else {
            alert(res.message || "Failed to save address");
        }
    };

    const handleSetDefault = async (id) => {
        const res = await setDefaultAddress(id);
        if (res.success) {
            setFeedback("Default address updated!");
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm("Are you sure you want to remove this address?")) {
            await deleteAddress(id);
        }
    };

    if (!user) return null;
    const addresses = user.addresses || [];

    if (editMode) {
        return (
            <>
                <h2 className="section-title">{currentAddrId ? 'Edit Address' : 'Add New Address'}</h2>
                <form onSubmit={handleSaveAddress}>
                    <div className="edit-form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">Address Type</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {['HOME', 'WORK', 'OTHER'].map(t => (
                                    <button 
                                        key={t}
                                        type="button"
                                        onClick={() => setAddressForm({...addressForm, type: t})}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid',
                                            borderColor: addressForm.type === t ? '#3b82f6' : '#e5e7eb',
                                            background: addressForm.type === t ? '#eff6ff' : '#fff',
                                            color: addressForm.type === t ? '#3b82f6' : '#6b7280',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" required placeholder="Receiver's Name" 
                                value={addressForm.recipientName} onChange={(e) => setAddressForm({...addressForm, recipientName: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Street Address</label>
                            <input type="text" className="form-input" required placeholder="House No, Building, Street, Area" 
                                value={addressForm.addressLine1} onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})} />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Apartment, floor, landmark (Optional)</label>
                            <input type="text" className="form-input" placeholder="Apt No, Floor, Landmark etc." 
                                value={addressForm.addressLine2} onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})} />
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
                                value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile</label>
                            <input type="text" className="form-input" required placeholder="Mobile" 
                                value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : (currentAddrId ? 'Update Address' : 'Save Address')}</button>
                    </div>
                </form>
            </>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Saved Addresses</h2>
                {feedback && <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>{feedback}</span>}
                {addresses.length > 0 && (
                    <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={handleAddAddress}>
                        + Add New Address
                    </button>
                )}
            </div>

            {addresses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {addresses.map(addr => (
                        <div key={addr._id || addr.id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            background: '#fff',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280' }}>
                                        {addr.type === 'WORK' ? <Briefcase size={18} /> : addr.type === 'HOME' ? <Home size={18} /> : <MapPin size={18} />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{addr.recipientName || addr.name}</span>
                                            <span style={{ 
                                                fontSize: '10px', fontWeight: '700', padding: '2px 8px', background: '#f3f4f6', 
                                                color: '#6b7280', borderRadius: '4px', textTransform: 'uppercase' 
                                            }}>
                                                {addr.type || 'HOME'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="ghost-btn" style={{ padding: '4px', color: '#9ca3af' }} onClick={() => handleEditClick(addr)}><Edit2 size={16} /></button>
                                    <button className="ghost-btn" style={{ padding: '4px', color: '#9ca3af' }} onClick={() => handleDeleteAddress(addr._id)}><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', marginBottom: '12px', minHeight: '42px' }}>
                                {addr.addressLine1 || addr.street}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.city}, {addr.state} - {addr.postalCode || addr.pincode}
                                <div style={{ marginTop: '4px', color: '#111827', fontWeight: '600' }}>Mobile: {addr.phone || addr.mobile}</div>
                            </div>

                            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {addr.isDefault ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: '700' }}>
                                        <CheckCircle size={14} /> DEFAULT ADDRESS
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleSetDefault(addr._id)}
                                        style={{ 
                                            background: 'none', border: 'none', padding: 0, color: '#3b82f6', 
                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer' 
                                        }}
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '64px 0', textAlign: 'center' }}>
                    <MapPin size={56} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>No saved addresses</h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>Add an address to speed up checkout</p>
                    <button className="btn-primary" style={{ padding: '12px 32px', borderRadius: '8px' }} onClick={handleAddAddress}>
                        + Add New Address
                    </button>
                </div>
            )}
        </>
    );
}
