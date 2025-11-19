import { useState, useEffect } from "react";
import { CLOUDINARY_FILTERS, FilterType } from "@/types";
import { apiService } from "@/services/api";
import { Loader2 } from "lucide-react";

interface FilterGridProps {
  imageId: string;
  selectedFilter: FilterType | null;
  onFilterSelect: (filter: FilterType) => void;
  preloadedUrls?: Map<string, string>; // NEW: Accept pre-loaded URLs
}

export const FilterGrid = ({ imageId, selectedFilter, onFilterSelect, preloadedUrls }: FilterGridProps) => {
  const [loadingFilters, setLoadingFilters] = useState<Set<string>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(preloadedUrls || new Map());

  useEffect(() => {
    // If we have pre-loaded URLs, use them
    if (preloadedUrls && preloadedUrls.size > 0) {
      console.log(`✅ Using ${preloadedUrls.size} pre-loaded filter previews`);
      setPreviewUrls(new Map(preloadedUrls));
      return;
    }

    // Otherwise, load them now (fallback)
    console.log("⚠️ No pre-loaded URLs, loading now...");
    loadPreviewsSequentially();
  }, [imageId, preloadedUrls]);

  const loadPreviewsSequentially = async () => {
    const urls = new Map<string, string>();
    
    for (const filter of CLOUDINARY_FILTERS) {
      try {
        setLoadingFilters(prev => new Set(prev).add(filter.name));
        
        const response = await apiService.getPreview(imageId, filter.name);
        
        if (response.success && response.data) {
          urls.set(filter.name, response.data.preview_url);
          setPreviewUrls(new Map(urls)); // Update state after each load
        }
        
        setLoadingFilters(prev => {
          const newSet = new Set(prev);
          newSet.delete(filter.name);
          return newSet;
        });

        // Small delay between requests to avoid congestion
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Failed to load preview for ${filter.name}:`, error);
        setLoadingFilters(prev => {
          const newSet = new Set(prev);
          newSet.delete(filter.name);
          return newSet;
        });
      }
    }
  };

  const handleImageLoad = (filterName: string) => {
    setLoadingFilters(prev => {
      const newSet = new Set(prev);
      newSet.delete(filterName);
      return newSet;
    });
  };

  const handleImageError = (filterName: string) => {
    console.error(`Failed to load preview for filter: ${filterName}`);
    setLoadingFilters(prev => {
      const newSet = new Set(prev);
      newSet.delete(filterName);
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {CLOUDINARY_FILTERS.map((filter) => {
        const isSelected = selectedFilter?.name === filter.name;
        const previewUrl = previewUrls.get(filter.name);
        const isLoading = loadingFilters.has(filter.name) || !previewUrl;

        return (
          <button
            key={filter.name}
            onClick={() => onFilterSelect(filter)}
            disabled={!previewUrl} // Disable until loaded
            className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
              isSelected
                ? "border-primary shadow-lg scale-105"
                : "border-border hover:border-primary/50 hover:scale-102"
            } ${!previewUrl ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Filter Preview Image */}
            <div className="aspect-[2/3] bg-muted relative">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={filter.displayName}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(filter.name)}
                    onError={() => handleImageError(filter.name)}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Hover Overlay */}
              {previewUrl && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              )}
            </div>

            {/* Filter Name */}
            <div className={`p-2 text-center text-sm font-medium ${
              isSelected ? "bg-primary text-primary-foreground" : "bg-card"
            }`}>
              {filter.displayName}
            </div>
          </button>
        );
      })}
    </div>
  );
};
