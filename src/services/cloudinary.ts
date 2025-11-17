import { 
  CloudinaryUploadResponse, 
  ApiResponse, 
  CropData, 
  RotationData, 
  TextOverlay,
  FilterType 
} from "@/types";

const CLOUDINARY_CLOUD_NAME_1 = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_1;
const CLOUDINARY_UPLOAD_PRESET_1 = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_1;
const CLOUDINARY_API_KEY_1 = import.meta.env.VITE_CLOUDINARY_API_KEY_1;
const CLOUDINARY_API_SECRET_1 = import.meta.env.VITE_CLOUDINARY_API_SECRET_1;

const CLOUDINARY_CLOUD_NAME_2 = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_2;
const CLOUDINARY_UPLOAD_PRESET_2 = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_2;
const CLOUDINARY_API_KEY_2 = import.meta.env.VITE_CLOUDINARY_API_KEY_2;
const CLOUDINARY_API_SECRET_2 = import.meta.env.VITE_CLOUDINARY_API_SECRET_2;

// Polaroid dimensions in pixels at 300 DPI
const POLAROID_DIMS = {
  PHOTO_WIDTH: 780,
  PHOTO_HEIGHT: 1170,
  SIDE_BORDER: 23,
  TOP_BORDER: 15,
  BOTTOM_BORDER: 117,
  TOTAL_WIDTH: 825, // 780 + 23 + 23
  TOTAL_HEIGHT: 1287, // 1170 + 15 + 117
};

class CloudinaryService {
  private currentAccount: 1 | 2 = 1;
  private account1Failed = false;

  private getCurrentCredentials() {
    if (this.currentAccount === 1 && !this.account1Failed) {
      return {
        cloudName: CLOUDINARY_CLOUD_NAME_1,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET_1,
        apiKey: CLOUDINARY_API_KEY_1,
        apiSecret: CLOUDINARY_API_SECRET_1,
      };
    }
    return {
      cloudName: CLOUDINARY_CLOUD_NAME_2,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET_2,
      apiKey: CLOUDINARY_API_KEY_2,
      apiSecret: CLOUDINARY_API_SECRET_2,
    };
  }

