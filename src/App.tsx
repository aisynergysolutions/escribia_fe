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
import { ClientsProvider } from '@/context/ClientsContext';
import { ProfilesProvider } from '@/context/ProfilesContext';
import { PostsProvider } from "./context/PostsContext";
import { PostDetailsProvider } from "./context/PostDetailsContext";
import { TemplatesProvider } from '@/context/TemplatesContext';
import ProfileDetailsRouter from './components/client/ProfileDetailsRouter';
import { EventsProvider } from "./context/EventsContext";
import { LinkedinProvider } from '@/context/LinkedinContext';
import { AuthProvider } from '@/context/AuthContext'; // Add this import
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // We'll create this

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
const EmailVerification = React.lazy(() => import("./components/auth/EmailVerification"));

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
    <AuthProvider> {/* Wrap everything in AuthProvider */}
      <AgencyProfileProvider>
        <ClientsProvider>
          <TemplatesProvider>
            <ProfilesProvider>
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
                                <Route path="/*" element={<ProtectedRoute />} />
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
          </TemplatesProvider>
        </ClientsProvider>
      </AgencyProfileProvider>
    </AuthProvider>
  );
}

export default App;