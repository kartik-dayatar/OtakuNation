import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import Layout from './components/Layout/Layout';
import PostLoginLayout from './components/Layout/PostLoginLayout';
import RequireAdmin from './components/Layout/RequireAdmin';
import { ToastProvider } from './components/ui/Toast';
import useAuthStore from './store/authStore';

// ── General Pages ──────────────────────────────────────────────────────────
const Home         = lazy(() => import('./pages/General/Home'));
const Contact      = lazy(() => import('./pages/General/Contact'));
const GiftCards    = lazy(() => import('./pages/General/GiftCards'));
const NotFound     = lazy(() => import('./pages/General/NotFound'));

// ── Shop Pages ─────────────────────────────────────────────────────────────
const Products      = lazy(() => import('./pages/Shop/Products'));
const ProductDetail = lazy(() => import('./pages/Shop/ProductDetail'));
const NewArrivals   = lazy(() => import('./pages/Shop/NewArrivals'));

// ── Checkout Pages ─────────────────────────────────────────────────────────
const Cart              = lazy(() => import('./pages/Checkout/Cart'));
const Checkout          = lazy(() => import('./pages/Checkout/Checkout'));
const Payment           = lazy(() => import('./pages/Checkout/Payment'));
const OrderConfirmation = lazy(() => import('./pages/Checkout/OrderConfirmation'));

// ── User Pages ─────────────────────────────────────────────────────────────
const Account       = lazy(() => import('./pages/User/Account'));
const OrderTracking = lazy(() => import('./pages/User/OrderTracking'));
const Wishlist      = lazy(() => import('./pages/User/Wishlist'));
const MyOrders      = lazy(() => import('./pages/User/MyOrders'));
const AddReview     = lazy(() => import('./pages/User/AddReview'));

// ── Auth Pages ─────────────────────────────────────────────────────────────
const Login          = lazy(() => import('./pages/Auth/Login'));
const Register       = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const AdminLogin     = lazy(() => import('./pages/Auth/AdminLogin'));

// ── Admin Pages ────────────────────────────────────────────────────────────
const AdminLayout     = lazy(() => import('./components/Layout/Admin/AdminLayout'));
const Dashboard       = lazy(() => import('./pages/Admin/Dashboard'));
const Inventory       = lazy(() => import('./pages/Admin/Inventory'));
const AdminAddProduct = lazy(() => import('./pages/Admin/AdminAddProduct'));
const AdminOrders     = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminCustomers  = lazy(() => import('./pages/Admin/AdminCustomers'));
const AdminSettings   = lazy(() => import('./pages/Admin/AdminSettings'));
const ProductForm     = lazy(() => import('./pages/Admin/ProductForm'));
const AdminOrderDetails   = lazy(() => import('./pages/Admin/AdminOrderDetails'));
const AdminCustomerDetails = lazy(() => import('./pages/Admin/AdminCustomerDetails'));

// ── Logout component – clears auth and redirects ───────────────────────────
function Logout() {
    const logout = useAuthStore((s) => s.logout);
    logout();
    return <Navigate to="/" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <Suspense fallback={null}>
                    <Routes>
                        {/*
                         * ── PUBLIC pages – PRE-LOGIN navbar ──────────────
                         * Accessible without being logged in.
                         */}
                        <Route element={<Layout />}>
                            <Route path="/"             element={<Home />} />
                            <Route path="/home"         element={<Navigate to="/" replace />} />
                            <Route path="/products"     element={<Products />} />
                            <Route path="/product/:id"  element={<ProductDetail />} />
                            <Route path="/new-arrivals" element={<NewArrivals />} />
                            <Route path="/contact"      element={<Contact />} />
                            <Route path="/gift-cards"   element={<GiftCards />} />
                            <Route path="/login"        element={<Login />} />
                            <Route path="/register"     element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/logout"       element={<Logout />} />
                            <Route path="*"             element={<NotFound />} />
                        </Route>

                        {/*
                         * ── PRIVATE pages – POST-LOGIN navbar ────────────
                         */}
                        <Route element={<PostLoginLayout />}>
                            <Route path="/cart"               element={<Cart />} />
                            <Route path="/checkout"           element={<Checkout />} />
                            <Route path="/payment"            element={<Payment />} />
                            <Route path="/order-confirmation" element={<OrderConfirmation />} />
                            <Route path="/account"            element={<Account />} />
                            <Route path="/order-tracking"     element={<OrderTracking />} />
                            <Route path="/wishlist"           element={<Wishlist />} />
                            <Route path="/orders"             element={<MyOrders />} />
                            <Route path="/add-review/:productId" element={<AddReview />} />
                        </Route>

                        {/* ── Admin Login (public, no layout wrapper) ────── */}
                        <Route path="/admin-login" element={<AdminLogin />} />

                        {/* ── Admin – protected by RequireAdmin guard ─────── */}
                        <Route element={<RequireAdmin />}>
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index                    element={<Dashboard />} />
                                <Route path="inventory"         element={<Inventory />} />
                                <Route path="inventory/new"     element={<AdminAddProduct />} />
                                <Route path="inventory/edit/:id" element={<ProductForm />} />
                                <Route path="orders"            element={<AdminOrders />} />
                                <Route path="orders/:id"        element={<AdminOrderDetails />} />
                                <Route path="customers"         element={<AdminCustomers />} />
                                <Route path="customers/:id"     element={<AdminCustomerDetails />} />
                                <Route path="settings"          element={<AdminSettings />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;