import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Projects from "./pages/admin/Projects";
import Inbox from "./pages/admin/Inbox";
import Settings from "./pages/admin/Settings";
import Skills from "./pages/admin/Skills";
import ExperienceManager from "./pages/admin/ExperienceManager";
import EducationManager from "./pages/admin/EducationManager";
import CertificateManager from "./pages/admin/CertificateManager";
import ContentEditor from "./pages/admin/ContentEditor";
import SocialLinks from "./pages/admin/SocialLinks";
import Blog from "./pages/admin/Blog";
import AIKeys from "./pages/admin/AIKeys";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/projects" element={<Projects />} />
              <Route path="/admin/inbox" element={<Inbox />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/skills" element={<Skills />} />
              <Route path="/admin/experience" element={<ExperienceManager />} />
              <Route path="/admin/education" element={<EducationManager />} />
              <Route path="/admin/certificates" element={<CertificateManager />} />
              <Route path="/admin/content" element={<ContentEditor />} />
              <Route path="/admin/social" element={<SocialLinks />} />
              <Route path="/admin/blog" element={<Blog />} />
              <Route path="/admin/ai-keys" element={<AIKeys />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
