
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import ScenariosPage from "./pages/ScenariosPage";
import ScenarioDetailPage from "./pages/ScenarioDetailPage";
import ScenarioGeneratorPage from "./pages/ScenarioGeneratorPage";
import SkillAssessmentPage from "./pages/SkillAssessmentPage";
import GeminiTrainingPage from "./pages/GeminiTrainingPage";
import ResourcesPage from "./pages/ResourcesPage";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";
import { AIProvider } from "./contexts/AIContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <AIProvider>
        <BrowserRouter>
          <TooltipProvider>
            <React.StrictMode>
              <Toaster />
              <Sonner />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/scenarios" element={<ScenariosPage />} />
                  <Route path="/scenario/:id" element={<ScenarioDetailPage />} />
                  <Route path="/scenario/generate" element={<ScenarioGeneratorPage />} />
                  <Route path="/assessment" element={<SkillAssessmentPage />} />
                  <Route path="/gemini-training" element={<GeminiTrainingPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.StrictMode>
          </TooltipProvider>
        </BrowserRouter>
      </AIProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
