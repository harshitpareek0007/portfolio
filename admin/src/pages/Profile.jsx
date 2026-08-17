import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { admin } = useAuth();
    
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Admin Profile</h1>
                    <p className="text-muted">Manage your admin credentials</p>
                </div>
            </div>
            <div className="p-6 bg-surface border border-gray-200 dark:border-gray-800 rounded-xl mb-6">
                <p className="text-text"><strong>Email:</strong> {admin?.email}</p>
                <p className="text-text"><strong>Role:</strong> {admin?.role}</p>
            </div>
            <div className="flex-1">
                <EmptyState title="Update Profile Not Available" description="The update profile API has not been implemented yet." />
            </div>
        </div>
    );
};
export default Profile;
