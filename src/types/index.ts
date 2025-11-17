export type ProcessingMode = "polaroid";

export interface PhotoData {
  original: string | null;
  processed: string | null;
  cropped: string | null;
  final: string | null;
  imageId?: string;
  secondImageId?: string;
  secondOriginal?: string | null;
  secondProcessed?: string | null;
  // Cropped-only URLs (no enhancements) for before comparison
  croppedOnly?: string | null;
  secondCroppedOnly?: string | null;
  // NEW: Enhanced photos (with filters but no Polaroid frame) for after comparison
  enhancedOnly?: string | null;
  secondEnhancedOnly?: string | null;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

export interface RotationData {
  angle: 0 | 90 | 180 | 270;
}

export interface TextOverlay {
  content: string;
  font: string;
  color: string;
  size: number;
  position?: 'bottom' | 'top' | 'center';
}

export interface FilterType {
  name: string;
  displayName: string;
  cloudinaryEffect: string;
}

export interface PolaroidLayout {
  type: 'dual';
  photo1: string;
  photo2: string;
  samePhoto: boolean;
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

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export interface PrintRequest {
  sheet_url: string;
  copies?: number;
}

export interface PrintResponse {
  job_id: string;
  printer_name: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  estimated_time_seconds?: number;
}

export interface PrinterStatus {
  name: string;
  status: 'idle' | 'printing' | 'error' | 'offline';
  paper_level?: 'ok' | 'low' | 'out';
  ink_level?: 'ok' | 'low' | 'out';
}

// Filter presets
export const CLOUDINARY_FILTERS: FilterType[] = [
  { name: 'none', displayName: 'No Filter', cloudinaryEffect: '' },
  { name: 'al_dente', displayName: 'Al Dente', cloudinaryEffect: 'e_art:al_dente' },
  { name: 'athena', displayName: 'Athena', cloudinaryEffect: 'e_art:athena' },
  { name: 'audrey', displayName: 'Audrey', cloudinaryEffect: 'e_art:audrey' },
  { name: 'aurora', displayName: 'Aurora', cloudinaryEffect: 'e_art:aurora' },
  { name: 'daguerre', displayName: 'Daguerre', cloudinaryEffect: 'e_art:daguerre' },
  { name: 'eucalyptus', displayName: 'Eucalyptus', cloudinaryEffect: 'e_art:eucalyptus' },
  { name: 'fes', displayName: 'Fes', cloudinaryEffect: 'e_art:fes' },
  { name: 'frost', displayName: 'Frost', cloudinaryEffect: 'e_art:frost' },
  { name: 'hairspray', displayName: 'Hairspray', cloudinaryEffect: 'e_art:hairspray' },
  { name: 'hokusai', displayName: 'Hokusai', cloudinaryEffect: 'e_art:hokusai' },
  { name: 'incognito', displayName: 'Incognito', cloudinaryEffect: 'e_art:incognito' },
  { name: 'linen', displayName: 'Linen', cloudinaryEffect: 'e_art:linen' },
  { name: 'peacock', displayName: 'Peacock', cloudinaryEffect: 'e_art:peacock' },
  { name: 'primavera', displayName: 'Primavera', cloudinaryEffect: 'e_art:primavera' },
  { name: 'quartz', displayName: 'Quartz', cloudinaryEffect: 'e_art:quartz' },
  { name: 'red_rock', displayName: 'Red Rock', cloudinaryEffect: 'e_art:red_rock' },
  { name: 'refresh', displayName: 'Refresh', cloudinaryEffect: 'e_art:refresh' },
  { name: 'sizzle', displayName: 'Sizzle', cloudinaryEffect: 'e_art:sizzle' },
  { name: 'sonnet', displayName: 'Sonnet', cloudinaryEffect: 'e_art:sonnet' },
  { name: 'ukulele', displayName: 'Ukulele', cloudinaryEffect: 'e_art:ukulele' },
  { name: 'zorro', displayName: 'Zorro', cloudinaryEffect: 'e_art:zorro' },
];

// Font options for text overlay - Updated with correct Google Font names
export const TEXT_FONTS = [
  { value: 'Arial', label: 'Simple Clean' },
  { value: 'Cookie', label: 'Handwritten' },
  { value: 'Pacifico', label: 'Elegant Script' },
  { value: 'Courier', label: 'Vintage Typewriter' },
  { value: 'Impact', label: 'Bold Brush' },
  { value: 'Helvetica', label: 'Thin Modern' },
  { value: 'Comic Sans MS', label: 'Bubble Rounded' },
  { value: 'Press Start 2P', label: 'Retro 80s' },
  { value: 'Great Vibes', label: 'Fancy Calligraphy' },
  { value: 'Bangers', label: 'Comic Casual' },
];

// Color presets for text
export const TEXT_COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FF1493', label: 'Pink' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#C0C0C0', label: 'Silver' },
];
