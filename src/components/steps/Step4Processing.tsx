import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
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
          setStatusMessage(isDualMode ? "Processing first photo..." : "Sending to backend...");
        } else if (prev < 40) {
          setStatusMessage(`Applying ${filter.displayName} filter...`);
        } else if (prev < 60) {
          setStatusMessage(textOverlay ? "Adding your text..." : "Creating Polaroid border...");
        } else if (prev < 80) {
          setStatusMessage("Creating Polaroid border...");
        } else if (isDualMode) {
          setStatusMessage("Processing second photo...");
        }
        
        return prev + 10;
      });
    }, 300);

    try {
      console.log("🎨 Starting backend processing...");
      
      // Call backend API to process images
      const response = await apiService.processImages({
        left_image_id: imageId,
        left_crop: cropData,
        left_rotation: rotation.angle,
        left_filter: filter.name,
        left_text: textOverlay || undefined,
        right_image_id: secondImageId || imageId,
        right_crop: secondCropData || cropData,
        right_rotation: secondRotation?.angle || rotation.angle,
        right_filter: secondFilter?.name || filter.name,
        right_text: secondTextOverlay || textOverlay || undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Processing failed");
      }

      console.log("✅ Backend processing complete");
      console.log("Job ID:", response.data.job_id);

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Complete!");

      // Wait 500ms before showing results
      setTimeout(() => {
        onProcessingComplete(
          response.data!.left_polaroid,
          response.data!.left_enhanced,
          response.data!.right_polaroid,
          response.data!.right_enhanced
        );
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
          Backend is processing your photos
        </p>
      </div>
    </div>
  );
};

export default Step4Processing;
