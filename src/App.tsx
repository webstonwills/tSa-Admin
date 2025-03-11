
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import { AuthProvider } from "./components/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import dashboard components
import CEODashboard from "./pages/Dashboard/CEO";
import SecretaryDashboard from "./pages/Dashboard/Secretary";
import FinanceDashboard from "./pages/Dashboard/Finance";
import BusinessManagementDashboard from "./pages/Dashboard/BusinessManagement";
import AuditorDashboard from "./pages/Dashboard/Auditor";
import WelfareDashboard from "./pages/Dashboard/Welfare";
import BoardMemberDashboard from "./pages/Dashboard/BoardMember";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard/ceo" element={
              <ProtectedRoute>
                <CEODashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/sec" element={
              <ProtectedRoute>
                <SecretaryDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/fin" element={
              <ProtectedRoute>
                <FinanceDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/bm" element={
              <ProtectedRoute>
                <BusinessManagementDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/aud" element={
              <ProtectedRoute>
                <AuditorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/wel" element={
              <ProtectedRoute>
                <WelfareDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/bmem" element={
              <ProtectedRoute>
                <BoardMemberDashboard />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
