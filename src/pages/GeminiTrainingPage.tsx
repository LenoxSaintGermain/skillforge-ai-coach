
import React, { useState } from "react";
import SyllabusExplorer from "@/components/SyllabusExplorer";
import CoachChatPanel from "@/components/CoachChatPanel";

const GeminiTrainingPage = () => {
  const [isInLearningMode, setIsInLearningMode] = useState(false);

  return (
    <div className="container py-8">
      <SyllabusExplorer onLearningModeChange={setIsInLearningMode} />
      {!isInLearningMode && <CoachChatPanel initialExpanded={true} />}
    </div>
  );
};

export default GeminiTrainingPage;
