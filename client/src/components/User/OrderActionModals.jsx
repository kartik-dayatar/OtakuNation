import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export const CancelOrderModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('Changed my mind');
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        "Changed my mind",
        "Ordered by mistake",
        "Found better price elsewhere",
        "Delivery too slow",
        "Other"
    ];

    return (
        <div className="ot-modal-overlay">
            <div className="ot-modal-content">
                <button className="ot-modal-close" onClick={onClose}><FaTimes /></button>
                <div className="ot-modal-header">
                    <div className="ot-modal-icon cancel"><FaExclamationTriangle /></div>
                    <h2>Cancel Order?</h2>
                </div>
                <p className="ot-modal-body">
                    Are you sure you want to cancel this order? This action cannot be undone.
                </p>

                <div className="ot-form-group">
                    <label>Reason for cancellation</label>
                    <select 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        className="ot-modal-select"
                    >
                        {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {reason === 'Other' && (
                    <div className="ot-form-group">
                        <textarea
                            placeholder="Please specify your reason..."
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            className="ot-modal-textarea"
                            rows={3}
                        />
                    </div>
                )}

                <div className="ot-modal-actions">
                    <button className="btn ghost" onClick={onClose} disabled={loading}>Keep Order</button>
                    <button 
                        className="btn danger" 
                        onClick={() => onConfirm(reason === 'Other' ? otherReason : reason)}
                        disabled={loading || (reason === 'Other' && !otherReason.trim())}
                    >
                        {loading ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ReturnOrderModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('Item damaged or defective');
    const [otherReason, setOtherReason] = useState('');

    if (!isOpen) return null;

    const reasons = [
        "Item damaged or defective",
        "Wrong item received",
        "Item not as described",
        "Changed my mind",
        "Other"
    ];

    return (
        <div className="ot-modal-overlay">
            <div className="ot-modal-content">
                <button className="ot-modal-close" onClick={onClose}><FaTimes /></button>
                <div className="ot-modal-header">
                    <h2>Request Return</h2>
                </div>
                <p className="ot-modal-body">
                    Tell us why you want to return this order.
                </p>

                <div className="ot-form-group">
                    <label>Reason for return</label>
                    <select 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        className="ot-modal-select"
                    >
                        {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {reason === 'Other' && (
                    <div className="ot-form-group">
                        <textarea
                            placeholder="Please specify your reason..."
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            className="ot-modal-textarea"
                            rows={3}
                        />
                    </div>
                )}

                <p className="ot-modal-note">
                    <strong>Note:</strong> Our team will review your request within 24-48 hours and contact you.
                </p>

                <div className="ot-modal-actions">
                    <button className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button 
                        className="btn orange" 
                        onClick={() => onConfirm(reason === 'Other' ? otherReason : reason)}
                        disabled={loading || (reason === 'Other' && !otherReason.trim())}
                    >
                        {loading ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};
