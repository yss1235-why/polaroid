import { useState, useEffect } from "react";
import { ImagePreview } from "@/components/ImagePreview";
import { CorrectionSlider } from "@/components/CorrectionSlider";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CropData } from "@/types";

interface Step4EnhanceProps {
  originalImage: string;
  imageId: string;
  mode: "passport" | "studio";
  enhancementLevel: number;
  cropData: CropData | null;  // NEW: Receive crop data
  onEnhancementChange: (value: number) => void;
  onEnhancementComplete: (processedImage: string) => void;
}

const Step4Enhance = ({ 
  originalImage,
  imageId,
  mode,
  enhancementLevel, 
  cropData,  // NEW
  onEnhancementChange,
  onEnhancementComplete 
}: Step4EnhanceProps) => {
  const { toast } = useToast();
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initial processing with default level (40% for passport, 40% for studio)
    const defaultLevel = mode === "passport" ? 40 : 40;
    onEnhancementChange(defaultLevel);
    processImage(defaultLevel);
  }, []);

  const processImage = async (level: number) => {
    setIsProcessing(true);
    
    try {
      const response = await apiService.processPhoto(
        imageId,
        mode,
        level,
        "white",
        cropData || undefined  // NEW: Pass crop data to backend
      );
      
      if (response.success && response.data) {
        setProcessedImage(response.data.processed_image);
        toast({
          title: "✅ Processing complete",
          description: `Face confidence: ${(response.data.face_confidence * 100).toFixed(0)}%`,
        });
      } else {
        throw new Error(response.error || "Processing failed");
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSliderChange = (value: number) => {
    onEnhancementChange(value);
  };

  const handleReprocess = async () => {
    toast({
      title: "Reprocessing...",
      description: `Applying ${enhancementLevel}% enhancement`,
    });
    
    setIsProcessing(true);
    
    try {
      const response = await apiService.adjustEnhancement(imageId, enhancementLevel);
      
      if (response.success && response.data) {
        setProcessedImage(response.data.processed_image);
        toast({
          title: "✅ Reprocessing complete",
          description: "Enhancement level updated",
        });
      } else {
        throw new Error(response.error || "Reprocessing failed");
      }
    } catch (error) {
      console.error("Reprocessing error:", error);
      toast({
        title: "Reprocessing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          Fine-tune color and brightness (subtle changes only)
        </p>
      </div>

      {/* Preview */}
      <ImagePreview 
        originalImage={originalImage}
        processedImage={processedImage}
      />

      {/* Enhancement Slider - Only in Studio Mode */}
      {mode === "studio" && (
        <div className="max-w-2xl mx-auto">
          <CorrectionSlider
            value={enhancementLevel}
            onChange={handleSliderChange}
            disabled={isProcessing}
            label="Enhancement Strength"
          />
        </div>
      )}

      {/* Info Card */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <span>💡</span>
          Enhancement Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• <strong>0-30%:</strong> Subtle, natural look</li>
          <li>• <strong>30-50%:</strong> Balanced (recommended)</li>
          <li>• <strong>50-100%:</strong> Stronger enhancement</li>
          <li>• ✨ Only face area is enhanced for natural results</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        {mode === "studio" && (
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
        )}
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
