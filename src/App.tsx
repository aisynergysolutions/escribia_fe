
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import IdeaDetails from "./pages/IdeaDetails";
import Calendar from "./pages/Calendar";
import Templates from "./pages/Templates";
import TemplateDetails from "./pages/TemplateDetails";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetails />} />
            <Route path="clients/:clientId/posts" element={<ClientDetails />} />
            <Route path="clients/:clientId/comments" element={<ClientDetails />} />
            <Route path="clients/:clientId/calendar" element={<ClientDetails />} />
            <Route path="clients/:clientId/resources" element={<ClientDetails />} />
            <Route path="clients/:clientId/analytics" element={<ClientDetails />} />
            <Route path="clients/:clientId/settings" element={<ClientDetails />} />
            <Route path="clients/:clientId/ideas/:ideaId" element={<IdeaDetails />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="templates" element={<Templates />} />
            <Route path="templates/:templateId" element={<TemplateDetails />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
