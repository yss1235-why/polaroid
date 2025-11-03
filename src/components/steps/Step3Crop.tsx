import { useState } from "react";
import { CropTool } from "@/components/CropTool";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CropData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface Step3CropProps {
  imageUrl: string;
  onCropComplete: (croppedImage: string, cropData: CropData) => void;
}

const Step3Crop = ({ imageUrl, onCropComplete }: Step3CropProps) => {
  const { toast } = useToast();
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropChange = (data: CropData) => {
    setCropData(data);
  };

  const handleContinue = async () => {
    if (!cropData) {
      toast({
        title: "Adjust crop area",
        description: "Please position the crop area over your face",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate cropping process
    setTimeout(() => {
      // In production, this would call the backend API
      // const response = await apiService.cropPhoto(imageId, cropData);
      
      onCropComplete(imageUrl, cropData);
      setIsProcessing(false);
      
      toast({
        title: "✅ Photo cropped",
        description: "Photo adjusted to passport size",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Crop to Passport Size
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Position your face in the center of the frame (3.5cm × 4.5cm)
        </p>
      </div>

      <CropTool 
        imageUrl={imageUrl} 
        onCropChange={handleCropChange}
      />

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-2 text-sm">
          📐 Cropping Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Position your face in the center of the crop area</li>
          <li>• Use zoom controls to adjust the size</li>
          <li>• Ensure your entire face is visible within the frame</li>
          <li>• Leave some space above your head</li>
        </ul>
      </div>

      <Button 
        onClick={handleContinue} 
        disabled={isProcessing || !cropData}
        className="w-full gap-2"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Step3Crop;
