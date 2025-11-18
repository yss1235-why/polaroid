import { CropData } from "@/types";

/**
 * Validate crop data
 */
export function validateCropData(cropData: CropData): boolean {
  if (!cropData.naturalWidth || !cropData.naturalHeight) {
    return false;
  }
  
  if (cropData.x < 0 || cropData.x > 1) return false;
  if (cropData.y < 0 || cropData.y > 1) return false;
  if (cropData.width <= 0 || cropData.width > 1) return false;
  if (cropData.height <= 0 || cropData.height > 1) return false;
  
  return true;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Validate image dimensions for Polaroid printing
 */
export function validateImageDimensions(width: number, height: number): {
  valid: boolean;
  message?: string;
} {
  const minWidth = 800;
  const minHeight = 1200;
  const recommendedWidth = 1200;
  const recommendedHeight = 1600;
  
  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      message: `Image too small. Minimum ${minWidth}x${minHeight}px required.`,
    };
  }
  
  if (width < recommendedWidth || height < recommendedHeight) {
    return {
      valid: true,
      message: `⚠️ Low resolution. Recommended ${recommendedWidth}x${recommendedHeight}px for best quality.`,
    };
  }
  
  return { valid: true };
}

/**
 * Check text color contrast against white background
 */
export function hasGoodContrast(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Good contrast if luminance is below 0.7 (darker colors work well on white)
  return luminance < 0.7;
}
