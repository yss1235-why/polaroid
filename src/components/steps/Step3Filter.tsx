import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FilterType, CLOUDINARY_FILTERS } from "@/types";
import { FilterGrid } from "@/components/FilterGrid";

interface Step3FilterProps {
  imageId: string;
  secondImageId?: string;
  onFilterSelect: (filter: FilterType, secondFilter?: FilterType) => void;
}

const Step3Filter = ({ imageId, secondImageId, onFilterSelect }: Step3FilterProps) => {
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

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
          Choose Your Filter
        </h2>
        
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
        >
          {isDualMode && !sameFilterForBoth && currentPhoto === "first" 
            ? "Continue to Second Photo" 
            : "Continue to Add Text"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step3Filter;
