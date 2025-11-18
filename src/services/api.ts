import { ApiResponse, CropData, TextOverlay } from "@/types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface UploadResponse {
  image_id: string;
  url: string;
  width: number;
  height: number;
}

interface ProcessResponse {
  job_id: string;
  left_cropped_only: string;
  left_enhanced: string;
  left_polaroid: string;
  right_cropped_only: string;
  right_enhanced: string;
  right_polaroid: string;
}

interface SheetResponse {
  sheet_url: string;
  sheet_path: string;
  sheet_id: string;
}

interface PrintResponse {
  job_id: string;
  status: string;
  printer_name?: string;
}

interface PrintStatusResponse {
  status: 'processing' | 'printing' | 'completed' | 'failed';
  message: string;
  printer_name?: string;
  created_at: string;
  updated_at: string;
}

interface PrinterStatusResponse {
  available: boolean;
  printers: string[];
  default?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("API Request:", url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }
      
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Upload image to backend (which uploads to Cloudinary)
   */
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<UploadResponse>("/api/upload", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Get preview URL with filter applied
   */
  async getPreview(
    imageId: string,
    filterName: string,
    cropData?: CropData,
    rotation?: number
  ): Promise<ApiResponse<{ preview_url: string }>> {
    const params = new URLSearchParams({
      filter: filterName,
    });

    if (cropData) {
      params.append('crop', JSON.stringify(cropData));
    }

    if (rotation !== undefined) {
      params.append('rotation', rotation.toString());
    }

    return this.request<{ preview_url: string }>(
      `/api/preview/${imageId}?${params.toString()}`,
      { method: "GET" }
    );
  }

  /**
   * Process images into Polaroids with before/after comparison
   */
  async processImages(params: {
    left_image_id: string;
    left_crop: CropData;
    left_rotation: number;
    left_filter: string;
    left_text?: TextOverlay;
    right_image_id: string;
    right_crop: CropData;
    right_rotation: number;
    right_filter: string;
    right_text?: TextOverlay;
  }): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>("/api/process", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Generate final print sheet
   */
  async generateSheet(
    leftPolaroidUrl: string,
    rightPolaroidUrl: string
  ): Promise<ApiResponse<SheetResponse>> {
    return this.request<SheetResponse>("/api/generate-sheet", {
      method: "POST",
      body: JSON.stringify({
        left_polaroid_url: leftPolaroidUrl,
        right_polaroid_url: rightPolaroidUrl,
      }),
    });
  }

  /**
   * Submit print job
   */
  async printSheet(params: {
    sheet_path?: string;
    left_polaroid_url?: string;
    right_polaroid_url?: string;
    copies?: number;
  }): Promise<ApiResponse<PrintResponse>> {
    return this.request<PrintResponse>("/api/print", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Check print job status
   */
  async getPrintStatus(jobId: string): Promise<ApiResponse<PrintStatusResponse>> {
    return this.request<PrintStatusResponse>(`/api/print-status/${jobId}`, {
      method: "GET",
    });
  }

  /**
   * Get printer status
   */
  async getPrinterStatus(): Promise<ApiResponse<PrinterStatusResponse>> {
    return this.request<PrinterStatusResponse>("/api/printer-status", {
      method: "GET",
    });
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(imageId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/delete/${imageId}`, {
      method: "DELETE",
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>("/health", {
      method: "GET",
    });
  }

  /**
   * Get full URL for sheet
   */
  getSheetUrl(sheetUrl: string): string {
    if (sheetUrl.startsWith('http')) {
      return sheetUrl;
    }
    return `${API_BASE_URL}${sheetUrl}`;
  }
}

export const apiService = new ApiService();
