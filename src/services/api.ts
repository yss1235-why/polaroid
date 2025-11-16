import { ApiResponse, PrintRequest, PrintResponse, PrinterStatus } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
          'Content-Type': 'application/json',
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

  /**
   * Submit print job to Raspberry Pi
   */
  async printSheet(sheetUrl: string, copies: number = 1): Promise<ApiResponse<PrintResponse>> {
    return this.request<PrintResponse>("/print", {
      method: "POST",
      body: JSON.stringify({
        sheet_url: sheetUrl,
        copies,
      }),
    });
  }

  /**
   * Check print job status
   */
  async getPrintStatus(jobId: string): Promise<ApiResponse<PrintResponse>> {
    return this.request<PrintResponse>(`/print-status/${jobId}`, {
      method: "GET",
    });
  }

  /**
   * Get printer status
   */
  async getPrinterStatus(): Promise<ApiResponse<PrinterStatus>> {
    return this.request<PrinterStatus>("/printer-status", {
      method: "GET",
    });
  }

  /**
   * List available printers
   */
  async listPrinters(): Promise<ApiResponse<PrinterStatus[]>> {
    return this.request<PrinterStatus[]>("/printers", {
      method: "GET",
    });
  }

  /**
   * Select printer
   */
  async selectPrinter(printerName: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/select-printer", {
      method: "POST",
      body: JSON.stringify({
        printer_name: printerName,
      }),
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
}

export const apiService = new ApiService();
