import { 
  ApiResponse, 
  UploadResponse, 
  ProcessResponse, 
  SheetPreviewResponse, 
  CropData, 
  ProcessingMode 
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async uploadPhoto(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<UploadResponse>("/upload", {
      method: "POST",
      body: formData,
    });
  }

  async processPhoto(
    imageId: string,
    mode: ProcessingMode,
    enhanceLevel: number,
    background: string = "white",
    cropData?: CropData
  ): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>("/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        mode,
        enhance_level: enhanceLevel / 100,
        background,
        crop_face: true,
        crop_data: cropData,
      }),
    });
  }

  async adjustEnhancement(
    imageId: string,
    strength: number
  ): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>("/apply-strength", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: imageId,
        strength: strength / 100,
      }),
    });
  }

  async previewSheet(
    imageId: string,
    layout: "3x4" | "2x3",
    paper: string = "4x6",
    dpi: number = 300
  ): Promise<ApiResponse<SheetPreviewResponse>> {
    return this.request<SheetPreviewResponse>("/preview-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        paper,
        dpi,
      }),
    });
  }

  async downloadSheet(
    imageId: string,
    layout: "3x4" | "2x3"
  ): Promise<ApiResponse<{ 
    file: string; 
    filename: string; 
    size_bytes: number; 
    dimensions: string; 
    dpi: number 
  }>> {
    return this.request<{ 
      file: string; 
      filename: string; 
      size_bytes: number; 
      dimensions: string; 
      dpi: number 
    }>("/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        format: "png",
      }),
    });
  }

  // ✅ ONLY print method needed - no printer listing!
  async printSheet(
    imageId: string,
    layout: "3x4" | "2x3",
    copies: number = 1
  ): Promise<ApiResponse<{ 
    job_id: string; 
    printer: string; 
    message: string;
    settings: any;
  }>> {
    return this.request("/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        printer: null,  // ✅ Let backend auto-select
        copies,
      }),
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>("/health", {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
