import { useEffect, useState } from "react";
import { Printer, Upload } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Step6FinalProps {
  imageId: string;
  layout: "standard" | "custom";
  onPrint: () => void;
  onRetake: () => void;
}

const Step6Final = ({ 
  imageId, 
  layout, 
  onPrint,
  onRetake 
}: Step6FinalProps) => {
  const { toast } = useToast();
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    generateSheetPreview();
  }, [imageId, layout]);

  const generateSheetPreview = async () => {
    setIsGenerating(true);
    
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.previewSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        setSheetPreview(response.data.preview_sheet);
      } else {
        throw new Error(response.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.printSheet(imageId, apiLayout, 1);

      if (response.success && response.data) {
        toast({
          title: "✅ Print job sent",
          description: `Printing to ${response.data.printer}`,
        });
        onPrint();
      } else {
        throw new Error(response.error || "Print job failed");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 relative overflow-hidden bg-white">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Preparing print sheet...</p>
            </div>
          </div>
        ) : sheetPreview ? (
          <img
            src={sheetPreview}
            alt="Print sheet preview"
            className="w-full h-full object-contain"
            style={{ imageRendering: 'high-quality' }}
          />
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button 
          onClick={handlePrint}
          disabled={isGenerating || isPrinting}
          className="w-full gap-2"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          {isPrinting ? "Printing..." : "Print Now"}
        </Button>
        <Button 
          onClick={onRetake}
          variant="outline"
          className="w-full gap-2"
          size="lg"
        >
          <Upload className="w-5 h-5" />
          Retake Photo
        </Button>
      </div>
    </div>
  );
};

export default Step6Final;
