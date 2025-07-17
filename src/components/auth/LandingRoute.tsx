import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import Landing from '@/pages/Landing';

const LandingRoute: React.FC = () => {
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

    // If user is authenticated, redirect to dashboard
    if (currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    // If not authenticated, show landing page
    return <Landing />;
};

export default LandingRoute;
