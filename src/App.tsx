import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import PendingApproval from "./pages/Auth/PendingApproval";
import RejectedApproval from "./pages/Auth/RejectedApproval";
import { AuthProvider } from "./components/auth/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import ProfilePage from "./pages/Dashboard/Profile";
import { PerformanceMonitorToggle } from "./components/utils/PerformanceMonitor";
import DebugPage from "./pages/Auth/Debug";

// Import dashboard components
import CEODashboard from "./pages/Dashboard/CEO";
import AdminDashboard from "./pages/Dashboard/Admin";
import SecretaryDashboard from "./pages/Dashboard/Secretary";
import FinanceDashboard from "./pages/Dashboard/Finance";
import BusinessManagementDashboard from "./pages/Dashboard/BusinessManagement";
import AuditorDashboard from "./pages/Dashboard/Auditor";
import WelfareDashboard from "./pages/Dashboard/Welfare";
import BoardMemberDashboard from "./pages/Dashboard/BoardMember";
import Forum from "./pages/Dashboard/Forum";
import RegistrationApproval from "./pages/Dashboard/RegistrationApproval";

// Configure React Query with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)
      retry: 1, // Only retry failed queries once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/pending-approval" element={<PendingApproval />} />
            <Route path="/auth/rejected-approval" element={<RejectedApproval />} />
            <Route path="/auth/debug" element={<DebugPage />} />
            
            {/* Protected Routes - Uses Outlet pattern */}
            <Route element={<ProtectedRoute />}>
              {/* Debug Route for authenticated users */}
              <Route path="/dashboard/debug" element={<DebugPage />} />
              
              {/* Registration Approval Route */}
              <Route path="/dashboard/registration-approval" element={
                <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
                  <RegistrationApproval />
                </RoleBasedRoute>
              } />
              
              {/* Role-Based Dashboard Routes */}
              <Route path="/dashboard/admin" element={
                <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/ceo" element={
                <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
                  <CEODashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/sec" element={
                <RoleBasedRoute allowedRoles={['secretary', 'admin']}>
                  <SecretaryDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/fin" element={
                <RoleBasedRoute allowedRoles={['finance', 'admin']}>
                  <FinanceDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bm" element={
                <RoleBasedRoute allowedRoles={['business_management', 'admin']}>
                  <BusinessManagementDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/aud" element={
                <RoleBasedRoute allowedRoles={['auditor', 'admin']}>
                  <AuditorDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/wel" element={
                <RoleBasedRoute allowedRoles={['welfare', 'admin']}>
                  <WelfareDashboard />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bmem" element={
                <RoleBasedRoute allowedRoles={['board_member', 'admin']}>
                  <BoardMemberDashboard />
                </RoleBasedRoute>
              } />
              
              {/* Profile Route - Accessible to all authenticated users */}
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              
              {/* Role-specific profile routes */}
              <Route path="/dashboard/ceo/profile" element={
                <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/sec/profile" element={
                <RoleBasedRoute allowedRoles={['secretary', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/fin/profile" element={
                <RoleBasedRoute allowedRoles={['finance', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bm/profile" element={
                <RoleBasedRoute allowedRoles={['business_management', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/aud/profile" element={
                <RoleBasedRoute allowedRoles={['auditor', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/wel/profile" element={
                <RoleBasedRoute allowedRoles={['welfare', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bmem/profile" element={
                <RoleBasedRoute allowedRoles={['board_member', 'admin']}>
                  <ProfilePage />
                </RoleBasedRoute>
              } />
              
              {/* Forum Route - Accessible to all authenticated users */}
              <Route path="/dashboard/forum" element={<Forum />} />
              
              {/* Role-specific forum routes */}
              <Route path="/dashboard/ceo/forum" element={
                <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/sec/forum" element={
                <RoleBasedRoute allowedRoles={['secretary', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/fin/forum" element={
                <RoleBasedRoute allowedRoles={['finance', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bm/forum" element={
                <RoleBasedRoute allowedRoles={['business_management', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/aud/forum" element={
                <RoleBasedRoute allowedRoles={['auditor', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/wel/forum" element={
                <RoleBasedRoute allowedRoles={['welfare', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
              <Route path="/dashboard/bmem/forum" element={
                <RoleBasedRoute allowedRoles={['board_member', 'admin']}>
                  <Forum />
                </RoleBasedRoute>
              } />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Performance Monitor - Press Alt+P to toggle */}
          <PerformanceMonitorToggle />
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
