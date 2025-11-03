import { ApiResponse, UploadResponse, ProcessResponse, SheetPreviewResponse, CropData, ProcessingMode } from "@/types";

// Base API URL - Update this with your actual backend URL
const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
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
    background: string = "white"
  ): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>("/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        mode,
        enhance_level: enhanceLevel / 100, // Convert 0-100 to 0-1
        background,
        crop_face: true,
      }),
    });
  }

  async cropPhoto(
    imageId: string,
    cropData: CropData
  ): Promise<ApiResponse<{ croppedImageUrl: string }>> {
    return this.request<{ croppedImageUrl: string }>("/crop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
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
        strength: strength / 100, // Convert 0-100 to 0-1
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

  async printSheet(
    imageId: string,
    copies: number = 1,
    printer: string = "default"
  ): Promise<ApiResponse<{ status: string; jobId: string }>> {
    return this.request<{ status: string; jobId: string }>("/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        copies,
        printer,
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
