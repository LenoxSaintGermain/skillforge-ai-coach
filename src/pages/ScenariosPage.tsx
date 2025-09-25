
import ScenarioExplorer from "@/components/ScenarioExplorer";
import ScenarioIntroduction from "@/components/ScenarioIntroduction";
import { useState } from "react";

const ScenariosPage = () => {
  const [showIntroduction, setShowIntroduction] = useState(true);
  
  if (showIntroduction) {
    return (
      <div className="container py-8">
        <ScenarioIntroduction onGetStarted={() => setShowIntroduction(false)} />
      </div>
    );
  }
  
  return <ScenarioExplorer />;
};

export default ScenariosPage;
