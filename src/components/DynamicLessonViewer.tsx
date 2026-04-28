import React from 'react';
import { A2UIRenderer } from './a2ui/A2UIRenderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/services/ScenarioService';
import { Clock, Puzzle } from 'lucide-react';

interface DynamicLessonViewerProps {
  scenario: Scenario;
}

const DynamicLessonViewer: React.FC<DynamicLessonViewerProps> = ({ scenario }) => {
  if (scenario.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="text-muted-foreground">Loading interactive curriculum...</div>
        </div>
      </div>
    );
  }

  // If the scenario has an A2UI payload (modern approach)
  if (scenario.a2uiPayload) {
    return (
      <div className="w-full max-w-5xl mx-auto animate-in fade-in-50 duration-500">
        <A2UIRenderer payload={scenario.a2uiPayload} />
      </div>
    );
  }

  // Legacy fallback for old hardcoded scenarios without an A2UI payload
  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in-50 duration-500">
      <Card className="border-t-4 border-t-skillforge-primary">
        <CardHeader>
          <CardTitle className="text-2xl">{scenario.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 mt-2">
            <span className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {scenario.estimatedTime}
            </span>
            <span className="flex items-center">
              <Puzzle className="mr-1 h-4 w-4" />
              {scenario.difficultyLevel}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Context</h3>
            <p className="text-muted-foreground">{scenario.context}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Challenge</h3>
            <p className="text-muted-foreground">{scenario.challenge}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Legacy Tasks</h3>
            <div className="space-y-4">
              {scenario.tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{task.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {task.aiActions?.map((action, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{action}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicLessonViewer;
