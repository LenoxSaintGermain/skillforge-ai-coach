
import { Suspense, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Header from "./Header";
import CoachChatPanel from "./CoachChatPanel";
import { Toaster } from "@/components/ui/toaster";

const AppLayout = () => {
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not loading and not authenticated, redirect to auth
    if (!isLoading && !isAuthenticated && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skillforge-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the layout (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Suspense fallback={<div className="container py-8">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
      
      <Toaster />
    </div>
  );
};

export default AppLayout;
