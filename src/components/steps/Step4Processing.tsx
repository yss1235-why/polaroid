import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/services/cloudinary";
import { CropData, RotationData, FilterType, TextOverlay } from "@/types";

interface Step4ProcessingProps {
  imageId: string;
  cropData: CropData;
  rotation: RotationData;
  filter: FilterType;
  textOverlay: TextOverlay | null;
  secondImageId?: string;
  secondCropData?: CropData;
  secondRotation?: RotationData;
  secondFilter?: FilterType;
  secondTextOverlay?: TextOverlay | null;
  onProcessingComplete: (
    processedUrl: string,
    enhancedUrl: string,
    secondProcessedUrl?: string,
    secondEnhancedUrl?: string
  ) => void;
}

const Step4Processing = ({ 
  imageId,
  cropData,
  rotation,
  filter,
  textOverlay,
  secondImageId,
  secondCropData,
  secondRotation,
  secondFilter,
  secondTextOverlay,
  onProcessingComplete 
}: Step4ProcessingProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Preparing your Polaroid...");

  useEffect(() => {
    processImages();
  }, []);

  const processImages = async () => {
    const isDualMode = !!secondImageId;
    
    // Simulate progress with status messages
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        
        // Update status message based on progress
        if (prev < 20) {
          setStatusMessage(isDualMode ? "Processing first photo..." : "Applying auto-enhancement...");
        } else if (prev < 40) {
          setStatusMessage(`Adding ${filter.displayName} filter...`);
        } else if (prev < 60) {
          setStatusMessage(textOverlay ? "Overlaying your text..." : "Creating Polaroid border...");
        } else if (prev < 80) {
          setStatusMessage("Creating Polaroid border...");
        } else if (isDualMode) {
          setStatusMessage("Processing second photo...");
        }
        
        return prev + 10;
      });
    }, 300);

    try {
      console.log("🎨 Starting Polaroid processing...");
      
      // Generate ENHANCED photo URL (for before/after comparison - NO frame)
      const enhancedUrl1 = cloudinaryService.generateEnhancedPhotoUrl(
        imageId,
        cropData,
        rotation,
        filter
      );

      console.log("✅ First enhanced photo URL:", enhancedUrl1);

      // Generate full PROCESSED Polaroid URL (with frame and text for final print)
      const processedUrl1 = cloudinaryService.generateProcessedUrl(
        imageId,
        cropData,
        rotation,
        filter,
        textOverlay || undefined
      );

      console.log("✅ First Polaroid processed:", processedUrl1);

      let processedUrl2: string | undefined;
      let enhancedUrl2: string | undefined;

      if (isDualMode && secondImageId && secondCropData && secondRotation) {
        // Generate enhanced URL for second photo
        enhancedUrl2 = cloudinaryService.generateEnhancedPhotoUrl(
          secondImageId,
          secondCropData,
          secondRotation,
          secondFilter || filter
        );

        console.log("✅ Second enhanced photo URL:", enhancedUrl2);

        // Generate processed URL for second photo
        processedUrl2 = cloudinaryService.generateProcessedUrl(
          secondImageId,
          secondCropData,
          secondRotation,
          secondFilter || filter,
          secondTextOverlay || undefined
        );

        console.log("✅ Second Polaroid processed:", processedUrl2);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Complete!");

      // Wait 500ms before showing results
      setTimeout(() => {
        onProcessingComplete(processedUrl1, enhancedUrl1, processedUrl2, enhancedUrl2);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error("❌ Processing error:", error);
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Circular Progress Indicator */}
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary transition-all duration-300"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">{progress}%</span>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Creating your Polaroid{secondImageId ? "s" : ""}...
        </h2>
        
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mb-4">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-lg text-muted-foreground mb-2">
          {statusMessage}
        </p>
        
        <p className="text-sm text-muted-foreground/70">
          Using professional photo standards
        </p>
      </div>
    </div>
  );
};

export default Step4Processing;
