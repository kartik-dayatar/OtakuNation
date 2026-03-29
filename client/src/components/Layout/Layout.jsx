import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

import './Layout.css';

/**
 * Layout – used for PUBLIC pages (home, shop, new-arrivals, contact, etc.)
 * Header variant="pre-login" → shows Sign In + Sign Up buttons.
 */
function Layout() {
    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <Header variant="pre-login" />

                <main className="page-transition-wrapper">
                    <Outlet />
                </main>

                <Footer />
            </div>

        </div>
    );
}

export default Layout;
