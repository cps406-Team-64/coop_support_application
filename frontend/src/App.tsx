import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import EmployerSignup from "./pages/EmployerSignup";
import ApplicationPage from "./pages/ApplicationPage";
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/student" element={<LoginPage role="student" />} />
          <Route path="/login/employer" element={<LoginPage role="employer" />} />
          <Route path="/login/coordinator" element={<LoginPage role="coordinator" />} />
          <Route path="/signup/employer" element={<EmployerSignup />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/employer" element={<EmployerDashboard />} />
          <Route path="/dashboard/coordinator" element={<CoordinatorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
