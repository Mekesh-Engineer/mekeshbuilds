// src/pages/NotFoundPage.tsx
// 404 error page with contextual error states.
import { useEffect } from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase/client';
import { Button } from '@/components/common';

export const NotFoundPage: React.FC = () => {
    const error = useRouteError();

    let heading = 'Page not found.';
    let subtext = "The page you're looking for has moved or doesn't exist.";

    if (isRouteErrorResponse(error)) {
        if (error.data?.reason === 'username_not_found') {
            heading = "This portfolio doesn't exist yet.";
            subtext = "The username you're looking for hasn't been claimed.";
        } else if (error.data?.reason === 'not_published') {
            heading = 'This portfolio is currently private.';
            subtext = "The owner hasn't published their portfolio yet.";
        }
    }

    // Log 404 — fire-and-forget
    useEffect(() => {
        addDoc(collection(db, 'error_logs'), {
            path: window.location.pathname,
            referrer: document.referrer || 'direct',
            error_type: '404',
            created_at: new Date().toISOString(),
        }).catch(() => { /* silent */ });
    }, []);

    return (
        <>
            <Helmet>
                <title>Not Found — MekeshBuilds</title>
            </Helmet>

            <div className="flex min-h-screen flex-col items-center justify-center bg-sys-bg-primary px-6">
                {/* Circuit Board SVG Animation */}
                <svg
                    width="200"
                    height="120"
                    viewBox="0 0 200 120"
                    className="mb-8 text-sys-accent opacity-40"
                >
                    <line x1="20" y1="60" x2="90" y2="60" stroke="currentColor" strokeWidth="2" />
                    <line x1="110" y1="60" x2="180" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="100" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="60" r="4" fill="currentColor" />
                    <circle cx="180" cy="60" r="4" fill="currentColor" />
                </svg>

                <h1 className="mb-2 text-2xl font-bold text-sys-text-primary">
                    {heading}
                </h1>
                <p className="mb-8 max-w-md text-center text-sm text-sys-text-secondary">
                    {subtext}
                </p>

                <Link to="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        </>
    );
};
