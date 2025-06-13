import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-start text-left font-normal"
          style={{ backgroundColor: color }}
        >
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }} />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3">
        <div className="space-y-2">
          <div
            className="w-full h-24 rounded cursor-pointer"
            style={{ backgroundColor: color }}
          />
          <Input
            type="color"
            value={color}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-10"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="#000000"
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
} 