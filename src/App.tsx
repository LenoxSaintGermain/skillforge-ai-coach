
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import ScenariosPage from "./pages/ScenariosPage";
import SkillAssessmentPage from "./pages/SkillAssessmentPage";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";
import { AIProvider } from "./contexts/AIContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <AIProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/scenarios" element={<ScenariosPage />} />
                <Route path="/assessment" element={<SkillAssessmentPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AIProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
