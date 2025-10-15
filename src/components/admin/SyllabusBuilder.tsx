import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface Phase {
  id: number;
  title: string;
  description: string;
  expectedOutputs: string[];
}

interface SyllabusBuilderProps {
  value: any;
  onChange: (syllabus: any) => void;
}

export const SyllabusBuilder = ({ value, onChange }: SyllabusBuilderProps) => {
  const [phases, setPhases] = useState<Phase[]>(
    value?.phases?.map((p: any, idx: number) => ({
      id: idx + 1,
      title: p.title || '',
      description: p.description || '',
      expectedOutputs: p.expectedOutputs || [],
    })) || []
  );

  const updateSyllabus = (newPhases: Phase[]) => {
    const syllabusData = {
      ...value,
      phases: newPhases.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        expectedOutputs: p.expectedOutputs,
      })),
    };
    onChange(syllabusData);
  };

  const addPhase = () => {
    const newPhase: Phase = {
      id: phases.length + 1,
      title: `Phase ${phases.length + 1}`,
      description: '',
      expectedOutputs: [],
    };
    const newPhases = [...phases, newPhase];
    setPhases(newPhases);
    updateSyllabus(newPhases);
  };

  const removePhase = (index: number) => {
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases);
    updateSyllabus(newPhases);
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const newPhases = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
    setPhases(newPhases);
    updateSyllabus(newPhases);
  };

  const updatePhase = (index: number, field: keyof Phase, value: any) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setPhases(newPhases);
    updateSyllabus(newPhases);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg">Syllabus Phases</Label>
        <Button type="button" onClick={addPhase} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      </div>

      {phases.map((phase, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Phase {index + 1}</CardTitle>
              <div className="flex gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => movePhase(index, 'up')}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                )}
                {index < phases.length - 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => movePhase(index, 'down')}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhase(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={phase.title}
                onChange={(e) => updatePhase(index, 'title', e.target.value)}
                placeholder="Phase title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={phase.description}
                onChange={(e) => updatePhase(index, 'description', e.target.value)}
                placeholder="Phase description"
                rows={3}
              />
            </div>
            <div>
              <Label>Expected Outputs (comma-separated)</Label>
              <Input
                value={phase.expectedOutputs.join(', ')}
                onChange={(e) =>
                  updatePhase(
                    index,
                    'expectedOutputs',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="Output 1, Output 2, Output 3"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {phases.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No phases added yet. Click "Add Phase" to get started.
        </div>
      )}
    </div>
  );
};
