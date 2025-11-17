import { useState, useEffect } from "react";
import { CLOUDINARY_FILTERS, FilterType } from "@/types";
import { cloudinaryService } from "@/services/cloudinary";
import { Loader2 } from "lucide-react";

interface FilterGridProps {
  imageId: string;
  selectedFilter: FilterType | null;
  onFilterSelect: (filter: FilterType) => void;
}

export const FilterGrid = ({ imageId, selectedFilter, onFilterSelect }: FilterGridProps) => {
  const [loadingFilters, setLoadingFilters] = useState<Set<string>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Generate preview URLs for all filters
    const urls = new Map<string, string>();
    CLOUDINARY_FILTERS.forEach(filter => {
      const url = cloudinaryService.generateFilterPreviewUrl(imageId, filter);
      urls.set(filter.name, url);
    });
    setPreviewUrls(urls);
  }, [imageId]);

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
        const isLoading = loadingFilters.has(filter.name);

        return (
          <button
            key={filter.name}
            onClick={() => onFilterSelect(filter)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
              isSelected
                ? "border-primary shadow-lg scale-105"
                : "border-border hover:border-primary/50 hover:scale-102"
            }`}
          >
            {/* Filter Preview Image */}
            <div className="aspect-[2/3] bg-muted relative">
              {previewUrl && (
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
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
