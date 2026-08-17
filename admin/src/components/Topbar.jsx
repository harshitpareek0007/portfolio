import { Menu, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

const Topbar = ({ onMenuClick }) => {
    const { admin, logout } = useAuth();
    
    // Minimal theme toggle stub (can be expanded later)
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-16 bg-surface border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center">
                <button 
                    className="p-2 mr-2 md:hidden text-muted hover:text-text rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden md:block text-sm font-medium text-muted">
                    Welcome back, {admin?.email}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-muted hover:text-text rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Toggle Theme"
                >
                    <Moon className="w-5 h-5 hidden dark:block" />
                    <Sun className="w-5 h-5 block dark:hidden" />
                </button>
                <Button variant="outline" className="text-sm px-3 py-1.5" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    );
};

export default Topbar;
