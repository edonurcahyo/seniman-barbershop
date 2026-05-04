import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BranchProvider } from "./context/BranchContext";
import ProtectedRoute from "./components/ProtectedRoute"; // IMPORT ProtectedRoute
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Customer from "./pages/Customer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BranchProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - bisa diakses semua orang */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/services" element={<Services />} />
            
            {/* Customer only routes */}
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Booking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Customer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin only routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BranchProvider>
  </QueryClientProvider>
);

export default App;