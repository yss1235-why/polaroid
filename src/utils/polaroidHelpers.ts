import { CropData, RotationData, TextOverlay } from "@/types";

/**
 * Polaroid dimensions at 300 DPI
 */
export const POLAROID_DIMENSIONS = {
  // Photo area
  PHOTO_WIDTH_PX: 780,
  PHOTO_HEIGHT_PX: 1170,
  PHOTO_WIDTH_INCHES: 2.6,
  PHOTO_HEIGHT_INCHES: 3.9,
  
  // With border
  TOTAL_WIDTH_PX: 826,
  TOTAL_HEIGHT_PX: 1287,
  
  // Border widths
  SIDE_BORDER_PX: 23,
  TOP_BORDER_PX: 15,
  BOTTOM_BORDER_PX: 102,
  
  // Sheet dimensions
  SHEET_WIDTH_PX: 1200,
  SHEET_HEIGHT_PX: 1800,
  SHEET_WIDTH_INCHES: 4,
  SHEET_HEIGHT_INCHES: 6,
  
  // DPI
  DPI: 300,
};

/**
 * Calculate Polaroid positions on 4x6 sheet
 */
export function calculatePolaroidPositions() {
  const { SHEET_WIDTH_PX, SHEET_HEIGHT_PX, TOTAL_WIDTH_PX, TOTAL_HEIGHT_PX } = POLAROID_DIMENSIONS;
  
  // Calculate margins and gap
  const totalPolaroidWidth = TOTAL_WIDTH_PX * 2;
  const availableWidth = SHEET_WIDTH_PX - totalPolaroidWidth;
  const margin = availableWidth / 3; // Equal margins: left, center, right
  
  const verticalMargin = (SHEET_HEIGHT_PX - TOTAL_HEIGHT_PX) / 2;
  
  return {
    leftPolaroid: {
      x: margin,
      y: verticalMargin,
    },
    rightPolaroid: {
      x: margin * 2 + TOTAL_WIDTH_PX,
      y: verticalMargin,
    },
    centerGap: margin,
  };
}

/**
 * Generate cut line coordinates for dashed borders
 */
export function generateCutLines() {
  const positions = calculatePolaroidPositions();
  const { TOTAL_WIDTH_PX, TOTAL_HEIGHT_PX } = POLAROID_DIMENSIONS;
  
  return {
    leftPolaroid: {
      topLeft: { x: positions.leftPolaroid.x - 2, y: positions.leftPolaroid.y - 2 },
      bottomRight: {
        x: positions.leftPolaroid.x + TOTAL_WIDTH_PX + 2,
        y: positions.leftPolaroid.y + TOTAL_HEIGHT_PX + 2,
      },
    },
    rightPolaroid: {
      topLeft: { x: positions.rightPolaroid.x - 2, y: positions.rightPolaroid.y - 2 },
      bottomRight: {
        x: positions.rightPolaroid.x + TOTAL_WIDTH_PX + 2,
        y: positions.rightPolaroid.y + TOTAL_HEIGHT_PX + 2,
      },
    },
  };
}

/**
 * Calculate text position within bottom border
 */
export function calculateTextPosition(textSize: number): { x: number; y: number } {
  const { BOTTOM_BORDER_PX } = POLAROID_DIMENSIONS;
  
  return {
    x: 0, // Centered horizontally by Cloudinary
    y: Math.round(BOTTOM_BORDER_PX / 2 - textSize / 2),
  };
}

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
 * Convert inches to pixels at 300 DPI
 */
export function inchesToPixels(inches: number): number {
  return Math.round(inches * POLAROID_DIMENSIONS.DPI);
}

/**
 * Convert pixels to inches at 300 DPI
 */
export function pixelsToInches(pixels: number): number {
  return pixels / POLAROID_DIMENSIONS.DPI;
}

/**
 * Apply rotation to coordinates
 */
export function rotateCoordinates(
  x: number,
  y: number,
  width: number,
  height: number,
  angle: 0 | 90 | 180 | 270
): { x: number; y: number; width: number; height: number } {
  switch (angle) {
    case 90:
      return { x: y, y: width - x, width: height, height: width };
    case 180:
      return { x: width - x, y: height - y, width, height };
    case 270:
      return { x: height - y, y: x, width: height, height: width };
    default:
      return { x, y, width, height };
  }
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
