import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/marketing/LandingPage";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  
  // When showDashboard is true, render the Dashboard component
  // Otherwise, render the landing page
  return (
    <>
      {showDashboard ? <Dashboard /> : <LandingPage onEnterApp={() => setShowDashboard(true)} />}
    </>
  );
};

export default Index;
