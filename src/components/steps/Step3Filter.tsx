import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { FilterType, CLOUDINARY_FILTERS } from "@/types";
import { FilterGrid } from "@/components/FilterGrid";

interface Step3FilterProps {
  imageId: string;
  secondImageId?: string;
  onFilterSelect: (filter: FilterType, secondFilter?: FilterType) => void;
  preloadedUrls?: Map<string, string>; // NEW
  secondPreloadedUrls?: Map<string, string>; // NEW
  isPreloading?: boolean; // NEW
}

const Step3Filter = ({ 
  imageId, 
  secondImageId, 
  onFilterSelect,
  preloadedUrls,
  secondPreloadedUrls,
  isPreloading = false
}: Step3FilterProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(CLOUDINARY_FILTERS[0]);
  const [secondSelectedFilter, setSecondSelectedFilter] = useState<FilterType>(CLOUDINARY_FILTERS[0]);
  const [sameFilterForBoth, setSameFilterForBoth] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState<"first" | "second">("first");

  const isDualMode = !!secondImageId;

  const handleFilterSelect = (filter: FilterType) => {
    if (currentPhoto === "first") {
      setSelectedFilter(filter);
      if (sameFilterForBoth) {
        setSecondSelectedFilter(filter);
      }
    } else {
      setSecondSelectedFilter(filter);
    }
  };

  const handleContinue = () => {
    if (isDualMode && !sameFilterForBoth && currentPhoto === "first") {
      // Move to second photo filter selection
      setCurrentPhoto("second");
      return;
    }

    // All done
    onFilterSelect(
      selectedFilter,
      isDualMode ? secondSelectedFilter : undefined
    );
  };

  const handleBack = () => {
    if (isDualMode && currentPhoto === "second") {
      setCurrentPhoto("first");
    }
  };

  // Calculate loading progress
  const currentUrls = currentPhoto === "first" ? preloadedUrls : secondPreloadedUrls;
  const loadedCount = currentUrls?.size || 0;
  const totalCount = CLOUDINARY_FILTERS.length;
  const loadingProgress = Math.round((loadedCount / totalCount) * 100);

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
          Choose Your Filter
        </h2>
        
        {/* Pre-loading indicator */}
        {isPreloading && loadedCount < totalCount && (
          <div className="mb-3 bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Loading filters...</span>
              <span className="text-sm text-muted-foreground">{loadedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You can select a filter as soon as it loads
            </p>
          </div>
        )}
        
        {isDualMode && (
          <>
            <p className="text-sm text-center text-muted-foreground mb-3">
              {currentPhoto === "first" ? "Left Polaroid" : "Right Polaroid"}
              {" "}(Photo {currentPhoto === "first" ? "1" : "2"} of 2)
            </p>

            {/* Same Filter Toggle */}
            <div className="flex items-center justify-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameFilterForBoth}
                  onChange={(e) => {
                    setSameFilterForBoth(e.target.checked);
                    if (e.target.checked) {
                      setSecondSelectedFilter(selectedFilter);
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Use same filter for both photos
                </span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Filter Grid */}
      <div className="flex-1 overflow-y-auto">
        <FilterGrid
          imageId={currentPhoto === "first" ? imageId : secondImageId!}
          selectedFilter={currentPhoto === "first" ? selectedFilter : secondSelectedFilter}
          onFilterSelect={handleFilterSelect}
          preloadedUrls={currentUrls}
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 border-t border-border bg-card">
        {isDualMode && currentPhoto === "second" && (
          <Button 
            onClick={handleBack}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back to First Photo
          </Button>
        )}
        
        <Button 
          onClick={handleContinue}
          className="w-full gap-2"
          size="lg"
          disabled={!selectedFilter}
        >
          {isDualMode && !sameFilterForBoth && currentPhoto === "first" 
            ? "Continue to Second Photo" 
            : "Continue to Processing"}
          {isPreloading && loadedCount < totalCount && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {(!isPreloading || loadedCount >= totalCount) && (
            <ArrowRight className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step3Filter;
