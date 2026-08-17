import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

const SiteSettings = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Site Settings</h1>
                    <p className="text-muted">Manage global configuration and themes</p>
                </div>
                <Button>Save Settings</Button>
            </div>
            <div className="flex-1">
                <EmptyState title="API Not Available" description="The site settings API has not been implemented yet." />
            </div>
        </div>
    );
};
export default SiteSettings;