  /**
   * Upload image to Cloudinary with automatic account rotation
   */
  async uploadImage(file: File): Promise<ApiResponse<CloudinaryUploadResponse>> {
    const credentials = this.getCurrentCredentials();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', credentials.uploadPreset);
      formData.append('folder', 'polaroid_photos');
      
      // Set 1-hour expiration
      const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60);
      formData.append('expires_at', expirationTime.toString());

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for quota exceeded
        if (response.status === 429 || errorData.error?.message?.includes('quota')) {
          console.log('Account quota exceeded, switching accounts...');
          return this.handleAccountRotation(file);
        }
        
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          public_id: data.public_id,
          secure_url: data.secure_url,
          width: data.width,
          height: data.height,
          format: data.format,
        },
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Try other account if current fails
      if (!this.account1Failed && this.currentAccount === 1) {
        return this.handleAccountRotation(file);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Handle automatic account rotation on quota exceeded
   */
  private async handleAccountRotation(file: File): Promise<ApiResponse<CloudinaryUploadResponse>> {
    if (this.currentAccount === 1) {
      console.log('Switching from Account 1 to Account 2...');
      this.currentAccount = 2;
      this.account1Failed = true;
      return this.uploadImage(file);
    } else {
      return {
        success: false,
        error: 'Both Cloudinary accounts have reached quota. Service will resume next month.',
      };
    }
  }

  /**
   * Generate cropped-only URL for "before" preview
   * This creates JUST the cropped and rotated image with NO filters, borders, or enhancements
   */
  generateCroppedOnlyUrl(
    publicId: string,
    cropData: CropData,
    rotation: RotationData
  ): string {
    const credentials = this.getCurrentCredentials();
    const transformations: string[] = [];

    // Step 1: Crop the original image
    const cropX = Math.round(cropData.x * cropData.naturalWidth);
    const cropY = Math.round(cropData.y * cropData.naturalHeight);
    const cropW = Math.round(cropData.width * cropData.naturalWidth);
    const cropH = Math.round(cropData.height * cropData.naturalHeight);
    transformations.push(`c_crop,x_${cropX},y_${cropY},w_${cropW},h_${cropH}`);

    // Step 2: Rotation if provided
    if (rotation && rotation.angle !== 0) {
      transformations.push(`a_${rotation.angle}`);
    }

    // Step 3: Resize to Polaroid photo dimensions (2:3 aspect ratio)
    transformations.push(`c_fill,w_${POLAROID_DIMS.PHOTO_WIDTH},h_${POLAROID_DIMS.PHOTO_HEIGHT},g_auto`);

    // Step 4: Basic quality settings
    transformations.push('q_90');
    transformations.push('f_auto');

    const transformString = transformations.join('/');
    return `https://res.cloudinary.com/${credentials.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * NEW: Generate enhanced photo URL (with filters but NO Polaroid frame)
   * This is for the "after" side of the before/after comparison
   */
  generateEnhancedPhotoUrl(
    publicId: string,
    cropData: CropData,
    rotation: RotationData,
    filter: FilterType
  ): string {
    const credentials = this.getCurrentCredentials();
    const transformations: string[] = [];

    // Step 1: Crop the original image
    const cropX = Math.round(cropData.x * cropData.naturalWidth);
    const cropY = Math.round(cropData.y * cropData.naturalHeight);
    const cropW = Math.round(cropData.width * cropData.naturalWidth);
    const cropH = Math.round(cropData.height * cropData.naturalHeight);
    transformations.push(`c_crop,x_${cropX},y_${cropY},w_${cropW},h_${cropH}`);

    // Step 2: Rotation if provided
    if (rotation && rotation.angle !== 0) {
      transformations.push(`a_${rotation.angle}`);
    }

    // Step 3: Resize to Polaroid photo dimensions (2:3 aspect ratio)
    transformations.push(`c_fill,w_${POLAROID_DIMS.PHOTO_WIDTH},h_${POLAROID_DIMS.PHOTO_HEIGHT},g_auto`);

    // Step 4: Auto enhancement
    transformations.push('e_improve');
    transformations.push('e_auto_color');
    transformations.push('e_auto_brightness');
    transformations.push('e_auto_contrast');
    transformations.push('e_sharpen:80');

    // Step 5: Apply filter if selected
    if (filter && filter.cloudinaryEffect) {
      transformations.push(filter.cloudinaryEffect);
    }

    // Step 6: Final optimization
    transformations.push('q_95'); // High quality
    transformations.push('f_auto'); // Auto format
    transformations.push('dpr_2.0'); // 2x DPI for crisp display

    const transformString = transformations.join('/');
    return `https://res.cloudinary.com/${credentials.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Generate processed Polaroid image URL with proper structure
   * Creates authentic Polaroid with white borders and text in bottom area
   */
  generateProcessedUrl(
    publicId: string,
    cropData?: CropData,
    rotation?: RotationData,
    filter?: FilterType,
    textOverlay?: TextOverlay
  ): string {
    const credentials = this.getCurrentCredentials();
    const transformations: string[] = [];

    // Step 1: Crop the original image if provided
    if (cropData) {
      const cropX = Math.round(cropData.x * cropData.naturalWidth);
      const cropY = Math.round(cropData.y * cropData.naturalHeight);
      const cropW = Math.round(cropData.width * cropData.naturalWidth);
      const cropH = Math.round(cropData.height * cropData.naturalHeight);
      transformations.push(`c_crop,x_${cropX},y_${cropY},w_${cropW},h_${cropH}`);
    }

    // Step 2: Rotation if provided
    if (rotation && rotation.angle !== 0) {
      transformations.push(`a_${rotation.angle}`);
    }

    // Step 3: Resize to Polaroid photo dimensions (2:3 aspect ratio)
    transformations.push(`c_fill,w_${POLAROID_DIMS.PHOTO_WIDTH},h_${POLAROID_DIMS.PHOTO_HEIGHT},g_auto`);

    // Step 4: Auto enhancement
    transformations.push('e_improve');
    transformations.push('e_auto_color');
    transformations.push('e_auto_brightness');
    transformations.push('e_auto_contrast');
    transformations.push('e_sharpen:80');

    // Step 5: Apply filter if selected
    if (filter && filter.cloudinaryEffect) {
      transformations.push(filter.cloudinaryEffect);
    }
// Step 6a: First add left and right borders (23px each side)
    transformations.push(
      `b_rgb:ffffff,` +
      `c_pad,` +
      `w_${POLAROID_DIMS.PHOTO_WIDTH + (POLAROID_DIMS.SIDE_BORDER * 2)},` +
      `h_${POLAROID_DIMS.PHOTO_HEIGHT}`
    );

    // Step 6b: Then add top (15px) and bottom (117px) borders
    transformations.push(
      `b_rgb:ffffff,` +
      `c_lpad,` +
      `w_${POLAROID_DIMS.TOTAL_WIDTH},` +
      `h_${POLAROID_DIMS.TOTAL_HEIGHT},` +
      `g_north,` +
      `y_${POLAROID_DIMS.TOP_BORDER}`
    );

    // Step 7: Add thin black border around entire Polaroid
    transformations.push('bo_2px_solid_rgb:2a2a2a');

    // Step 8: Add subtle shadow for depth
    transformations.push('e_shadow:40');
    // Step 9: Add text overlay in the bottom white space if provided
    if (textOverlay && textOverlay.content) {
      const encodedText = encodeURIComponent(textOverlay.content);
      const fontFamily = textOverlay.font.replace(/\s+/g, '%20');
      const fontSize = Math.min(textOverlay.size, 36); // Cap size for Polaroid
      const color = textOverlay.color.replace('#', 'rgb:');
      
      // Calculate Y position to place text in bottom white area
      // Bottom border is 117px, center the text vertically in that space
      const yOffset = Math.round(POLAROID_DIMS.BOTTOM_BORDER / 2 - fontSize / 2);
      
      transformations.push(
        `l_text:${fontFamily}_${fontSize}_center:${encodedText},` +
        `co_${color},` +
        `g_south,` +
        `y_${yOffset}`
      );
    }

    // Step 10: Final optimization
    transformations.push('q_95'); // High quality
    transformations.push('f_auto'); // Auto format
    transformations.push('dpr_2.0'); // 2x DPI for crisp printing

    const transformString = transformations.join('/');
    return `https://res.cloudinary.com/${credentials.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Generate preview URL for filter selection (smaller, faster)
   */
  generateFilterPreviewUrl(publicId: string, filter: FilterType): string {
    const credentials = this.getCurrentCredentials();
    const transformations = [
      'c_fill,w_300,h_450', // Smaller for preview
      'e_improve',
      filter.cloudinaryEffect || '',
      'q_auto',
      'f_auto',
    ].filter(Boolean);

    return `https://res.cloudinary.com/${credentials.cloudName}/image/upload/${transformations.join('/')}/${publicId}`;
  }

  /**
   * Generate sheet layout with 2 Polaroids side-by-side
   * This creates the final 4x6 inch print sheet at 300 DPI
   */
  async generateSheetLayout(
    leftPolaroidUrl: string,
    rightPolaroidUrl: string
  ): Promise<string> {
    // For the actual print sheet, we'll compose 2 Polaroids side by side
    // Sheet dimensions: 1200x1800 px (4x6 inches at 300 DPI)
    // Each Polaroid: 826x1302 px
    
    // Calculate positioning
    const sheetWidth = 1200;
    const sheetHeight = 1800;
    const polaroidWidth = POLAROID_DIMS.TOTAL_WIDTH;
    const gap = Math.floor((sheetWidth - (polaroidWidth * 2)) / 3); // Equal gaps
    
    // This would typically be handled server-side or using Cloudinary's 
    // layer composition features. For now, return a placeholder.
    // In production, you'd use Cloudinary's overlay API to compose the sheet.
    
    return `sheet_composite_${Date.now()}`;
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<ApiResponse<void>> {
    const credentials = this.getCurrentCredentials();
    
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await this.generateSignature(publicId, timestamp, credentials.apiSecret);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', credentials.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed',
      };
    }
  }

  /**
   * Generate signature for authenticated requests
   */
  private async generateSignature(
    publicId: string,
    timestamp: number,
    apiSecret: string
  ): Promise<string> {
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    
    // Use Web Crypto API to generate SHA1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Get current account info
   */
  getAccountInfo() {
    return {
      currentAccount: this.currentAccount,
      account1Failed: this.account1Failed,
    };
  }

  /**
   * Reset account rotation (for testing or monthly reset)
   */
  resetAccounts() {
    this.currentAccount = 1;
    this.account1Failed = false;
  }
}

export const cloudinaryService = new CloudinaryService();
