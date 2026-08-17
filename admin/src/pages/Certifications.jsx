import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const Certifications = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Certifications</h1>
                    <p className="text-muted">Manage your professional certifications</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                </Button>
            </div>
            <div className="flex-1">
                <EmptyState title="API Not Available" description="The certifications API has not been implemented yet." />
            </div>
        </div>
    );
};
export default Certifications;
