import { ToastContainer } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ToastProvider, useToast } from "@/contexts/ToastContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { toasts, dismiss } = useToast();
  
  console.log('🏠 AppContent render with toasts:', toasts.length, toasts);

  return (
    <TooltipProvider>
      <ToastContainer toasts={toasts} onClose={dismiss} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
