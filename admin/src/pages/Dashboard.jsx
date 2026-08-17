import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text">Dashboard</h1>
                    <p className="text-muted">Overview of your portfolio content</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-sm font-medium text-muted uppercase">Total Projects</h3>
                    <p className="text-3xl font-bold text-text mt-2">--</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-muted uppercase">Total Blogs</h3>
                    <p className="text-3xl font-bold text-text mt-2">--</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-muted uppercase">New Messages</h3>
                    <p className="text-3xl font-bold text-text mt-2">--</p>
                </Card>
            </div>

            <EmptyState 
                title="API Not Connected" 
                description="The dashboard metrics will be available once the backend CRUD APIs are implemented."
            />
        </div>
    );
};

export default Dashboard;
