interface PolaroidPreviewProps {
  imageUrl: string;
  text?: string;
  className?: string;
}

export const PolaroidPreview = ({ imageUrl, text, className = "" }: PolaroidPreviewProps) => {
  return (
    <div className={`relative bg-white rounded-lg shadow-lg ${className}`}>
      {/* Polaroid Frame */}
      <div className="p-3 pb-16">
        {/* Photo */}
        <div className="aspect-[2/3] overflow-hidden rounded">
          <img
            src={imageUrl}
            alt="Polaroid preview"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Text Area */}
        {text && (
          <div className="absolute bottom-3 left-3 right-3 h-12 flex items-center justify-center">
            <p className="text-sm font-medium text-center text-gray-800 truncate px-2">
              {text}
            </p>
          </div>
        )}
      </div>
      
      {/* Shadow Effect */}
      <div className="absolute inset-0 shadow-xl rounded-lg pointer-events-none" />
    </div>
  );
};
