import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const Projects = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Projects</h1>
                    <p className="text-muted">Manage your portfolio projects</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <div className="flex-1">
                <EmptyState 
                    title="No Projects Found" 
                    description="The project API has not been implemented yet. Once connected, your projects will appear here."
                />
            </div>
        </div>
    );
};

export default Projects;
