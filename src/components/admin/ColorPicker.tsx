import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(value);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <div
          className="w-12 h-12 rounded border-2 border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => {
              const newColor = (e.target as HTMLInputElement).value;
              setHexValue(newColor);
              onChange(newColor);
            };
            input.click();
          }}
        />
        <Input
          type="text"
          value={hexValue}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#8B5CF6"
          className="flex-1"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => {
              setHexValue(color);
              onChange(color);
            }}
          />
        ))}
      </div>
    </div>
  );
};
