import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BranchProvider } from "./context/BranchContext"; // IMPORT BranchProvider
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
    <BranchProvider> {/* BUNGKUS DENGAN BranchProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/services" element={<Services />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/customer" element={<Customer />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BranchProvider>
  </QueryClientProvider>
);

export default App;