import { useState } from "react";
import { CropTool } from "@/components/CropTool";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CropData, RotationData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { validateCropData } from "@/utils/polaroidHelpers";

interface Step2CropProps {
  imageUrl: string;
  imageId: string;
  secondImageUrl?: string;
  secondImageId?: string;
  onCropComplete: (
    cropData: CropData,
    rotation: RotationData,
    secondCropData?: CropData,
    secondRotation?: RotationData
  ) => void;
}

const Step2Crop = ({ 
  imageUrl, 
  imageId,
  secondImageUrl,
  secondImageId,
  onCropComplete 
}: Step2CropProps) => {
  const { toast } = useToast();
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [rotation, setRotation] = useState<RotationData>({ angle: 0 });
  const [secondCropData, setSecondCropData] = useState<CropData | null>(null);
  const [secondRotation, setSecondRotation] = useState<RotationData>({ angle: 0 });
  const [currentPhoto, setCurrentPhoto] = useState<"first" | "second">("first");

  const isDualMode = !!secondImageUrl && !!secondImageId;

  const handleCropChange = (data: CropData) => {
    if (currentPhoto === "first") {
      setCropData(data);
    } else {
      setSecondCropData(data);
    }
  };

  const handleRotationChange = (rot: RotationData) => {
    if (currentPhoto === "first") {
      setRotation(rot);
    } else {
      setSecondRotation(rot);
    }
  };

  const handleContinue = () => {
    if (!cropData || !validateCropData(cropData)) {
      toast({
        title: "Adjust crop area",
        description: "Please position the crop area over your subject",
        variant: "destructive",
      });
      return;
    }

    if (isDualMode && currentPhoto === "first") {
      // Move to second photo
      setCurrentPhoto("second");
      return;
    }

    if (isDualMode && (!secondCropData || !validateCropData(secondCropData))) {
      toast({
        title: "Crop second photo",
        description: "Please crop the second photo as well",
        variant: "destructive",
      });
      return;
    }

    // All done
    onCropComplete(
      cropData,
      rotation,
      isDualMode ? secondCropData : undefined,
      isDualMode ? secondRotation : undefined
    );
  };

  const handleBack = () => {
    if (isDualMode && currentPhoto === "second") {
      setCurrentPhoto("first");
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      {isDualMode && (
        <div className="p-4 bg-card border-b border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Cropping {currentPhoto === "first" ? "Left" : "Right"} Polaroid
            {" "}(Photo {currentPhoto === "first" ? "1" : "2"} of 2)
          </p>
        </div>
      )}

      {/* Crop Tool */}
      <div className="flex-1 relative">
        {currentPhoto === "first" ? (
          <CropTool 
            imageUrl={imageUrl}
            onCropChange={handleCropChange}
            onRotationChange={handleRotationChange}
            currentRotation={rotation.angle}
          />
        ) : (
          <CropTool 
            imageUrl={secondImageUrl!}
            onCropChange={handleCropChange}
            onRotationChange={handleRotationChange}
            currentRotation={secondRotation.angle}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
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
        
        <Button 
          onClick={handleContinue}
          disabled={!cropData}
          className="w-full gap-2"
          size="lg"
        >
          {isDualMode && currentPhoto === "first" ? "Continue to Second Photo" : "Continue to Filters"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Crop;
