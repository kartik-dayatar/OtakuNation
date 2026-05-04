import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, 
    Heart, 
    Bell, 
    ChevronRight 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import useOrderStore from '../../store/orderStore';

export default function AccountOverview() {
    const { user } = useAuthStore();
    const { items: wishlist } = useWishlistStore();
    const { orders, fetchMyOrders } = useOrderStore();
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (token) {
            fetchMyOrders(token);
        }
    }, [fetchMyOrders, token]);

    if (!user) return null;

    return (
        <>
            <div className="page-greeting">
                <h1>Welcome back, {user.firstName || user.fullName?.split(' ')[0] || 'User'} 👋</h1>
                <p>Here's what's happening with your account</p>
            </div>

            <h2 className="section-title">Overview</h2>
            
            <div className="dashboard-grid">
                {/* Total Orders */}
                <div className="stat-card">
                    <div className="card-icon-wrap blue">
                        <Package size={20} />
                    </div>
                    <span className="stat-label">Total Orders</span>
                    <div className="stat-value">{orders.length}</div>
                    <Link to="/account/orders" className="card-footer-link">
                        View all orders <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Wishlist Items */}
                <div className="stat-card">
                    <div className="card-icon-wrap pink">
                        <Heart size={20} />
                    </div>
                    <span className="stat-label">Wishlist Items</span>
                    <div className="stat-value">{wishlist.length}</div>
                    <Link to="/wishlist" className="card-footer-link">
                        Go to Wishlist <ChevronRight size={14} />
                    </Link>
                </div>

            </div>

            <div className="notifications-section">
                <h2 className="section-title">Recent Notifications</h2>
                <div className="empty-notif-state">
                    <Bell size={48} className="empty-notif-icon" />
                    <h3 className="empty-notif-title">All caught up!</h3>
                    <p className="empty-notif-desc">No new notifications at the moment</p>
                </div>
            </div>
        </>
    );
}
