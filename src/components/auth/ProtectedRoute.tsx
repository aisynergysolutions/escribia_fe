import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import EmailVerification from './EmailVerification';
import AgencyOnboardingForm from './AgencyOnboardingForm';
import { checkAgencyOnboardingStatus } from '@/utils/agencyOnboarding';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const [agencyOnboardingComplete, setAgencyOnboardingComplete] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            if (currentUser && currentUser.emailVerified) {
                const isComplete = await checkAgencyOnboardingStatus(currentUser.uid);
                setAgencyOnboardingComplete(isComplete);
            }
        };

        checkOnboarding();
    }, [currentUser]);

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

    // User verified but onboarding status still loading
    if (agencyOnboardingComplete === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-64 w-96" />
                </div>
            </div>
        );
    }

    // User verified but onboarding not complete - show onboarding form
    if (!agencyOnboardingComplete) {
        return <AgencyOnboardingForm />;
    }

    // User authenticated, verified, and onboarded - show protected content
    return <>{children}</>;
};

export default ProtectedRoute;