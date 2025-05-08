
import { UserProvider } from "@/contexts/UserContext";
import { AIProvider } from "@/contexts/AIContext";
import ScenarioExplorer from "@/components/ScenarioExplorer";

const ScenariosPage = () => {
  return (
    <UserProvider>
      <AIProvider>
        <ScenarioExplorer />
      </AIProvider>
    </UserProvider>
  );
};

export default ScenariosPage;
