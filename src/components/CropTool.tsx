// src/components/CropTool.tsx

import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CropData } from "@/types";

interface CropToolProps {
  imageUrl: string;
  onCropChange: (cropData: CropData) => void;
}

export const CropTool = ({ imageUrl, onCropChange }: CropToolProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // ✅ NEW: Track natural image dimensions
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // Passport photo aspect ratio: 3.5cm x 4.5cm = 0.7778 (width/height)
  const CROP_ASPECT_RATIO = 3.5 / 4.5;

  // ✅ UPDATED: Calculate and send normalized crop data
  useEffect(() => {
    if (imageLoaded && naturalDimensions.width > 0) {
      updateCropData();
    }
  }, [zoom, position, imageLoaded, naturalDimensions]);

  const updateCropData = () => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    
    // Get display dimensions
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    // Calculate crop area dimensions (in display pixels)
    const cropHeight = container.height * 0.7; // 70% of container
    const cropWidth = cropHeight * CROP_ASPECT_RATIO;
    
    // Calculate center of container
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    // Calculate crop area center in display coordinates
    const cropCenterX = containerCenterX;
    const cropCenterY = containerCenterY;
    
    // Calculate image position relative to container after zoom and pan
    const imageLeft = containerCenterX + position.x - (displayWidth * zoom) / 2;
    const imageTop = containerCenterY + position.y - (displayHeight * zoom) / 2;
    
    // Calculate crop area position relative to zoomed image
    const cropLeftOnImage = (cropCenterX - cropWidth / 2 - imageLeft) / zoom;
    const cropTopOnImage = (cropCenterY - cropHeight / 2 - imageTop) / zoom;
    const cropWidthOnImage = cropWidth / zoom;
    const cropHeightOnImage = cropHeight / zoom;
    
    // ✅ HYBRID APPROACH: Convert to normalized coordinates (0-1)
    const normalizedX = cropLeftOnImage / displayWidth;
    const normalizedY = cropTopOnImage / displayHeight;
    const normalizedWidth = cropWidthOnImage / displayWidth;
    const normalizedHeight = cropHeightOnImage / displayHeight;
    
    const cropData: CropData = {
      // Normalized coordinates (0-1) - MAIN DATA
      x: normalizedX,
      y: normalizedY,
      width: normalizedWidth,
      height: normalizedHeight,
      
      // Display dimensions (for debugging)
      displayWidth: displayWidth,
      displayHeight: displayHeight,
      
      // Natural dimensions (CRITICAL for backend)
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      
      // Transform
      zoom: zoom,
    };

    console.log("📐 Crop Data (Hybrid):", {
      normalized: { x: normalizedX, y: normalizedY, w: normalizedWidth, h: normalizedHeight },
      display: { w: displayWidth, h: displayHeight },
      natural: { w: naturalDimensions.width, h: naturalDimensions.height },
      zoom: zoom
    });

    onCropChange(cropData);
  };

  // ✅ NEW: Capture natural dimensions when image loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      setNaturalDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      setImageLoaded(true);
      
      console.log("✅ Image loaded:", {
        natural: `${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`,
        display: `${imageRef.current.offsetWidth}x${imageRef.current.offsetHeight}`
      });
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="space-y-4">
      {/* Crop Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-[400px] md:h-[500px] bg-muted rounded-lg overflow-hidden border-2 border-border"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            draggable={false}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Crop Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Crop frame (3.5:4.5 ratio) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary bg-transparent shadow-lg"
            style={{
              width: `${Math.min(280, containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.7 : 280)}px`,
              aspectRatio: `${CROP_ASPECT_RATIO}`,
            }}
          >
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
            
            {/* Center guides */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
            
            {/* Face guide circle */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] aspect-square rounded-full border-2 border-dashed border-primary/40" />
          </div>

          {/* Instruction overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-xs md:text-sm font-medium">
            {!imageLoaded ? "Loading..." : "Drag to position • Pinch to zoom"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <div className="px-4 py-2 bg-muted rounded-md text-sm font-medium min-w-[80px] text-center">
          {Math.round(zoom * 100)}%
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      {/* Debug info (optional - remove in production) */}
      {imageLoaded && (
        <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-2">
          Natural: {naturalDimensions.width}×{naturalDimensions.height}px
        </div>
      )}
    </div>
  );
};
