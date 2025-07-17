import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import Landing from '@/pages/Landing';
import EmailVerification from './EmailVerification';
import AgencyOnboardingForm from './AgencyOnboardingForm';
import MainLayout from '@/components/layout/MainLayout';
import { checkAgencyOnboardingStatus } from '@/utils/agencyOnboarding';

// Lazy load components
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Clients = React.lazy(() => import("@/pages/Clients"));
const ClientDetails = React.lazy(() => import("@/pages/ClientDetails"));
const PostDetails = React.lazy(() => import("@/pages/PostDetails"));
const Calendar = React.lazy(() => import("@/pages/Calendar"));
const Templates = React.lazy(() => import("@/pages/Templates"));
const TemplateDetails = React.lazy(() => import("@/pages/TemplateDetails"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const ProfileDetailsRouter = React.lazy(() => import("@/components/client/ProfileDetailsRouter"));

const PageSkeleton = () => (
    <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
        </div>
    </div>
);

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
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

    // No user - show landing page
    if (!currentUser) {
        return <Landing />;
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
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Dashboard />
                    </Suspense>
                } />
                <Route path="clients" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Clients />
                    </Suspense>
                } />
                <Route path="clients/:clientId" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/posts" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/comments" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/calendar" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/resources" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/analytics" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/settings" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ClientDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/posts/:postId" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <PostDetails />
                    </Suspense>
                } />
                <Route path="clients/:clientId/profiles/:profileId" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <ProfileDetailsRouter />
                    </Suspense>
                } />
                <Route path="calendar" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Calendar />
                    </Suspense>
                } />
                <Route path="templates" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Templates />
                    </Suspense>
                } />
                <Route path="templates/:templateId" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <TemplateDetails />
                    </Suspense>
                } />
                <Route path="analytics" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Analytics />
                    </Suspense>
                } />
                <Route path="profile" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <Profile />
                    </Suspense>
                } />
            </Route>
            <Route path="*" element={
                <Suspense fallback={<PageSkeleton />}>
                    <NotFound />
                </Suspense>
            } />
        </Routes>
    );
};

export default ProtectedRoute;