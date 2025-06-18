import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileDetailsPage from './pages/ProfileDetails';

// Lazy load components for code splitting
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Clients = React.lazy(() => import("./pages/Clients"));
const ClientDetails = React.lazy(() => import("./pages/ClientDetails"));
const IdeaDetails = React.lazy(() => import("./pages/IdeaDetails"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const Templates = React.lazy(() => import("./pages/Templates"));
const TemplateDetails = React.lazy(() => import("./pages/TemplateDetails"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <div className="min-h-screen bg-gray-50">
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
                <Route path="clients/:clientId/ideas/:ideaId" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <IdeaDetails />
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
                <Route path="/clients/:clientId/profiles/:profileId" element={
                  <MainLayout>
                    <ProfileDetailsPage />
                  </MainLayout>
                } />
              </Route>
              <Route path="*" element={
                <Suspense fallback={<PageSkeleton />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
