import { useState, useEffect } from "react";
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
import { apiService } from "@/services/api";

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
    enhancedOnly: null,
    secondEnhancedOnly: null,
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

  // NEW: Pre-loaded filter URLs
  const [preloadedFilterUrls, setPreloadedFilterUrls] = useState<Map<string, string>>(new Map());
  const [secondPreloadedFilterUrls, setSecondPreloadedFilterUrls] = useState<Map<string, string>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);

  const totalSteps = 7;

  // NEW: Pre-load filter previews in background
  const preloadFilterPreviews = async (imageId: string, isSecondPhoto: boolean = false) => {
    console.log(`🔄 Starting pre-load for ${isSecondPhoto ? 'second' : 'first'} photo filters...`);
    setIsPreloading(true);

    const urls = new Map<string, string>();
    const CLOUDINARY_FILTERS = (await import("@/types")).CLOUDINARY_FILTERS;

    // Priority filters to load first
    const priorityFilters = ['none', 'audrey', 'frost', 'primavera', 'refresh'];
    const otherFilters = CLOUDINARY_FILTERS.filter(f => !priorityFilters.includes(f.name));
    const loadOrder = [
      ...CLOUDINARY_FILTERS.filter(f => priorityFilters.includes(f.name)),
      ...otherFilters
    ];

    for (let i = 0; i < loadOrder.length; i++) {
      const filter = loadOrder[i];
      
      try {
        const response = await apiService.getPreview(imageId, filter.name);
        
        if (response.success && response.data) {
          urls.set(filter.name, response.data.preview_url);
          
          // Update state progressively
          if (isSecondPhoto) {
            setSecondPreloadedFilterUrls(new Map(urls));
          } else {
            setPreloadedFilterUrls(new Map(urls));
          }

          console.log(`✅ Pre-loaded ${filter.name} (${i + 1}/${loadOrder.length})`);
        }

        // Delay between requests - longer at first, shorter later
        const delay = i < 3 ? 3000 : i < 8 ? 2000 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`❌ Failed to pre-load ${filter.name}:`, error);
        // Continue with next filter even if one fails
      }
    }

    setIsPreloading(false);
    console.log(`✅ Pre-loading complete for ${isSecondPhoto ? 'second' : 'first'} photo`);
  };

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
      enhancedOnly: null,
      secondEnhancedOnly: null,
    });
    setCropData(null);
    setRotation({ angle: 0 });
    setFilter(null);
    setTextOverlay(null);
    setSecondCropData(null);
    setSecondRotation({ angle: 0 });
    setSecondFilter(null);
    setSecondTextOverlay(null);
    setPreloadedFilterUrls(new Map());
    setSecondPreloadedFilterUrls(new Map());
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

  // Step 2: Crop & Rotate - START PRE-LOADING HERE
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

    // START PRE-LOADING FILTERS IN BACKGROUND
    if (photoData.imageId) {
      preloadFilterPreviews(photoData.imageId, false);
    }
    if (photoData.secondImageId) {
      preloadFilterPreviews(photoData.secondImageId, true);
    }

    // Move to TEXT step (not filters) to give time for pre-loading
    handleNext();
  };

  // Step 3: Text (swapped with filters)
  const handleTextComplete = (text: TextOverlay | null, secondText?: TextOverlay | null) => {
    console.log("✍️ Text overlay:", text?.content || "None");
    setTextOverlay(text);
    if (secondText !== undefined) {
      setSecondTextOverlay(secondText);
      console.log("✍️ Second text:", secondText?.content || "None");
    }
    
    // Now go to filter selection (previews should be mostly loaded)
    handleNext();
  };

  // Step 4: Filter (comes after text now)
  const handleFilterSelect = (selectedFilter: FilterType, secondSelectedFilter?: FilterType) => {
    console.log("🎨 Filter selected:", selectedFilter.displayName);
    setFilter(selectedFilter);
    if (secondSelectedFilter) {
      setSecondFilter(secondSelectedFilter);
      console.log("🎨 Second filter:", secondSelectedFilter.displayName);
    }
    handleNext();
  };

  // Step 5: Processing
  const handleProcessingComplete = (
    processedUrl: string, 
    enhancedUrl: string,
    secondProcessedUrl?: string,
    secondEnhancedUrl?: string
  ) => {
    console.log("✅ Processing complete");
    console.log("Processed Polaroid URL:", processedUrl);
    console.log("Enhanced photo URL:", enhancedUrl);
    if (secondProcessedUrl && secondEnhancedUrl) {
      console.log("Second Processed Polaroid URL:", secondProcessedUrl);
      console.log("Second Enhanced photo URL:", secondEnhancedUrl);
    }

    setPhotoData({
      ...photoData,
      processed: processedUrl,
      enhancedOnly: enhancedUrl,
      secondProcessed: secondProcessedUrl || null,
      secondEnhancedOnly: secondEnhancedUrl || null,
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
        // TEXT STEP NOW (swapped with filters)
        return (
          <Step3_5Text
            onTextComplete={handleTextComplete}
            isDualMode={!!photoData.secondImageId}
          />
        );

      case 4:
        // FILTER STEP NOW (swapped with text)
        return (
          <Step3Filter
            imageId={photoData.imageId!}
            secondImageId={photoData.secondImageId}
            onFilterSelect={handleFilterSelect}
            preloadedUrls={preloadedFilterUrls}
            secondPreloadedUrls={secondPreloadedFilterUrls}
            isPreloading={isPreloading}
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
            originalImage={photoData.original!}
            processedImage={photoData.enhancedOnly!}
            secondOriginalImage={photoData.secondOriginal || undefined}
            secondProcessedImage={photoData.secondEnhancedOnly || undefined}
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Polaroid Photo Printer
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Create instant memories
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Navigation */}
      {currentStep > 1 && currentStep < 7 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          mode="polaroid"
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto">
        {renderStep()}
      </main>
    </div>
  );
};

export default Index;
