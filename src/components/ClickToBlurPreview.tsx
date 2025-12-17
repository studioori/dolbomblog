import { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ClickToBlurPreviewProps {
  imageUrl: string;
  onImageUpdate: (newFile: File, newPreviewUrl: string) => void;
  disabled?: boolean;
  className?: string;
}

const BLUR_RADIUS = 40;

const ClickToBlurPreview = ({ 
  imageUrl, 
  onImageUpdate, 
  disabled = false,
  className = ''
}: ClickToBlurPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size to match image aspect ratio within thumbnail bounds
      const maxSize = 80;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.src = imageUrl;

    return () => {
      setIsLoaded(false);
    };
  }, [imageUrl]);

  const applyBlurAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Create a full-resolution canvas for actual blur processing
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;
    const fullCtx = fullCanvas.getContext('2d');
    if (!fullCtx) return;

    // Draw original image
    fullCtx.drawImage(img, 0, 0);

    // Scale click coordinates to full image size
    const scaleX = img.width / canvas.width;
    const scaleY = img.height / canvas.height;
    const fullX = x * scaleX;
    const fullY = y * scaleY;
    const fullRadius = BLUR_RADIUS * Math.max(scaleX, scaleY);

    // Apply circular pixelated blur at the clicked point
    applyCircularBlur(fullCtx, fullX, fullY, fullRadius);

    // Update the preview canvas
    const previewCtx = canvas.getContext('2d');
    if (previewCtx) {
      previewCtx.drawImage(fullCanvas, 0, 0, canvas.width, canvas.height);
    }

    // Update the stored image reference for subsequent clicks
    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
    };
    newImg.src = fullCanvas.toDataURL('image/jpeg', 0.92);

    // Convert to file and update parent
    fullCanvas.toBlob(
      (blob) => {
        if (blob) {
          const newFile = new File([blob], 'blurred-image.jpg', { type: 'image/jpeg' });
          const newPreviewUrl = URL.createObjectURL(blob);
          onImageUpdate(newFile, newPreviewUrl);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const applyCircularBlur = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Define bounding box for the circular area
    const x = Math.max(0, Math.floor(centerX - radius));
    const y = Math.max(0, Math.floor(centerY - radius));
    const width = Math.min(canvasWidth - x, Math.ceil(radius * 2));
    const height = Math.min(canvasHeight - y, Math.ceil(radius * 2));

    if (width <= 0 || height <= 0) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    // Pixelation size
    const pixelSize = Math.max(8, Math.floor(radius / 4));

    // Store original data for circular mask
    const originalData = new Uint8ClampedArray(data);

    // Apply pixelation
    for (let py = 0; py < height; py += pixelSize) {
      for (let px = 0; px < width; px += pixelSize) {
        // Check if this block center is within the circle
        const blockCenterX = px + pixelSize / 2;
        const blockCenterY = py + pixelSize / 2;
        const distX = blockCenterX - radius;
        const distY = blockCenterY - radius;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance > radius) continue;

        // Calculate average color for this block
        let r = 0, g = 0, b = 0, count = 0;

        for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
            const idx = ((py + dy) * width + (px + dx)) * 4;
            r += originalData[idx];
            g += originalData[idx + 1];
            b += originalData[idx + 2];
            count++;
          }
        }

        if (count === 0) continue;

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Apply average color to pixels within the circle
        for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
            const pixelX = px + dx;
            const pixelY = py + dy;
            const pixelDistX = pixelX - radius;
            const pixelDistY = pixelY - radius;
            const pixelDist = Math.sqrt(pixelDistX * pixelDistX + pixelDistY * pixelDistY);

            if (pixelDist <= radius) {
              const idx = (pixelY * width + pixelX) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, x, y);
  };

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || !isLoaded || isProcessing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Use setTimeout to allow UI update before processing
    setTimeout(() => {
      applyBlurAtPoint(x, y);
      setIsProcessing(false);
    }, 10);
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`w-full h-full object-cover rounded-lg ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair hover:ring-2 hover:ring-primary/50'
        }`}
        title="클릭하여 추가 블러 적용"
      />
      {(!isLoaded || isProcessing) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      {isLoaded && !disabled && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-lg">
          <p className="text-[8px] text-white text-center">클릭하여 블러</p>
        </div>
      )}
    </div>
  );
};

export default ClickToBlurPreview;
