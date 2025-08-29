import { ToastContainer } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoanManagement from "./pages/LoanManagement";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { ToastProvider, useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/hooks/use-auth";
import { createContext, useContext } from "react";

const queryClient = new QueryClient();

// Tạo AuthContext
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// AuthProvider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

const AppContent = () => {
  const { toasts, dismiss } = useToast();
  
  console.log('🏠 AppContent render with toasts:', toasts.length, toasts);

  return (
    <TooltipProvider>
      <ToastContainer toasts={toasts} onClose={dismiss} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loan-management" element={<LoanManagement />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Add more admin routes here later */}
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
