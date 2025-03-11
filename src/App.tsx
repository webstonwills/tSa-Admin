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
                <div className="p-8">
                  <h1 className="text-2xl font-bold">CEO Dashboard</h1>
                  <p className="mt-4">Your CEO dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/sec" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Secretary Dashboard</h1>
                  <p className="mt-4">Your Secretary dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/fin" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Finance Dashboard</h1>
                  <p className="mt-4">Your Finance dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/bm" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Business Management Dashboard</h1>
                  <p className="mt-4">Your Business Management dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/aud" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Auditor Dashboard</h1>
                  <p className="mt-4">Your Auditor dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/wel" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Welfare Dashboard</h1>
                  <p className="mt-4">Your Welfare dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/bmem" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Board Member Dashboard</h1>
                  <p className="mt-4">Your Board Member dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Keep any existing routes */}
            <Route path="/dashboard/tre" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Treasurer Dashboard</h1>
                  <p className="mt-4">Your Treasurer dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/trs" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Treasury Dashboard</h1>
                  <p className="mt-4">Your Treasury dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/hr" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">HR Dashboard</h1>
                  <p className="mt-4">Your HR dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/ops" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Operations Dashboard</h1>
                  <p className="mt-4">Your Operations dashboard will appear here.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/mkt" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
                  <p className="mt-4">Your Marketing dashboard will appear here.</p>
                </div>
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
