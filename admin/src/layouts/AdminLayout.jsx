import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            
            <div className="md:ml-64 flex flex-col min-h-screen">
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
