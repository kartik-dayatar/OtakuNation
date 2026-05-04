import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const { user } = useAuthStore();

    React.useEffect(() => {
        if (!orderId) {
            navigate('/shop');
        }
    }, [orderId, navigate]);

    if (!orderId) return null;

    return (
        <main style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px',
            background: '#f9fafb'
        }}>
            <div style={{ 
                maxWidth: '500px', 
                width: '100%', 
                background: '#fff', 
                padding: '48px 32px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                textAlign: 'center'
            }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '80px', 
                    height: '80px', 
                    background: '#ecfdf5', 
                    borderRadius: '50%', 
                    color: '#10b981',
                    marginBottom: '24px'
                }}>
                    <CheckCircle size={48} />
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                    Order Placed Successfully! 🎉
                </h1>
                
                <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                    Thank you for your purchase. We've received your order and we're getting it ready for shipment.
                </p>

                <div style={{ 
                    background: '#f3f4f6', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    marginBottom: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Order ID
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                        {orderId}
                    </div>
                </div>

                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '40px' }}>
                    A confirmation email has been sent to <br/>
                    <strong style={{ color: '#374151' }}>{user?.email}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link to="/account/orders" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        background: '#3b82f6', 
                        color: '#fff', 
                        padding: '14px', 
                        borderRadius: '12px', 
                        fontWeight: '600', 
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                    }}>
                        <Package size={20} /> Track My Order
                    </Link>
                    <Link to="/shop" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        background: '#fff', 
                        color: '#374151', 
                        padding: '14px', 
                        borderRadius: '12px', 
                        fontWeight: '600', 
                        textDecoration: 'none',
                        border: '1px solid #e5e7eb'
                    }}>
                        <ShoppingBag size={20} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    );
}
