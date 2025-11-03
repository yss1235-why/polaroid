import { FileCheck, Sparkles } from "lucide-react";
import { ProcessingMode } from "@/types";

interface ModeSelectorProps {
  selectedMode: ProcessingMode;
  onModeSelect: (mode: ProcessingMode) => void;
}

export const ModeSelector = ({ selectedMode, onModeSelect }: ModeSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
      {/* Passport Mode */}
      <button
        onClick={() => onModeSelect("passport")}
        className={`p-6 md:p-8 rounded-xl border-2 transition-all duration-200 text-left ${
          selectedMode === "passport"
            ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            selectedMode === "passport" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}>
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Passport Standard
            </h3>
            <p className="text-sm text-muted-foreground">
              Quick & Automatic
            </p>
          </div>
          {selectedMode === "passport" && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <ul className="space-y-2 mb-4">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Auto background removal</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Standard color correction</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Official document compliant</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Fastest processing</span>
          </li>
        </ul>

        <div className="pt-4 border-t border-border">
          <span className="text-xs font-semibold text-primary">RECOMMENDED FOR PASSPORTS</span>
        </div>
      </button>

      {/* Studio Mode */}
      <button
        onClick={() => onModeSelect("studio")}
        className={`p-6 md:p-8 rounded-xl border-2 transition-all duration-200 text-left ${
          selectedMode === "studio"
            ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            selectedMode === "studio" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Studio Custom
            </h3>
            <p className="text-sm text-muted-foreground">
              Full Control
            </p>
          </div>
          {selectedMode === "studio" && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <ul className="space-y-2 mb-4">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Adjustable enhancement levels</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Custom color correction</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Preview before/after</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">✓</span>
            <span>Professional results</span>
          </li>
        </ul>

        <div className="pt-4 border-t border-border">
          <span className="text-xs font-semibold text-primary">BEST FOR CUSTOM PHOTOS</span>
        </div>
      </button>
    </div>
  );
};
