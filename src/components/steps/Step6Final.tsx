import { useEffect, useState } from "react";
import { Printer, Upload, Trash2, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cloudinaryService } from "@/services/cloudinary";

interface Step6FinalProps {
  leftPolaroidUrl: string;
  rightPolaroidUrl: string;
  leftImageId: string;
  rightImageId: string;
  onPrint: () => void;
  onRetake: () => void;
}

const Step6Final = ({ 
  leftPolaroidUrl,
  rightPolaroidUrl,
  leftImageId,
  rightImageId,
  onPrint,
  onRetake 
}: Step6FinalProps) => {
  const { toast } = useToast();
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    generateSheetPreview();
    
    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateSheetPreview = async () => {
    setIsGenerating(true);
    
    try {
      // For now, create a simple composite preview URL
      // In production, you might want to create an actual composite image
      // using Cloudinary's overlay features or generate it server-side
      
      // Since we have the processed Polaroid URLs, we'll use them directly
      setSheetPreviewUrl(leftPolaroidUrl); // Placeholder - show first polaroid
      
      console.log("Sheet preview generated");
      console.log("Left Polaroid:", leftPolaroidUrl);
      console.log("Right Polaroid:", rightPolaroidUrl);
      
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview generation failed",
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
      // Send both Polaroid URLs to Raspberry Pi for printing
      const response = await apiService.printSheet(leftPolaroidUrl, 1);

      if (response.success && response.data) {
        toast({
          title: "✅ Print job sent",
          description: `Printing to ${response.data.printer_name}`,
        });
        onPrint();
        
        // Monitor print status
        monitorPrintStatus(response.data.job_id);
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

  const monitorPrintStatus = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await apiService.getPrintStatus(jobId);
        
        if (response.success && response.data) {
          const status = response.data.status;
          
          if (status === "completed") {
            toast({
              title: "✅ Print completed",
              description: "Your Polaroids are ready!",
            });
          } else if (status === "failed") {
            toast({
              title: "❌ Print failed",
              description: "Please notify staff",
              variant: "destructive",
            });
          } else if (status === "printing") {
            // Check again in 2 seconds
            setTimeout(checkStatus, 2000);
          }
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    };

    checkStatus();
  };

  const handleDeleteNow = async () => {
    setIsDeleting(true);

    try {
      // Delete both images from Cloudinary
      const deletePromises = [
        cloudinaryService.deleteImage(leftImageId),
        rightImageId !== leftImageId ? cloudinaryService.deleteImage(rightImageId) : Promise.resolve({ success: true })
      ];

      const results = await Promise.all(deletePromises);
      
      const allSuccess = results.every(r => r.success);
      
      if (allSuccess) {
        toast({
          title: "✅ Photos deleted",
          description: "Your photos have been permanently removed",
        });
        setShowDeleteDialog(false);
        
        // Wait a moment then restart
        setTimeout(() => {
          onRetake();
        }, 2000);
      } else {
        throw new Error("Some photos failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Deletion failed",
        description: "Photos will auto-delete in " + formatTime(timeRemaining),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    if (timeRemaining > 2700) return "text-green-600"; // > 45 min
    if (timeRemaining > 1800) return "text-yellow-600"; // > 30 min
    return "text-orange-600"; // < 30 min
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header with Timer */}
      <div className="p-4 bg-card border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
          Your Polaroid Sheet
        </h2>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Auto-delete in
          </p>
          <p className={`text-2xl font-bold ${getTimeColor()}`}>
            ⏰ {formatTime(timeRemaining)}
          </p>
        </div>
      </div>

      {/* Sheet Preview */}
      <div className="flex-1 relative overflow-hidden bg-white p-4">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Preparing print sheet...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Sheet Layout Preview - 4x6 landscape */}
            <div 
              className="relative bg-white shadow-2xl"
              style={{ 
                width: '100%',
                maxWidth: '600px',
                aspectRatio: '3/2', // 4:6 = 2:3, landscape = 3:2
              }}
            >
              {/* Grid layout for 2 Polaroids side by side */}
              <div className="grid grid-cols-2 gap-4 p-8 h-full">
                {/* Left Polaroid */}
                <div className="relative">
                  <div className="w-full h-full bg-white p-2 shadow-lg rounded">
                    <div className="aspect-[2/3] overflow-hidden rounded">
                      <img
                        src={leftPolaroidUrl}
                        alt="Left Polaroid"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Cut line */}
                  <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded pointer-events-none" />
                </div>

                {/* Right Polaroid */}
                <div className="relative">
                  <div className="w-full h-full bg-white p-2 shadow-lg rounded">
                    <div className="aspect-[2/3] overflow-hidden rounded">
                      <img
                        src={rightPolaroidUrl}
                        alt="Right Polaroid"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Cut line */}
                  <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded pointer-events-none" />
                </div>
              </div>

              {/* Branding */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <p className="text-gray-400 text-sm font-serif italic">
                  Innovative Archive
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Overlay */}
        {!isGenerating && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            ✂️ Cut along dashed lines
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3 bg-card border-t border-border">
        <Button 
          onClick={handlePrint}
          disabled={isGenerating || isPrinting}
          className="w-full gap-2"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          {isPrinting ? "Printing..." : "Print My Polaroids"}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="gap-2"
            size="lg"
          >
            <Trash2 className="w-5 h-5" />
            Delete Now
          </Button>

          <Button 
            onClick={onRetake}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Upload className="w-5 h-5" />
            Start Over
          </Button>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          🔒 Your photos will be automatically deleted in {formatTime(timeRemaining)}
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photos Now?</DialogTitle>
            <DialogDescription>
              Your photos will be permanently deleted from our servers immediately. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100">
              <Trash2 className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Make sure you've printed your Polaroids if you want to keep them!
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNow}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step6Final;
