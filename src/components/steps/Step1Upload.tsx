import { useState } from "react";
import { UploadArea } from "@/components/UploadArea";
import { useToast } from "@/hooks/use-toast";

interface Step1UploadProps {
  onUploadComplete: (imageUrl: string) => void;
}

const Step1Upload = ({ onUploadComplete }: Step1UploadProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);

    try {
      // Convert file to base64 URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Simulate upload delay
        setTimeout(() => {
          setIsProcessing(false);
          onUploadComplete(imageUrl);
          
          toast({
            title: "✅ Photo uploaded",
            description: "Ready to process your photo",
          });
        }, 1000);
      };
      reader.readAsDataURL(file);

      // In production, call API here:
      // const response = await apiService.uploadPhoto(file);
      // if (response.success) {
      //   onUploadComplete(response.data.imageUrl);
      // }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Upload Your Photo
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Take or upload a clear photo of your face
        </p>
      </div>

      <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />

      {/* Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📸</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1">
            Clear Photo
          </h3>
          <p className="text-xs text-muted-foreground">
            Face clearly visible
          </p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">💡</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1">
            Good Lighting
          </h3>
          <p className="text-xs text-muted-foreground">
            Well-lit environment
          </p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">👤</span>
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1">
            Neutral Expression
          </h3>
          <p className="text-xs text-muted-foreground">
            Look straight ahead
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step1Upload;
