import { EmptyState } from '../components/ui/EmptyState';

const Messages = () => {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Messages</h1>
                    <p className="text-muted">View your contact form submissions</p>
                </div>
            </div>
            <div className="flex-1">
                <EmptyState title="API Not Available" description="The messages API has not been implemented yet." />
            </div>
        </div>
    );
};
export default Messages;
