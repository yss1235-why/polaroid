import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TEXT_FONTS, TEXT_COLORS, TextOverlay } from "@/types";
import { hasGoodContrast } from "@/utils/polaroidHelpers";

interface TextCustomizerProps {
  value: TextOverlay;
  onChange: (text: TextOverlay) => void;
  photoNumber?: 1 | 2;
}

export const TextCustomizer = ({ value, onChange, photoNumber }: TextCustomizerProps) => {
  const [customColor, setCustomColor] = useState(value.color);

  const handleContentChange = (content: string) => {
    if (content.length <= 50) {
      onChange({ ...value, content });
    }
  };

  const handleFontChange = (font: string) => {
    onChange({ ...value, font });
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onChange({ ...value, color });
  };

  const handleSizeChange = (size: number[]) => {
    onChange({ ...value, size: size[0] });
  };

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      {photoNumber && (
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {photoNumber === 1 ? "Left" : "Right"} Polaroid Text
          </h3>
        </div>
      )}

      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="text-content">Your Caption</Label>
        <Input
          id="text-content"
          type="text"
          placeholder="Add a caption..."
          value={value.content}
          onChange={(e) => handleContentChange(e.target.value)}
          maxLength={50}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground text-right">
          {value.content.length}/50 characters
        </p>
      </div>

      {/* Font Selector */}
      <div className="space-y-2">
        <Label htmlFor="text-font">Font Style</Label>
        <select
          id="text-font"
          value={value.font}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          {TEXT_FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label>Text Color</Label>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-full aspect-square rounded-md border-2 transition-all ${
                value.color === color.value
                  ? "border-primary scale-110"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
        
        {/* Custom Color Input */}
        <div className="flex items-center gap-2">
          <Label htmlFor="custom-color" className="text-sm whitespace-nowrap">
            Custom:
          </Label>
          <input
            id="custom-color"
            type="color"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={customColor.toUpperCase()}
            onChange={(e) => {
              const hex = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(hex)) {
                handleColorChange(hex);
              }
            }}
            className="w-24 text-xs"
            placeholder="#000000"
          />
        </div>

        {/* Contrast Warning */}
        {!hasGoodContrast(value.color) && (
          <p className="text-xs text-orange-500">
            ⚠️ Light colors may be hard to read on white background
          </p>
        )}
      </div>

      {/* Size Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-size">Text Size</Label>
          <span className="text-sm font-medium text-muted-foreground">
            {value.size}pt
          </span>
        </div>
        <Slider
          id="text-size"
          min={12}
          max={48}
          step={2}
          value={[value.size]}
          onValueChange={handleSizeChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Small</span>
          <span>Medium</span>
          <span>Large</span>
        </div>
      </div>

      {/* Preview Text */}
      {value.content && (
        <div className="p-4 bg-muted rounded-md text-center">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <p
            style={{
              fontFamily: value.font,
              color: value.color,
              fontSize: `${Math.min(value.size, 24)}px`,
            }}
            className="break-words"
          >
            {value.content}
          </p>
        </div>
      )}
    </div>
  );
};
