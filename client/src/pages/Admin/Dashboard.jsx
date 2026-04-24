import React, { useEffect, useState } from 'react';
import {
    IndianRupee,
    Package,
    TrendingUp,
    TrendingDown,
    Users,
    ChevronRight,
    MoreVertical,
    Download,
    RefreshCw,
    Clock,
    Calendar,
    AlertTriangle,
    ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import useAuthStore from '../../store/authStore';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { stats, loading, fetchDashboardStats } = useAdminStore();
    const user = useAuthStore(state => state.user);
    const [activeRange, setActiveRange] = useState('Monthly');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchDashboardStats();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [fetchDashboardStats]);

    // ── Helpers ───────────────────────────────────────────
    const fmtCurrency = (val) =>
        `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const fmtCompact = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000)   return `₹${(val / 1000).toFixed(2)}k`;
        return `₹${Number(val).toFixed(2)}`;
    };

    // ── Chart helpers ─────────────────────────────────────
    // Build normalised SVG Y coords (0=top → height=bottom) from an array of values
    const normalise = (arr, key = 'revenue', height = 150) => {
        const safeArr = arr || [];
        const vals = safeArr.map(d => d[key] || 0);
        const max  = Math.max(...vals, 1);
        return vals.map(v => height - (v / max) * height);
    };

    // Build smooth SVG path from y-points (guard against 0-length / 1-length)
    const buildPath = (ys, width = 1000) => {
        if (!ys || ys.length === 0) return 'M0,150';
        if (ys.length === 1) return `M0,${ys[0]}`;
        const step = width / (ys.length - 1);
        return ys.map((y, i) => (i === 0 ? `M0,${y}` : `C${(i - 0.5) * step},${ys[i - 1]} ${(i - 0.5) * step},${y} ${i * step},${y}`)).join(' ');
    };

    // ── Safe array refs ────────────────────────────────────
    const safeWeekly   = stats.weeklyData   || [];
    const safeMonthly  = stats.monthlyData  || [];
    const safeBreakdown = stats.statusBreakdown || [];
    const safeTopSelling = stats.topSelling  || [];

    const weeklyYs  = safeWeekly.length  ? normalise(safeWeekly,  'revenue', 140) : Array(7).fill(140);
    const monthlyYs = safeMonthly.length ? normalise(safeMonthly, 'revenue', 140) : Array(12).fill(140);

    // ── Area chart path ───────────────────────────────────
    const buildAreaPath = (ys, w = 1000, h = 150) => {
        const line = buildPath(ys, w);
        const lastX = w;
        const lastY = ys[ys.length - 1];
        return `${line} L${lastX},${h} L0,${h} Z`;
    };

    const activeYs       = activeRange === 'Monthly' ? weeklyYs : monthlyYs;
    const activeLinePath = buildPath(activeYs, 1000);
    const activeAreaPath = buildAreaPath(activeYs, 1000, 150);

    // ── Doughnut ──────────────────────────────────────────
    const CIRCUMFERENCE = 2 * Math.PI * 38; // r=38
    const STATUSES = [
        { key: 'delivered',        color: '#22c55e', label: 'Delivered' },
        { key: 'processing',       color: '#6366f1', label: 'Processing' },
        { key: 'shipped',          color: '#3b82f6', label: 'Shipped' },
        { key: 'confirmed',        color: '#f59e0b', label: 'Confirmed' },
        { key: 'cancelled',        color: '#ef4444', label: 'Cancelled' },
        { key: 'returned',         color: '#8b5cf6', label: 'Returned' },
        { key: 'out_for_delivery', color: '#06b6d4', label: 'Out for Delivery' },
    ];

    const statusTotal = safeBreakdown.reduce((s, item) => s + item.count, 0) || 1;
    let   offset       = 0;
    const doughnutArcs = STATUSES.map(s => {
        const item  = safeBreakdown.find(b => b._id === s.key);
        const count = item ? item.count : 0;
        const dash  = (count / statusTotal) * CIRCUMFERENCE;
        const arc   = { ...s, count, dash, gap: CIRCUMFERENCE - dash, offset };
        offset += dash;
        return arc;
    }).filter(a => a.count > 0);

    // ── Weekly range bars ─────────────────────────────────
    const weeklyRevMax = Math.max(...safeWeekly.map(d => d.revenue || 0), 1);

    // ── Growth indicator ──────────────────────────────────
    const growth = stats.growthPercent || 0;
    const isPositiveGrowth = growth >= 0;

    // ── Image URL helper ──────────────────────────────────
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    };

    return (
        <div className="admin-dashboard-v2">

            {/* Header */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Dashboard</h1>
                    <p className="dash-sub">Welcome back, {user?.firstName || 'Admin'}! Here's your store today.</p>
                </div>
                <div className="dash-header-right">
                    <span className="dash-time">
                        <Calendar size={14} />
                        {currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="dash-time">
                        <Clock size={14} />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="dash-refresh-btn" onClick={fetchDashboardStats} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                        {loading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* ── 2×2 Stats Grid ── */}
            <div className="stats-grid-2x2">
                {/* Revenue */}
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-card-icon revenue"><IndianRupee size={20} /></div>
                        <span className="stat-card-label">Total Revenue</span>
                    </div>
                    <div className="stat-card-value">{fmtCompact(stats.revenue)}</div>
                    <div className="stat-card-sub">
                        This month: <strong>{fmtCompact(stats.thisMonthRevenue)}</strong>
                    </div>
                    <div className={`stat-card-badge ${isPositiveGrowth ? 'positive' : 'negative'}`}>
                        {isPositiveGrowth ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(growth).toFixed(1)}% vs last month
                    </div>
                </div>

                {/* Orders */}
                <div className="stat-card clickable" onClick={() => navigate('/admin/orders')}>
                    <div className="stat-card-top">
                        <div className="stat-card-icon orders"><Package size={20} /></div>
                        <span className="stat-card-label">Total Orders</span>
                    </div>
                    <div className="stat-card-value">{stats.orders.toLocaleString()}</div>
                    <div className="stat-card-sub">
                        Pending: <strong>{stats.pendingOrders}</strong>
                    </div>
                    <div className="stat-card-badge neutral">
                        <ShoppingBag size={12} />
                        Today: {stats.todayOrders} orders
                    </div>
                </div>

                {/* Customers */}
                <div className="stat-card clickable" onClick={() => navigate('/admin/customers')}>
                    <div className="stat-card-top">
                        <div className="stat-card-icon customers"><Users size={20} /></div>
                        <span className="stat-card-label">Customers</span>
                    </div>
                    <div className="stat-card-value">{stats.customers.toLocaleString()}</div>
                    <div className="stat-card-sub">Total registered customers</div>
                    <div className="stat-card-badge info">
                        <Users size={12} />
                        Active accounts
                    </div>
                </div>

                {/* Low Stock */}
                <div className="stat-card clickable" onClick={() => navigate('/admin/inventory')}>
                    <div className="stat-card-top">
                        <div className="stat-card-icon alerts"><AlertTriangle size={20} /></div>
                        <span className="stat-card-label">Low Stock Items</span>
                    </div>
                    <div className="stat-card-value">{stats.lowStockItems}</div>
                    <div className="stat-card-sub">Products below threshold</div>
                    <div className={`stat-card-badge ${stats.lowStockItems > 0 ? 'negative' : 'positive'}`}>
                        <AlertTriangle size={12} />
                        {stats.lowStockItems > 0 ? 'Restock needed' : 'All stocked up'}
                    </div>
                </div>
            </div>

            {/* ── Middle Row: Doughnut + Weekly ── */}
            <div className="dash-middle-row">

                {/* Store Performance Doughnut */}
                <div className="dash-card performance-card">
                    <div className="dash-card-header">
                        <h3 className="dash-card-title">Order Status Breakdown</h3>
                        <button className="icon-btn" onClick={fetchDashboardStats}><RefreshCw size={14} /></button>
                    </div>

                    {doughnutArcs.length === 0 ? (
                        <div className="empty-chart">No order data yet</div>
                    ) : (
                        <div className="doughnut-wrap">
                            <svg viewBox="0 0 100 100" className="doughnut-svg">
                                {/* Background track */}
                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                                {/* Arcs */}
                                {doughnutArcs.map((arc, i) => (
                                    <circle key={arc.key}
                                        cx="50" cy="50" r="38"
                                        fill="transparent"
                                        stroke={arc.color}
                                        strokeWidth="10"
                                        strokeDasharray={`${arc.dash} ${arc.gap}`}
                                        strokeDashoffset={-arc.offset}
                                        strokeLinecap="butt"
                                        transform="rotate(-90 50 50)"
                                    />
                                ))}
                                <text x="50" y="46" textAnchor="middle" fontSize="7" fill="#94a3b8">Total</text>
                                <text x="50" y="58" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">{statusTotal}</text>
                            </svg>
                            <div className="doughnut-legend">
                                {doughnutArcs.map(arc => (
                                    <div key={arc.key} className="legend-item">
                                        <span className="legend-dot" style={{ background: arc.color }}></span>
                                        <span className="legend-label">{arc.label}</span>
                                        <span className="legend-count">{arc.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Weekly Performance */}
                <div className="dash-card weekly-card">
                    <div className="dash-card-header">
                        <h3 className="dash-card-title">Weekly Revenue</h3>
                        <span className="dash-card-sub-text">Last 7 days</span>
                    </div>
                    <div className="weekly-bars">
                        {safeWeekly.length > 0 ? safeWeekly.map((d, i) => {
                            const pct = weeklyRevMax > 0 ? (d.revenue / weeklyRevMax) * 100 : 0;
                            return (
                                <div key={i} className="weekly-bar-col">
                                    <div className="weekly-bar-track">
                                        <div
                                            className="weekly-bar-fill"
                                            style={{ height: `${Math.max(pct, 2)}%` }}
                                            title={`${d.day}: ${fmtCurrency(d.revenue)}`}
                                        ></div>
                                    </div>
                                    <span className="weekly-bar-label">{d.day}</span>
                                    <span className="weekly-bar-val">{d.orders > 0 ? `${d.orders}` : '–'}</span>
                                </div>
                            );
                        }) : (
                            <div className="empty-chart">No weekly data yet</div>
                        )}
                    </div>
                    {safeWeekly.length > 0 && (
                        <div className="weekly-total">
                            Week revenue: <strong>{fmtCompact(safeWeekly.reduce((s, d) => s + d.revenue, 0))}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Row: Sales Area Chart + Top Selling ── */}
            <div className="dash-bottom-row">

                {/* Sales Report */}
                <div className="dash-card sales-card">
                    <div className="dash-card-header">
                        <div>
                            <h3 className="dash-card-title">Sales Report</h3>
                            <p className="dash-card-sub-text">{stats.orders} total orders • {fmtCompact(stats.revenue)} total revenue</p>
                        </div>
                        <div className="report-tabs">
                            {['Today', 'Monthly', 'Annual'].map(r => (
                                <button key={r} className={activeRange === r ? 'active' : ''} onClick={() => setActiveRange(r)}>{r}</button>
                            ))}
                        </div>
                    </div>

                    {/* Key Metrics for Range */}
                    <div className="report-kpis">
                        <div className="report-kpi">
                            <span className="kpi-label">Revenue</span>
                            <strong className="kpi-value blue">
                                {activeRange === 'Today'
                                    ? fmtCompact(stats.todayRevenue)
                                    : activeRange === 'Monthly'
                                    ? fmtCompact(stats.thisMonthRevenue)
                                    : fmtCompact(stats.revenue)}
                            </strong>
                        </div>
                        <div className="report-kpi">
                            <span className="kpi-label">Orders</span>
                            <strong className="kpi-value green">
                                {activeRange === 'Today'
                                    ? stats.todayOrders
                                    : activeRange === 'Monthly'
                                    ? stats.thisMonthOrders
                                    : stats.orders}
                            </strong>
                        </div>
                        <div className="report-kpi">
                            <span className="kpi-label">Growth</span>
                            <strong className={`kpi-value ${isPositiveGrowth ? 'teal' : 'red'}`}>
                                {isPositiveGrowth ? '+' : ''}{growth.toFixed(2)}%
                            </strong>
                        </div>
                    </div>

                    {/* SVG Area Chart */}
                    <div className="area-chart-wrap">
                        {activeRange === 'Today' ? (
                            <div className="empty-chart" style={{ height: 140 }}>
                                Today revenue: <strong>{fmtCurrency(stats.todayRevenue)}</strong>
                            </div>
                        ) : (
                            <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="area-svg">
                                <defs>
                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={activeAreaPath} fill="url(#salesGrad)" />
                                <path d={activeLinePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Dots at data points */}
                                {activeYs.map((y, i) => (
                                    <circle key={i}
                                        cx={(i / (activeYs.length - 1)) * 1000}
                                        cy={y}
                                        r="4"
                                        fill="#fff"
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                    />
                                ))}
                            </svg>
                        )}
                        {activeRange !== 'Today' && (
                            <div className="chart-x-labels">
                                {(activeRange === 'Monthly' ? safeWeekly : safeMonthly).map((d, i) => (
                                    <span key={i}>{activeRange === 'Monthly' ? d.day : d.month}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="dash-card top-selling-card">
                    <div className="dash-card-header">
                        <h3 className="dash-card-title">Top Selling Products</h3>
                        <button className="text-link-btn" onClick={() => navigate('/admin/inventory')}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>

                    {safeTopSelling.length === 0 ? (
                        <div className="empty-chart">No sales data yet</div>
                    ) : (
                        <div className="top-prod-list">
                            {safeTopSelling.map((p, i) => {
                                const imgUrl = getImageUrl(p.productImage);
                                return (
                                    <div key={i} className="top-prod-row">
                                        <span className="rank">#{i + 1}</span>
                                        <div className="top-prod-img">
                                            {imgUrl
                                                ? <img src={imgUrl} alt={p.productName} />
                                                : <div className="img-placeholder"><Package size={16} /></div>}
                                        </div>
                                        <div className="top-prod-info">
                                            <h4>{p.productName}</h4>
                                            <span>{p.totalQty} units sold</span>
                                        </div>
                                        <div className="top-prod-right">
                                            <strong>{fmtCompact(p.totalRevenue)}</strong>
                                            <span>revenue</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
