// src/types/index.ts

export type ProcessingMode = "passport" | "studio";

export interface PhotoData {
  original: string | null;
  processed: string | null;
  cropped: string | null;
  final: string | null;
  imageId?: string;
}

// ✅ UPDATED: Hybrid crop data with normalized + natural dimensions
export interface CropData {
  // Normalized coordinates (0-1) - works on any display size
  x: number;           // 0-1: percentage from left
  y: number;           // 0-1: percentage from top
  width: number;       // 0-1: percentage of image width
  height: number;      // 0-1: percentage of image height
  
  // Display dimensions (for reference/debugging)
  displayWidth: number;   // pixels: width of displayed image
  displayHeight: number;  // pixels: height of displayed image
  
  // Natural/Original image dimensions (critical for backend)
  naturalWidth: number;   // pixels: actual uploaded image width
  naturalHeight: number;  // pixels: actual uploaded image height
  
  // Transform
  zoom: number;        // zoom level applied (1.0 = 100%)
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  image_id: string;
  face_detected: boolean;
  dimensions: number[];
  status: string;
}

export interface ProcessResponse {
  processed_image: string;
  face_confidence: number;
  bg_removed: boolean;
  status: string;
}

export interface SheetPreviewResponse {
  preview_sheet: string;
  sheet_size: string;
  dpi: number;
}
