
import SyllabusExplorer from "@/components/SyllabusExplorer";
import CoachChatPanel from "@/components/CoachChatPanel";

const GeminiTrainingPage = () => {
  return (
    <div className="container py-8">
      <SyllabusExplorer />
      <CoachChatPanel initialExpanded={true} />
    </div>
  );
};

export default GeminiTrainingPage;
