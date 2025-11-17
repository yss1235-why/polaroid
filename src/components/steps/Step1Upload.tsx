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

  const handleRightPhotoSelect =
