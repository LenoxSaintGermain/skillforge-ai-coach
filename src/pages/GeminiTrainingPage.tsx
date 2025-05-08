
import { UserProvider } from "@/contexts/UserContext";
import { AIProvider } from "@/contexts/AIContext";
import SyllabusExplorer from "@/components/SyllabusExplorer";
import CoachChatPanel from "@/components/CoachChatPanel";

const GeminiTrainingPage = () => {
  return (
    <UserProvider>
      <AIProvider>
        <div className="container py-8">
          <SyllabusExplorer />
          <CoachChatPanel initialExpanded={true} />
        </div>
      </AIProvider>
    </UserProvider>
  );
};

export default GeminiTrainingPage;
