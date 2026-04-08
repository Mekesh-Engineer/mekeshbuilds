// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';
import './styles/base/globals.css';
import { initFirebaseAnalytics } from '@/lib/firebaseClient';

void initFirebaseAnalytics().catch((err) => {
    console.warn('[firebase] Analytics initialization skipped:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>,
);
