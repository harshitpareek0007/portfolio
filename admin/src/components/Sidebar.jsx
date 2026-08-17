import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { 
    LayoutDashboard, 
    User, 
    Briefcase, 
    Code2, 
    GraduationCap, 
    Award, 
    FileText, 
    MessageSquare, 
    Settings,
    Star
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Experience', path: '/experience', icon: Briefcase },
    { label: 'Skills', path: '/skills', icon: Code2 },
    { label: 'Education', path: '/education', icon: GraduationCap },
    { label: 'Certifications', path: '/certifications', icon: Award },
    { label: 'Blogs', path: '/blogs', icon: FileText },
    { label: 'Testimonials', path: '/testimonials', icon: Star },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Site Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 md:translate-x-0",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold text-text">Portfolio Admin</h1>
                </div>
                <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
