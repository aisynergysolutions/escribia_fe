import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import EmailVerification from './EmailVerification';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-64 w-96" />
                </div>
            </div>
        );
    }

    // No user - redirect to landing
    if (!currentUser) {
        return <Navigate to="/landing" />;
    }

    // User exists but email not verified - show verification screen
    if (!currentUser.emailVerified) {
        return <EmailVerification />;
    }

    // User authenticated and verified - show protected content
    return <>{children}</>;
};

export default ProtectedRoute;