import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import Projects from "./pages/admin/Projects";
import Inbox from "./pages/admin/Inbox";
import Settings from "./pages/admin/Settings";
import Skills from "./pages/admin/Skills";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/inbox" element={<Inbox />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/skills" element={<Skills />} />
          <Route path="/admin/content" element={<Dashboard />} />
          <Route path="/admin/experience" element={<Dashboard />} />
          <Route path="/admin/education" element={<Dashboard />} />
          <Route path="/admin/certificates" element={<Dashboard />} />
          <Route path="/admin/social" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
