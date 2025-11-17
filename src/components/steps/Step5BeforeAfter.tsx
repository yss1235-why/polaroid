import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Loader2 } from "lucide-react";

interface Step5BeforeAfterProps {
  originalImage: string;
  processedImage: string;
  secondOriginalImage?: string;
  secondProcessedImage?: string;
  onContinue: () => void;
  onRetake: () => void;
}

const Step5BeforeAfter = ({
  originalImage,
  processedImage,
  secondOriginalImage,
  secondProcessedImage,
  onContinue,
  onRetake,
}: Step5BeforeAfterProps) => {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeComparison, setActiveComparison] = useState<"first" | "second">("first");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Image loading states
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  const isDualMode = !!secondOriginalImage && !!secondProcessedImage;

  // Check if both images are loaded
  useEffect(() => {
    if (beforeLoaded && afterLoaded) {
      // Add a small delay to ensure images are fully rendered
      setTimeout(() => {
        setImagesReady(true);
      }, 300);
    }
  }, [beforeLoaded, afterLoaded]);

  // Reset loading states when switching photos in dual mode
  useEffect(() => {
    setBeforeLoaded(false);
    setAfterLoaded(false);
    setImagesReady(false);
  }, [activeComparison]);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setDividerPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const currentOriginal = activeComparison === "first" ? originalImage : secondOriginalImage!;
  const currentProcessed = activeComparison === "first" ? processedImage : secondProcessedImage!;

  const handleBeforeLoad = () => {
    console.log("✅ Before image loaded");
    setBeforeLoaded(true);
  };

  const handleAfterLoad = () => {
    console.log("✅ After image loaded");
    setAfterLoaded(true);
  };

  const handleBeforeError = () => {
    console.error("❌ Before image failed to load");
    setBeforeLoaded(true); // Continue anyway to avoid blocking
  };

  const handleAfterError = () => {
    console.error("❌ After image failed to load");
    setAfterLoaded(true); // Continue anyway to avoid blocking
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          Compare Your Results
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag the slider to see before and after enhancement
        </p>
      </div>

      {/* Photo Selector (if dual mode) */}
      {isDualMode && (
        <div className="p-2 bg-card border-b border-border flex justify-center gap-2">
          <Button
            variant={activeComparison === "first" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveComparison("first");
              setDividerPosition(50);
            }}
          >
            Left Polaroid
          </Button>
          <Button
            variant={activeComparison === "second" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveComparison("second");
              setDividerPosition(50);
            }}
          >
            Right Polaroid
          </Button>
        </div>
      )}

      {/* Comparison Slider */}
      <div className="flex-1 relative">
        {/* Loading Overlay */}
        {!imagesReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-50">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">
                Loading images from Cloudinary...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`relative h-full rounded-lg overflow-hidden cursor-col-resize select-none border border-border shadow-lg touch-none bg-muted transition-opacity duration-300 ${
            imagesReady ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
        >
          {/* Original Image (Cropped Only - No Enhancements) */}
          <img
            src={currentOriginal}
            alt="Cropped photo without enhancements"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
            onLoad={handleBeforeLoad}
            onError={handleBeforeError}
          />

          {/* Processed Image with Clip (Enhanced Photo - NO Polaroid Frame) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
          >
            <img
              src={currentProcessed}
              alt="Enhanced photo with filters"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
              onLoad={handleAfterLoad}
              onError={handleAfterError}
            />
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium pointer-events-none">
            Before Enhancement
          </div>
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium pointer-events-none">
            After Enhancement
          </div>

          {/* Divider */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg pointer-events-none"
            style={{ left: `${dividerPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-primary-foreground" />
                <div className="w-0.5 h-4 bg-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-xs md:text-sm font-medium pointer-events-none">
            Drag to compare
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3 bg-card border-t border-border">
        <Button 
          onClick={onContinue} 
          disabled={!imagesReady}
          className="w-full gap-2" 
          size="lg"
        >
          {imagesReady ? (
            <>
              Continue to Print
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading images...
            </>
          )}
        </Button>
        <Button
          onClick={onRetake}
          variant="outline"
          className="w-full gap-2"
          size="lg"
          disabled={!imagesReady}
        >
          <Upload className="w-5 h-5" />
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default Step5BeforeAfter;
