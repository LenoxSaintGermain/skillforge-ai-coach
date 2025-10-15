import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonEditorProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  rows?: number;
}

export const JsonEditor = ({ label, value, onChange, placeholder, rows = 10 }: JsonEditorProps) => {
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setJsonString(JSON.stringify(value, null, 2));
      setError(null);
    } catch (err) {
      setError('Invalid JSON structure');
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonString(newValue);

    if (!newValue.trim()) {
      setError(null);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON syntax');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={jsonString}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && jsonString && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Valid JSON</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
