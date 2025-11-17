interface PolaroidPreviewProps {
  imageUrl: string;
  text?: string;
  className?: string;
}

export const PolaroidPreview = ({ imageUrl, text, className = "" }: PolaroidPreviewProps) => {
  return (
    <div className={`relative bg-white rounded-sm shadow-lg polaroid-border-preview ${className}`}>
      {/* Polaroid Frame with proper borders */}
      <div className="p-[23px] pt-[15px] pb-[117px]">
        {/* Photo */}
        <div className="aspect-[2/3] overflow-hidden rounded-sm border border-gray-100">
          <img
            src={imageUrl}
            alt="Polaroid preview"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Text Area - in the bottom white space */}
        {text && (
          <div className="absolute bottom-[23px] left-[23px] right-[23px] flex items-center justify-center" style={{ height: '94px' }}>
            <p className="text-sm font-medium text-center text-gray-800 truncate px-2">
              {text}
            </p>
          </div>
        )}
      </div>
      
      {/* Shadow Effect */}
      <div className="absolute inset-0 shadow-xl rounded-sm pointer-events-none" />
    </div>
  );
};
