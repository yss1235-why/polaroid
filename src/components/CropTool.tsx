import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCw, RotateCcw, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CropData, RotationData } from "@/types";

interface CropToolProps {
  imageUrl: string;
  onCropChange: (cropData: CropData) => void;
  onRotationChange: (rotation: RotationData) => void;
  currentRotation?: number;
}

export const CropTool = ({ 
  imageUrl, 
  onCropChange, 
  onRotationChange,
  currentRotation = 0 
}: CropToolProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(currentRotation as 0 | 90 | 180 | 270);

  // Polaroid aspect ratio: 2:3 (width:height)
  const CROP_ASPECT_RATIO = 2 / 3;

  useEffect(() => {
    if (imageLoaded && naturalDimensions.width > 0) {
      updateCropData();
    }
  }, [zoom, position, imageLoaded, naturalDimensions, rotation]);

  const updateCropData = () => {
    if (!containerRef.current || !imageRef.current || !cropBoxRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    const cropBox = cropBoxRef.current;
    const cropWidth = cropBox.offsetWidth;
    const cropHeight = cropBox.offsetHeight;
    
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    const imageLeft = containerCenterX + position.x - (displayWidth * zoom) / 2;
    const imageTop = containerCenterY + position.y - (displayHeight * zoom) / 2;
    
    const cropLeftOnImage = (containerCenterX - cropWidth / 2 - imageLeft) / zoom;
    const cropTopOnImage = (containerCenterY - cropHeight / 2 - imageTop) / zoom;
    const cropWidthOnImage = cropWidth / zoom;
    const cropHeightOnImage = cropHeight / zoom;
    
    const normalizedX = cropLeftOnImage / displayWidth;
    const normalizedY = cropTopOnImage / displayHeight;
    const normalizedWidth = cropWidthOnImage / displayWidth;
    const normalizedHeight = cropHeightOnImage / displayHeight;
    
    const cropData: CropData = {
      x: Math.max(0, Math.min(1, normalizedX)),
      y: Math.max(0, Math.min(1, normalizedY)),
      width: Math.max(0, Math.min(1, normalizedWidth)),
      height: Math.max(0, Math.min(1, normalizedHeight)),
      displayWidth: displayWidth,
      displayHeight: displayHeight,
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      zoom: zoom,
    };

    onCropChange(cropData);
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setNaturalDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      setImageLoaded(true);
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

  const handleRotateRight = () => {
    const newRotation = ((rotation + 90) % 360) as 0 | 90 | 180 | 270;
    setRotation(newRotation);
    onRotationChange({ angle: newRotation });
  };

  const handleRotateLeft = () => {
    const newRotation = ((rotation - 90 + 360) % 360) as 0 | 90 | 180 | 270;
    setRotation(newRotation);
    onRotationChange({ angle: newRotation });
  };

  const handleFlipHorizontal = () => {
    // Flip is rotation 180
    const newRotation = ((rotation + 180) % 360) as 0 | 90 | 180 | 270;
    setRotation(newRotation);
    onRotationChange({ angle: newRotation });
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
    <div className="h-full flex flex-col">
      {/* Crop Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-muted overflow-hidden"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
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
          <div className="absolute inset-0 bg-black/40" />
          
          <div 
            ref={cropBoxRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary bg-transparent shadow-lg"
            style={{
              width: `${Math.min(280, containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.6 : 280)}px`,
              aspectRatio: `${CROP_ASPECT_RATIO}`,
            }}
          >
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
            
            {/* Grid lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/30" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/30" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/30" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/30" />
            
            {/* Text area removed - borders added by Cloudinary later */}
          </div>

         <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            {!imageLoaded ? "Loading..." : "Crop your photo - borders added automatically"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-card border-t border-border">
        {/* Rotation Controls */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateLeft}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Rotate Left</span>
          </Button>
          
          <div className="px-3 py-1 bg-muted rounded text-sm font-medium">
            {rotation}°
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateRight}
            className="gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Rotate Right</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipHorizontal}
            className="gap-2"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Flip</span>
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-2">
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
      </div>
    </div>
  );
};
