import { useState, useEffect } from "react";
import { ImagePreview } from "@/components/ImagePreview";
import { CorrectionSlider } from "@/components/CorrectionSlider";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step4EnhanceProps {
  originalImage: string;
  enhancementLevel: number;
  onEnhancementChange: (value: number) => void;
  onEnhancementComplete: (processedImage: string) => void;
}

const Step4Enhance = ({ 
  originalImage, 
  enhancementLevel, 
  onEnhancementChange,
  onEnhancementComplete 
}: Step4EnhanceProps) => {
  const { toast } = useToast();
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initial processing
    processImage(enhancementLevel);
  }, []);

  const processImage = async (level: number) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // In production, this would call the actual backend API
      // const response = await apiService.adjustEnhancement(imageId, level);
      
      // For demo, use original image
      setProcessedImage(originalImage);
      setIsProcessing(false);
    }, 1500);
  };

  const handleSliderChange = (value: number) => {
    onEnhancementChange(value);
  };

  const handleReprocess = () => {
    processImage(enhancementLevel);
    toast({
      title: "Reprocessing...",
      description: `Applying ${enhancementLevel}% enhancement`,
    });
  };

  const handleContinue = () => {
    if (processedImage) {
      onEnhancementComplete(processedImage);
      toast({
        title: "✅ Enhancement applied",
        description: "Your photo looks great!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Adjust Enhancement
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Fine-tune color and brightness to your preference
        </p>
      </div>

      {/* Preview */}
      <ImagePreview 
        originalImage={originalImage}
        processedImage={processedImage}
      />

      {/* Enhancement Slider */}
      <div className="max-w-2xl mx-auto">
        <CorrectionSlider
          value={enhancementLevel}
          onChange={handleSliderChange}
          disabled={isProcessing}
          label="Enhancement Strength"
        />
      </div>

      {/* Info Card */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <span>💡</span>
          Enhancement Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• <strong>0-30%:</strong> Natural look, minimal changes</li>
          <li>• <strong>40-60%:</strong> Balanced enhancement (recommended)</li>
          <li>• <strong>70-100%:</strong> Maximum brightness and color boost</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <Button
          onClick={handleReprocess}
          disabled={isProcessing}
          variant="outline"
          className="flex-1 gap-2"
          size="lg"
        >
          <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
          Reprocess
        </Button>
        <Button
          onClick={handleContinue}
          disabled={isProcessing || !processedImage}
          className="flex-1 gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step4Enhance;
