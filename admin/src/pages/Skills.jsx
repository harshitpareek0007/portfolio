import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const Skills = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Skills</h1>
                    <p className="text-muted">Manage your technical skills</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </div>
            <div className="flex-1">
                <EmptyState title="API Not Available" description="The skills API has not been implemented yet." />
            </div>
        </div>
    );
};
export default Skills;
