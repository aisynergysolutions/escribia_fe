import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileDetailsPage from './pages/ProfileDetails';
import Landing from './pages/Landing';
import { AgencyProfileProvider } from '@/context/AgencyProfileContext';
import { ClientsProvider } from '@/context/ClientsContext'; // <-- import this
import { ProfilesProvider } from '@/context/ProfilesContext'; // <-- Add this import
import { PostsProvider } from "./context/PostsContext";
import { PostDetailsProvider } from "./context/PostDetailsContext";
import { TemplatesProvider } from '@/context/TemplatesContext'; // <-- Add this import
import ProfileDetailsRouter from './components/client/ProfileDetailsRouter'; // <-- Add this import
import { EventsProvider } from "./context/EventsContext";
import { LinkedinProvider } from '@/context/LinkedinContext';

// Lazy load components for code splitting
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Clients = React.lazy(() => import("./pages/Clients"));
const ClientDetails = React.lazy(() => import("./pages/ClientDetails"));
const PostDetails = React.lazy(() => import("./pages/PostDetails"));
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
    <AgencyProfileProvider>
      <ClientsProvider>
        <TemplatesProvider> {/* <-- Add TemplatesProvider here */}
          <ProfilesProvider> {/* <-- Wrap here */}
            <LinkedinProvider>
              <PostsProvider>
                <PostDetailsProvider>
                  <EventsProvider>
                    <QueryClientProvider client={queryClient}>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <Router>
                          <div className="min-h-screen bg-gray-50">
                            <Routes>
                              <Route path="/landing" element={
                                <Suspense fallback={<PageSkeleton />}>
                                  <Landing />
                                </Suspense>
                              } />
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
                                    <ProfileDetailsRouter /> {/* <-- Use the router here */}
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
                          </div>
                        </Router>
                      </TooltipProvider>
                    </QueryClientProvider>
                  </EventsProvider>
                </PostDetailsProvider>
              </PostsProvider>
            </LinkedinProvider>
          </ProfilesProvider>
        </TemplatesProvider> {/* <-- Close TemplatesProvider here */}
      </ClientsProvider>
    </AgencyProfileProvider>
  );
}

export default App;
