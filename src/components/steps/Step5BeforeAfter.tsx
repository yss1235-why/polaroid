import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";

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

  const isDualMode = !!secondOriginalImage && !!secondProcessedImage;

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

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          Compare Your Results
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag the slider to see before and after
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
        <div
          ref={containerRef}
          className="relative h-full rounded-lg overflow-hidden cursor-col-resize select-none border border-border shadow-lg touch-none bg-muted"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
        >
          {/* Original Image (Background) */}
          <img
            src={currentOriginal}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Processed Image with Clip */}
          <div
            className="absolute inset-0 overflow
