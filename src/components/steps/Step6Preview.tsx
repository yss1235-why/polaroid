import { useEffect, useState } from "react";
import { ActionButtons } from "@/components/ActionButtons";
import { CheckCircle } from "lucide-react";

interface Step6PreviewProps {
  processedImage: string;
  layout: "standard" | "custom";
  onPrint: () => void;
  onBack: () => void;
}

const Step6Preview = ({ processedImage, layout, onPrint, onBack }: Step6PreviewProps) => {
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateSheetPreview();
  }, [processedImage, layout]);

  const generateSheetPreview = async () => {
    setIsGenerating(true);
    
    // Simulate sheet generation
    setTimeout(() => {
      // In production, this would call the backend API
      // const response = await apiService.previewSheet(imageId, layout);
      
      // For demo, create a simple preview
      createPreviewSheet();
    }, 1500);
  };

  const createPreviewSheet = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 4x6 inches at 150 DPI for preview (actual print is 300 DPI)
    const width = 600;  // 4 inches * 150 DPI
    const height = 900; // 6 inches * 150 DPI
    
    canvas.width = width;
    canvas.height = height;
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Calculate grid
      const cols = layout === "standard" ? 3 : 2;
      const rows = layout === "standard" ? 4 : 3;
      const photoCount = cols * rows;
      
      // Passport photo aspect ratio: 3.5:4.5 = 0.7778
      const aspectRatio = 3.5 / 4.5;
      const padding = 10;
      
      const availableWidth = (width - padding * (cols + 1)) / cols;
      const photoWidth = availableWidth;
      const photoHeight = photoWidth / aspectRatio;
      
      // Load and draw image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = padding + col * (photoWidth + padding);
            const y = padding + row * (photoHeight + padding);
            
            // Draw photo
            ctx.drawImage(img, x, y, photoWidth, photoHeight);
            
            // Draw border
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, photoWidth, photoHeight);
          }
        }
        
        setSheetPreview(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      };
      img.src = processedImage;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-8 h-8 text-success" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Ready to Print!
          </h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Review your photo sheet before printing
        </p>
      </div>

      {/* Sheet Preview */}
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-lg overflow-hidden bg-white border-2 border-border shadow-xl">
          {isGenerating ? (
            <div className="aspect-[2/3] flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating print sheet...</p>
              </div>
            </div>
          ) : sheetPreview ? (
            <img
              src={sheetPreview}
              alt="Print sheet preview"
              className="w-full h-auto"
            />
          ) : null}
        </div>
      </div>

      {/* Sheet Info */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {layout === "standard" ? "12" : "6"}
          </div>
          <p className="text-sm text-muted-foreground">Photos per sheet</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            4×6"
          </div>
          <p className="text-sm text-muted-foreground">Paper size</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            300
          </div>
          <p className="text-sm text-muted-foreground">DPI quality</p>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
          <span>🖨️</span>
          Printing Tips:
        </h3>
        <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <li>• Use photo paper for best results</li>
          <li>• Set printer to "Best Quality" or "Photo" mode</li>
          <li>• Ensure "Fit to Page" is disabled</li>
          <li>• Cut along the grid lines carefully</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto">
        <ActionButtons
          onPrint={onPrint}
          onBack={onBack}
          disabled={isGenerating}
          showBackButton={true}
        />
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          Photo processing complete
        </div>
      </div>
    </div>
  );
};

export default Step6Preview;
