import { useState } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2ModeSelect from "@/components/steps/Step2ModeSelect";
import Step3Crop from "@/components/steps/Step3Crop";
import Step4Enhance from "@/components/steps/Step4Enhance";
import Step5Layout from "@/components/steps/Step5Layout";
import Step6Preview from "@/components/steps/Step6Preview";
import StepNavigation from "@/components/StepNavigation";
import { PhotoData, ProcessingMode, CropData } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoData>({
    original: null,
    processed: null,
    cropped: null,
    final: null,
    imageId: undefined,
  });
  const [mode, setMode] = useState<ProcessingMode>("passport");
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [enhancementLevel, setEnhancementLevel] = useState(60);
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "custom">("standard");

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    setPhotoData({ ...photoData, original: imageUrl, imageId });
    handleNext();
  };

  const handleModeSelect = (selectedMode: ProcessingMode) => {
    setMode(selectedMode);
    handleNext();
  };

  const handleCropComplete = (croppedImage: string, cropCoords: CropData) => {
    setPhotoData({ ...photoData, cropped: croppedImage });
    setCropData(cropCoords);
    handleNext();
  };

  const handleEnhancementChange = (value: number) => {
    setEnhancementLevel(value);
  };

  const handleEnhancementComplete = (processedImage: string) => {
    setPhotoData({ ...photoData, processed: processedImage });
    handleNext();
  };

  const handleLayoutSelect = (layout: "standard" | "custom") => {
    setSelectedLayout(layout);
    handleNext();
  };

  const handlePrint = () => {
    toast({
      title: "✅ Print initiated",
      description: "Check your print dialog",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Upload onUploadComplete={handleUploadComplete} />;
      case 2:
        return <Step2ModeSelect onModeSelect={handleModeSelect} selectedMode={mode} />;
      case 3:
        return (
          <Step3Crop
            imageUrl={photoData.original!}
            imageId={photoData.imageId!}
            onCropComplete={handleCropComplete}
          />
        );
      case 4:
        return (
          <Step4Enhance
            originalImage={photoData.cropped || photoData.original!}
            imageId={photoData.imageId!}
            mode={mode}
            enhancementLevel={enhancementLevel}
            onEnhancementChange={handleEnhancementChange}
            onEnhancementComplete={handleEnhancementComplete}
          />
        );
      case 5:
        return (
          <Step5Layout
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
          />
        );
      case 6:
