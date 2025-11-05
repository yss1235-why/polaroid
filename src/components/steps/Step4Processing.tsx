import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CropData } from "@/types";

interface Step4ProcessingProps {
  originalImage: string;
  imageId: string;
  cropData: CropData | null;
  onProcessingComplete: (processedImage: string) => void;
}

const Step4Processing = ({ 
  originalImage,
  imageId,
  cropData,
  onProcessingComplete 
}: Step4ProcessingProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    setProcessing(true);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Always use passport mode with 40% enhancement
      const response = await apiService.processPhoto(
        imageId,
        "passport",
        40,
        "white",
        cropData || undefined
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.success && response.data) {
        // Wait 1 second before continuing
        setTimeout(() => {
          onProcessingComplete(response.data.processed_image);
        }, 1000);
      } else {
        throw new Error(response.error || "Processing failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="w-full h-full border-8 border-primary/20 rounded-full" />
          <div 
            className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)`
            }}
          />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Spicing up your passport photo...
        </h2>
        
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mb-4">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-lg text-muted-foreground">
          {progress}% Complete
        </p>
      </div>
    </div>
  );
};

export default Step4Processing;
