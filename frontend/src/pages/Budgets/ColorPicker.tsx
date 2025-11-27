import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const predefinedColors = [
  '#5af0c8', // Mint
  '#3be8a0', // Dark mint
  '#ff6b6b', // Red
  '#ffd93d', // Yellow
  '#6bcf7f', // Green
  '#4ecdc4', // Teal
  '#95e1d3', // Light teal
  '#f38181', // Pink
  '#aa96da', // Purple
  '#fcbad3', // Light pink
  '#a8d8ea', // Light blue
  '#ffaaa5', // Coral
  '#ff8b94', // Rose
  '#c7ceea', // Lavender
  '#b4f8c8', // Mint green
  '#fbe7c6', // Cream
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const [customColor, setCustomColor] = React.useState(selectedColor);

  return (
    <div className="space-y-4">
      <label className="label">Budget Color</label>
      
      {/* Predefined colors grid */}
      <div className="grid grid-cols-8 gap-3">
        {predefinedColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
              selectedColor === color
                ? 'ring-4 ring-white/30 ring-offset-2 ring-offset-secondary-900 scale-110'
                : 'hover:ring-2 hover:ring-white/20'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>

      {/* Custom color picker */}
      <div className="pt-2">
        <label className="label text-sm mb-2">Or choose custom color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onColorSelect(e.target.value);
            }}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-white/10 hover:border-[rgba(var(--accent-from-rgb),0.3)] transition-colors"
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onColorSelect(e.target.value);
                }
              }}
              className="input text-sm font-mono"
              placeholder="#5af0c8"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
