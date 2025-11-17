import { useState } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2Crop from "@/components/steps/Step2Crop";
import Step3Filter from "@/components/steps/Step3Filter";
import Step3_5Text from "@/components/steps/Step3_5Text";
import Step4Processing from "@/components/steps/Step4Processing";
import Step5BeforeAfter from "@/components/steps/Step5BeforeAfter";
import Step6Final from "@/components/steps/Step6Final";
import StepNavigation from "@/components/StepNavigation";
import { PhotoData, CropData, RotationData, FilterType, TextOverlay } from "@/types";
import { cloudinaryService } from "@/services/cloudinary";

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoData>({
    original: null,
    processed: null,
    cropped: null,
    final: null,
    imageId: undefined,
    secondImageId: undefined,
    secondOriginal: null,
    secondProcessed: null,
    croppedOnly: null,
    secondCroppedOnly: null,
  });

  // Processing data
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [rotation, setRotation] = useState<RotationData>({ angle: 0 });
  const [filter, setFilter] = useState<FilterType | null>(null);
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);

  // Second photo data (for dual mode)
  const [secondCropData, setSecondCropData] = useState<CropData | null>(null);
  const [secondRotation, setSecondRotation] = useState<RotationData>({ angle: 0 });
  const [secondFilter, setSecondFilter] = useState<FilterType | null>(null);
  const [secondTextOverlay, setSecondTextOverlay] = useState<TextOverlay | null>(null);

  const totalSteps = 7;

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

  const handleRetake = () => {
    console.log("🔄 Starting over");
    setCurrentStep(1);
    setPhotoData({
      original: null,
      processed: null,
      cropped: null,
      final: null,
      imageId: undefined,
      secondImageId: undefined,
      secondOriginal: null,
      secondProcessed: null,
      croppedOnly: null,
      secondCroppedOnly: null,
    });
    setCropData(null);
    setRotation({ angle: 0 });
    setFilter(null);
    setTextOverlay(null);
    setSecondCropData(null);
    setSecondRotation({ angle: 0 });
    setSecondFilter(null);
    setSecondTextOverlay(null);
  };

  // Step 1: Upload
  const handleUploadComplete = (
    imageUrl: string,
    imageId: string,
    secondImageUrl?: string,
    secondImageId?: string
  ) => {
    console.log("📤 Upload complete");
    console.log("Image ID:", imageId);
    if (secondImageId) {
      console.log("Second Image ID:", secondImageId);
    }

    setPhotoData({
      ...photoData,
      original: imageUrl,
      imageId,
      secondOriginal: secondImageUrl || null,
      secondImageId: secondImageId || undefined,
    });
    handleNext();
  };

  // Step 2: Crop & Rotate
  const handleCropComplete = (
    crop: CropData,
    rot: RotationData,
    secondCrop?: CropData,
    secondRot?: RotationData
  ) => {
    console.log("✂️ Crop complete");
    setCropData(crop);
    setRotation(rot);
    if (secondCrop && secondRot) {
      setSecondCropData(secondCrop);
      setSecondRotation(secondRot);
    }

    // Generate cropped-only URLs for before/after preview
    if (photoData.imageId) {
      const croppedOnlyUrl = cloudinaryService.generateCroppedOnlyUrl(
        photoData.imageId,
        crop,
        rot
      );
      console.log("📸 Cropped-only URL generated:", croppedOnlyUrl);
      
      setPhotoData(prev => ({
        ...prev,
        croppedOnly: croppedOnlyUrl,
      }));

      // If dual mode, generate second cropped-only URL
      if (photoData.secondImageId && secondCrop && secondRot) {
        const secondCroppedOnlyUrl = cloudinaryService.generateCroppedOnlyUrl(
          photoData.secondImageId,
          secondCrop,
          secondRot
        );
        console.log("📸 Second cropped-only URL generated:", secondCroppedOnlyUrl);
        
        setPhotoData(prev => ({
          ...prev,
          secondCroppedOnly: secondCroppedOnlyUrl,
        }));
      }
    }

    handleNext();
  };

  // Step 3: Filter
  const handleFilterSelect = (selectedFilter: FilterType, secondSelectedFilter?: FilterType) => {
    console.log("🎨 Filter selected:", selectedFilter.displayName);
    setFilter(selectedFilter);
    if (secondSelectedFilter) {
      setSecondFilter(secondSelectedFilter);
      console.log("🎨 Second filter:", secondSelectedFilter.displayName);
    }
    handleNext();
  };

  // Step 4: Text
  const handleTextComplete = (text: TextOverlay | null, secondText?: TextOverlay | null) => {
    console.log("✍️ Text overlay:", text?.content || "None");
    setTextOverlay(text);
    if (secondText !== undefined) {
      setSecondTextOverlay(secondText);
      console.log("✍️ Second text:", secondText?.content || "None");
    }
    handleNext();
  };

  // Step 5: Processing
  const handleProcessingComplete = (processedUrl: string, secondProcessedUrl?: string) => {
    console.log("✅ Processing complete");
    console.log("Processed URL:", processedUrl);
    if (secondProcessedUrl) {
      console.log("Second Processed URL:", secondProcessedUrl);
    }

    setPhotoData({
      ...photoData,
      processed: processedUrl,
      secondProcessed: secondProcessedUrl || null,
    });
    handleNext();
  };

  // Step 6: Print
  const handlePrint = () => {
    toast({
      title: "✅ Print initiated",
      description: "Check the printer for your Polaroids",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Upload onUploadComplete={handleUploadComplete} />;

      case 2:
        return (
          <Step2Crop
            imageUrl={photoData.original!}
            imageId={photoData.imageId!}
            secondImageUrl={photoData.secondOriginal || undefined}
            secondImageId={photoData.secondImageId}
            onCropComplete={handleCropComplete}
          />
        );

      case 3:
        return (
          <Step3Filter
            imageId={photoData.imageId!}
            secondImageId={photoData.secondImageId}
            onFilterSelect={handleFilterSelect}
          />
        );

      case 4:
        return (
          <Step3_5Text
            onTextComplete={handleTextComplete}
            isDualMode={!!photoData.secondImageId}
          />
        );

      case 5:
        return (
          <Step4Processing
            imageId={photoData.imageId!}
            cropData={cropData!}
            rotation={rotation}
            filter={filter!}
            textOverlay={textOverlay}
            secondImageId={photoData.secondImageId}
            secondCropData={secondCropData || undefined}
            secondRotation={secondRotation}
            secondFilter={secondFilter || undefined}
            secondTextOverlay={secondTextOverlay || undefined}
            onProcessingComplete={handleProcessingComplete}
          />
        );

      case 6:
        return (
          <Step5BeforeAfter
            originalImage={photoData.croppedOnly!}
            processedImage={photoData.processed!}
            secondOriginalImage={photoData.secondCroppedOnly || undefined}
            secondProcessedImage={photoData.secondProcessed || undefined}
            onContinue={handleNext}
            onRetake={handleRetake}
          />
        );

      case 7:
        return (
          <Step6Final
            leftPolaroidUrl={photoData.processed!}
            rightPolaroidUrl={photoData.secondProcessed || photoData.processed!}
            leftImageId={photoData.imageId!}
            rightImageId={photoData.secondImageId || photoData.imageId!}
            onPrint={handlePrint}
            onRetake={handleRetake}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex
