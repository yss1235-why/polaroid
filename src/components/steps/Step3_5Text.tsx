import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward, Loader2 } from "lucide-react";
import { TextOverlay } from "@/types";
import { TextCustomizer } from "@/components/TextCustomizer";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step3_5TextProps {
  onTextComplete: (text: TextOverlay | null, secondText?: TextOverlay | null) => void;
  isDualMode?: boolean;
}

const Step3_5Text = ({ onTextComplete, isDualMode = false }: Step3_5TextProps) => {
  const [firstText, setFirstText] = useState<TextOverlay>({
    content: "",
    font: "Arial",
    color: "#000000",
    size: 24,
    position: "bottom",
  });

  const [secondText, setSecondText] = useState<TextOverlay>({
    content: "",
    font: "Arial",
    color: "#000000",
    size: 24,
    position: "bottom",
  });

  const [sameTextForBoth, setSameTextForBoth] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState<"first" | "second">("first");

  const handleContinue = () => {
    if (isDualMode && !sameTextForBoth && currentPhoto === "first") {
      // Move to second photo text
      setCurrentPhoto("second");
      return;
    }

    // Return text overlays (null if empty)
    const text1 = firstText.content.trim() ? firstText : null;
    const text2 = isDualMode 
      ? (sameTextForBoth 
          ? text1 
          : (secondText.content.trim() ? secondText : null))
      : undefined;

    onTextComplete(text1, text2);
  };

  const handleSkip = () => {
    onTextComplete(null, isDualMode ? null : undefined);
  };

  const handleBack = () => {
    if (isDualMode && currentPhoto === "second") {
      setCurrentPhoto("first");
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
          Add Your Caption
        </h2>
        <p className="text-sm text-center text-muted-foreground">
          Optional - Skip if you don't want text
        </p>

        {isDualMode && (
          <>
            <p className="text-sm text-center text-muted-foreground mt-2">
              {currentPhoto === "first" ? "Left Polaroid" : "Right Polaroid"}
            </p>

            {/* Same Text Toggle */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameTextForBoth}
                  onChange={(e) => {
                    setSameTextForBoth(e.target.checked);
                    if (e.target.checked) {
                      setSecondText(firstText);
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Use same text for both photos
                </span>
              </label>
            </div>
          </>
        )}

        {/* Pre-loading Notice */}
        <Alert className="mt-4 bg-primary/10 border-primary/20">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-sm">
            <strong>Filters are loading in the background</strong>
            <br />
            Take your time adding text - filters will be ready when you continue!
          </AlertDescription>
        </Alert>
      </div>

      {/* Text Customizer */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <TextCustomizer
            value={currentPhoto === "first" ? firstText : secondText}
            onChange={currentPhoto === "first" ? setFirstText : setSecondText}
            photoNumber={isDualMode ? (currentPhoto === "first" ? 1 : 2) : undefined}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 border-t border-border bg-card">
        {isDualMode && currentPhoto === "second" && (
          <Button 
            onClick={handleBack}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back to First Photo
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <SkipForward className="w-5 h-5" />
            Skip Text
          </Button>
          
          <Button 
            onClick={handleContinue}
            className="gap-2"
            size="lg"
          >
            {isDualMode && !sameTextForBoth && currentPhoto === "first" 
              ? "Next Photo" 
              : "Continue to Filters"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Helpful tip */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          💡 Tip: Longer text = more time for filters to load
        </p>
      </div>
    </div>
  );
};

export default Step3_5Text;
