import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar/Navbar';
import Footer from './Footer';

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-sys-bg-primary text-sys-text-primary">
            <Navbar />
            <main className="pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
