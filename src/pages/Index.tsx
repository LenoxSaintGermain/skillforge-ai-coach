import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/marketing/LandingPage";

const Index = () => {
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Show landing page for non-authenticated users
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleEnterApp = () => {
    if (isAuthenticated) {
      // Already authenticated, show dashboard
      return;
    } else {
      // Navigate to auth page
      navigate('/auth');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skillforge-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show dashboard if authenticated, otherwise show landing page
  return (
    <>
      {isAuthenticated ? <Dashboard /> : <LandingPage onEnterApp={handleEnterApp} />}
    </>
  );
};

export default Index;
