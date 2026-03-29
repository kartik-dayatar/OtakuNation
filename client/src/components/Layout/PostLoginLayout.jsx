import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

import './Layout.css';

/**
 * PostLoginLayout – used for pages that require the user to be logged in.
 * It renders the same structure as Layout but tells Header to show the
 * post-login navbar (username pill + logout instead of Sign In / Sign Up).
 */
function PostLoginLayout() {
    const location = useLocation();

    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <Header variant="post-login" />

                <main className="page-transition-wrapper">
                    <Outlet />
                </main>

                <Footer />
            </div>

        </div>
    );
}

export default PostLoginLayout;
