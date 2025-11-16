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
   * Generate processed Polaroid image URL with all transformations
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

    // 1. Crop if provided
    if (cropData) {
      const cropX = Math.round(cropData.x * cropData.naturalWidth);
      const cropY = Math.round(cropData.y * cropData.naturalHeight);
      const cropW = Math.round(cropData.width * cropData.naturalWidth);
      const cropH = Math.round(cropData.height * cropData.naturalHeight);
      transformations.push(`c_crop,x_${cropX},y_${cropY},w_${cropW},h_${cropH}`);
    }

    // 2. Resize to Polaroid dimensions (780x1170 for photo area)
    transformations.push('c_fill,w_780,h_1170');

    // 3. Rotation if provided
    if (rotation && rotation.angle !== 0) {
      transformations.push(`a_${rotation.angle}`);
    }

    // 4. Auto enhancement
    transformations.push('e_improve');
    transformations.push('e_auto_color');
    transformations.push('e_auto_brightness');
    transformations.push('e_auto_contrast');
    transformations.push('e_sharpen:80');

    // 5. Filter if selected
    if (filter && filter.cloudinaryEffect) {
      transformations.push(filter.cloudinaryEffect);
    }

    // 6. Add Polaroid white border
    transformations.push('b_white,bo_23px_solid_white'); // Side borders
    transformations.push('e_shadow:50'); // 3D effect

    // 7. Text overlay if provided
    if (textOverlay && textOverlay.content) {
      const encodedText = encodeURIComponent(textOverlay.content);
      const fontFamily = textOverlay.font.replace(/\s+/g, '');
      const fontSize = textOverlay.size;
      const color = textOverlay.color.replace('#', 'rgb:');
      
      // Position text at bottom of Polaroid (in the white border area)
      transformations.push(
        `l_text:${fontFamily}_${fontSize}:${encodedText},co_${color},g_south,y_40`
      );
    }

    // 8. Final optimization
    transformations.push('q_95'); // 95% quality
    transformations.push('f_auto'); // Auto format

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
    ].filter(Boolean);

    return `https://res.cloudinary.com/${credentials.cloudName}/image/upload/${transformations.join('/')}/${publicId}`;
  }

  /**
   * Generate sheet layout with 2 Polaroids side-by-side
   */
  async generateSheetLayout(
    leftPolaroidUrl: string,
    rightPolaroidUrl: string
  ): Promise<string> {
    const credentials = this.getCurrentCredentials();
    
    // Create a composite image using Cloudinary's overlay features
    // Base canvas: 1200x1800 white background (4x6 inches at 300 DPI)
    const baseTransform = 'w_1200,h_1800,c_fill,b_white';
    
    // Fetch and overlay images
    // This is a simplified version - in production you might want to upload
    // the Polaroid images and then create overlays
    
    // For now, return a placeholder URL that the backend will process
    // In a real implementation, you'd use Cloudinary's layer overlays:
    // l_fetch:base64(leftPolaroidUrl),w_435,h_652,x_-300,y_0
    // l_fetch:base64(rightPolaroidUrl),w_435,h_652,x_300,y_0
    
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
