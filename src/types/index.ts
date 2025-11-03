export type ProcessingMode = "passport" | "studio";

export interface PhotoData {
  original: string | null;
  processed: string | null;
  cropped: string | null;
  final: string | null;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
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
  imageUrl: string;
  imageId: string;
  faceDetected: boolean;
}

export interface ProcessResponse {
  processedImageUrl: string;
  faceConfidence: number;
  backgroundRemoved: boolean;
}

export interface SheetPreviewResponse {
  previewUrl: string;
  sheetSize: string;
  dpi: number;
}
