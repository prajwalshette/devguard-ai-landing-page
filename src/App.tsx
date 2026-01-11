import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PRScanView from "./pages/PRScanView";
import SecurityScore from "./pages/SecurityScore";
import Settings from "./pages/Settings";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pr/:prId" element={<PRScanView />} />
          <Route path="/security-score" element={<SecurityScore />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/pull-requests" element={<PullRequests />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
