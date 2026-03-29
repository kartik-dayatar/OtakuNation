import React, { useState } from 'react';
import { Save, Globe, IndianRupee, Palette, Mail } from 'lucide-react';
import './AdminSettings.css';
import { useToast } from '../../components/ui/Toast';

function AdminSettings() {
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Mock settings state
    const [settings, setSettings] = useState({
        storeName: 'OtakuNation',
        contactEmail: 'support@otakunation.com',
        phone: '+1 (555) 123-4567',
        currency: 'INR',
        taxRate: '8.5',
        theme: 'System',
        enableReviews: true,
        maintenanceMode: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Mock save delay
        setTimeout(() => {
            setIsSaving(false);
            addToast('Settings saved successfully', 'success');
        }, 800);
    };

    return (
        <div className="admin-settings-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Store Settings</h1>
                    <p className="admin-page-subtitle">Manage your store's global configuration and appearance.</p>
                </div>
                <button 
                    className="btn btn-primary settings-save-btn" 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="settings-grid">
                {/* General Settings */}
                <div className="settings-section card">
                    <div className="settings-section-header">
                        <div className="icon-wrap">
                            <Globe size={20} />
                        </div>
                        <h3>General Information</h3>
                    </div>
                    <div className="settings-section-body">
                        <div className="form-group full-width">
                            <label>Store Name</label>
                            <input 
                                type="text" 
                                name="storeName"
                                value={settings.storeName}
                                onChange={handleChange}
                                className="settings-input"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Contact Email</label>
                            <input 
                                type="email" 
                                name="contactEmail"
                                value={settings.contactEmail}
                                onChange={handleChange}
                                className="settings-input"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={settings.phone}
                                onChange={handleChange}
                                className="settings-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="settings-section card">
                    <div className="settings-section-header">
                        <div className="icon-wrap">
                            <IndianRupee size={20} />
                        </div>
                        <h3>Financial Defaults</h3>
                    </div>
                    <div className="settings-section-body">
                        <div className="form-group full-width">
                            <label>Store Currency</label>
                            <select 
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="settings-input"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Default Tax Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                name="taxRate"
                                value={settings.taxRate}
                                onChange={handleChange}
                                className="settings-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="settings-section card">
                    <div className="settings-section-header">
                        <div className="icon-wrap">
                            <Palette size={20} />
                        </div>
                        <h3>Appearance & Features</h3>
                    </div>
                    <div className="settings-section-body">
                        <div className="form-group full-width">
                            <label>Default Admin Theme</label>
                            <select 
                                name="theme"
                                value={settings.theme}
                                onChange={handleChange}
                                className="settings-input"
                            >
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                                <option value="System">System Default</option>
                            </select>
                        </div>
                        
                        <div className="settings-divider"></div>
                        
                        <div className="toggle-group">
                            <div className="toggle-info">
                                <h4>Enable Product Reviews</h4>
                                <p>Allow customers to leave reviews on products.</p>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    name="enableReviews"
                                    checked={settings.enableReviews}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="toggle-group mt-2">
                            <div className="toggle-info">
                                <h4>Maintenance Mode</h4>
                                <p>Disable storefront access to customers. Admin remains accessible.</p>
                            </div>
                            <label className="toggle-switch danger">
                                <input 
                                    type="checkbox" 
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
