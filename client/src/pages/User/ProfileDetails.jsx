import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

export default function ProfileDetails() {
    const { user, fetchProfile, updateProfile, loading } = useAuthStore();
    const [editMode, setEditMode] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [profileForm, setProfileForm] = useState({
        firstName: '', lastName: '', mobile: '', altMobile: '', 
        email: '', gender: 'MALE', dob: '', location: '', hintName: ''
    });

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleEditProfile = () => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                mobile: user.mobile || '',
                altMobile: user.altMobile || '',
                email: user.email || '',
                gender: user.gender || 'MALE',
                dob: user.dob ? user.dob.split('T')[0] : '',
                location: user.location || '',
                hintName: user.hintName || ''
            });
        }
        setEditMode(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const res = await updateProfile(profileForm);
        if (res.success) {
            setEditMode(false);
            setFeedback("Profile updated successfully!");
            setTimeout(() => setFeedback(null), 3000);
        } else {
            alert(res.message || "Failed to update");
        }
    };

    if (!user) return null;

    const displayFields = [
        { label: 'Full Name', value: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() },
        { label: 'Mobile Number', value: user.mobile },
        { label: 'Email ID', value: user.email },
        { label: 'Gender', value: user.gender },
        { label: 'Date of Birth', value: user.dob ? new Date(user.dob).toLocaleDateString() : null },
        { label: 'Location', value: user.location }
    ];

    const filledCount = displayFields.filter(f => f.value).length;
    const completeness = Math.round((filledCount / displayFields.length) * 100);

    if (editMode) {
        return (
            <>
                <h2 className="section-title">Edit Profile</h2>
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
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : 'Save Details'}</button>
                    </div>
                </form>
            </>
        );
    }

    return (
        <>
            <h2 className="section-title">Profile Details</h2>

            {/* Profile Completeness */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Profile {completeness}% complete</span>
                    {feedback && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>{feedback}</span>}
                </div>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${completeness}%`, background: '#3b82f6', transition: 'width 0.5s ease' }}></div>
                </div>
            </div>
            
            <div className="profile-rows" style={{ display: 'flex', flexDirection: 'column' }}>
                {displayFields.map((field, idx) => (
                    <div key={idx} style={{ 
                        paddingBottom: '16px', 
                        marginBottom: '16px', 
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <label style={{ 
                            fontSize: '11px', 
                            textTransform: 'uppercase', 
                            color: '#9ca3af', 
                            fontWeight: '700', 
                            letterSpacing: '0.08em' 
                        }}>
                            {field.label}
                        </label>
                        <span style={{ 
                            fontSize: '15px', 
                            color: field.value ? '#111827' : '#d1d5db', 
                            fontWeight: '500',
                            fontStyle: field.value ? 'normal' : 'italic'
                        }}>
                            {field.value || '- not added -'}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleEditProfile}>
                    Edit Profile
                </button>
                <button className="btn-cancel" style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb' }}>
                    Change Password
                </button>
            </div>
        </>
    );
}
