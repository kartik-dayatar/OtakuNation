import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    return (
        <main className="error-container">
            <div className="error-code">404</div>
            <h1 className="error-message">Lost in the Multiverse?</h1>
            <p className="error-desc">
                The page you are looking for seems to have vanished like a ninja in the night.
                It might have been moved, deleted, or never existed.
            </p>
            <Link to="/home" className="btn primary">
                Go Back Home
            </Link>
        </main>
    );
}
