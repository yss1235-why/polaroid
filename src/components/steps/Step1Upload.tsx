import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/services/cloudinary";
import { Button } from "@/components/ui/button";
import { validateImageDimensions, formatFileSize } from "@/utils/polaroidHelpers";

interface Step1UploadProps {
  onUploadComplete: (imageUrl: string, imageId: string, secondImageUrl?: string, secondImageId?: string) => void;
}

const Step1Upload = ({ onUploadComplete }: Step1UploadProps) => {
  const { toast } = useToast();
  const [uploadMode, setUploadMode] = useState<"single" | "dual">("single");
  const [isProcessing, setIsProcessing] = useState(false);
  const [leftPhoto, setLeftPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [rightPhoto, setRightPhoto] = useState<{ file: File; preview: string } | null>(null);

  const validateAndPreview = (file: File): { valid: boolean; preview: string } => {
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is 10MB. Your file is ${formatFileSize(file.size)}.`,
        variant: "destructive",
      });
      return { valid: false, preview: "" };
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or HEIC).",
        variant: "destructive",
      });
      return { valid: false, preview: "" };
    }

    const preview = URL.createObjectURL(file);
    
    // Validate dimensions (will show warning if too small)
    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const validation = validateImageDimensions(img.width, img.height);
      if (!validation.valid) {
        toast({
          title: "Image resolution too low",
          description: validation.message,
          variant: "destructive",
        });
      } else if (validation.message) {
        toast({
          title: "Resolution warning",
          description: validation.message,
        });
      }
    };

    return { valid: true, preview };
  };

  const handleLeftPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { valid, preview } = validateAndPreview(file);
      if (valid) {
        setLeftPhoto({ file, preview });
      }
    }
  };

  const handleRightPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { valid, preview } = validateAndPreview(file);
      if (valid) {
        setRightPhoto({ file, preview });
      }
    }
  };

  const handleSingleUpload = async (file: File) => {
    setIsProcessing(true);

    try {
      const response = await cloudinaryService.uploadImage(file);
      
      if (response.success && response.data) {
        const imageUrl = URL.createObjectURL(file);
        // Single photo - will be duplicated for both Polaroids
        onUploadComplete(imageUrl, response.data.public_id);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDualUpload = async () => {
    if (!leftPhoto || !rightPhoto) {
      toast({
        title: "Upload both photos",
        description: "Please select photos for both left and right Polaroids",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Upload left photo
      const leftResponse = await cloudinaryService.uploadImage(leftPhoto.file);
      if (!leftResponse.success || !leftResponse.data) {
        throw new Error("Left photo upload failed");
      }

      // Upload right photo
      const rightResponse = await cloudinaryService.uploadImage(rightPhoto.file);
      if (!rightResponse.success || !rightResponse.data) {
        throw new Error("Right photo upload failed");
      }

      onUploadComplete(
        leftPhoto.preview,
        leftResponse.data.public_id,
        rightPhoto.preview,
        rightResponse.data.public_id
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (uploadMode === "single" && leftPhoto) {
      handleSingleUpload(leftPhoto.file);
    } else if (uploadMode === "dual") {
      handleDualUpload();
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col justify-center px-4 py-8">
      {/* Upload Mode Selection */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          How many photos do you want?
        </h2>
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => {
              setUploadMode("single");
              setRightPhoto(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              uploadMode === "single"
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-6xl mb-3">📷</div>
            <h3 className="text-xl font-bold mb-2">One Photo</h3>
            <p className="text-sm text-muted-foreground">
              Same photo printed twice
            </p>
          </button>

          <button
            onClick={() => setUploadMode("dual")}
            className={`p-6 rounded-xl border-2 transition-all ${
              uploadMode === "dual"
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-6xl mb-3">📷📷</div>
            <h3 className="text-xl font-bold mb-2">Two Photos</h3>
            <p className="text-sm text-muted-foreground">
              Different photo in each Polaroid
            </p>
          </button>
        </div>
      </div>

      {/* Upload Areas */}
      {uploadMode === "single" ? (
        // Single Photo Upload
        <div className="max-w-2xl mx-auto w-full mb-6">
          {leftPhoto ? (
            <div className="relative">
              <img
                src={leftPhoto.preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border-2 border-primary"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setLeftPhoto(null)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <label className="block w-full h-64 border-4 border-dashed border-primary/30 hover:border-primary rounded-lg cursor-pointer transition-all bg-card hover:bg-primary/5">
              <input
                type="file"
                accept="image/*"
                onChange={handleLeftPhotoSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="w-16 h-16 text-primary mb-4" />
                <p className="text-lg font-semibold mb-2">Click to upload photo</p>
                <p className="text-sm text-muted-foreground">JPG, PNG or HEIC (Max 10MB)</p>
              </div>
            </label>
          )}
        </div>
      ) : (
        // Dual Photo Upload
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full mb-6">
          {/* Left Polaroid */}
          <div>
            <p className="text-sm font-medium text-center mb-2">Left Polaroid</p>
            {leftPhoto ? (
              <div className="relative">
                <img
                  src={leftPhoto.preview}
                  alt="Left preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setLeftPhoto(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="block w-full h-64 border-4 border-dashed border-primary/30 hover:border-primary rounded-lg cursor-pointer transition-all bg-card hover:bg-primary/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLeftPhotoSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-12 h-12 text-primary mb-3" />
                  <p className="text-sm font-semibold">Upload left photo</p>
                </div>
              </label>
            )}
          </div>

          {/* Right Polaroid */}
          <div>
            <p className="text-sm font-medium text-center mb-2">Right Polaroid</p>
            {rightPhoto ? (
              <div className="relative">
                <img
                  src={rightPhoto.preview}
                  alt="Right preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setRightPhoto(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="block w-full h-64 border-4 border-dashed border-primary/30 hover:border-primary rounded-lg cursor-pointer transition-all bg-card hover:bg-primary/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRightPhotoSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-12 h-12 text-primary mb-3" />
                  <p className="text-sm font-semibold">Upload right photo</p>
                </div>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center mb-6 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">
          🔒 Your photos are automatically deleted after 1 hour for your privacy
        </p>
      </div>

      {/* Continue Button */}
      <div className="max-w-2xl mx-auto w-full">
        <Button
          onClick={handleContinue}
          disabled={
            isProcessing ||
            !leftPhoto ||
            (uploadMode === "dual" && !rightPhoto)
          }
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Uploading..." : "Continue to Crop"}
        </Button>
      </div>
    </div>
  );
};

export default Step1Upload;
