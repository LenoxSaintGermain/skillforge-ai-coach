
import { UserProvider } from "@/contexts/UserContext";
import { AIProvider } from "@/contexts/AIContext";
import SkillAssessment from "@/components/SkillAssessment";

const SkillAssessmentPage = () => {
  return (
    <UserProvider>
      <AIProvider>
        <SkillAssessment />
      </AIProvider>
    </UserProvider>
  );
};

export default SkillAssessmentPage;
