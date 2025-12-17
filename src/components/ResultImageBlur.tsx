import { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResultImageBlurProps {
  imageUrl: string;
  storagePath: string;
  alt: string;
  onImageUpdated: (newUrl: string) => void;
}

const BLUR_RADIUS = 50;

const ResultImageBlur = ({ 
  imageUrl, 
  storagePath,
  alt,
  onImageUpdated 
}: ResultImageBlurProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas to actual image size for quality
      canvas.width = img.width;
      canvas.height = img.height;
      setCanvasSize({ width: img.width, height: img.height });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
    };
    img.src = imageUrl;

    return () => {
      setIsLoaded(false);
    };
  }, [imageUrl]);

  const applyCircularBlur = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const x = Math.max(0, Math.floor(centerX - radius));
    const y = Math.max(0, Math.floor(centerY - radius));
    const width = Math.min(canvasWidth - x, Math.ceil(radius * 2));
    const height = Math.min(canvasHeight - y, Math.ceil(radius * 2));

    if (width <= 0 || height <= 0) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    const pixelSize = Math.max(10, Math.floor(radius / 4));
    const originalData = new Uint8ClampedArray(data);

    for (let py = 0; py < height; py += pixelSize) {
      for (let px = 0; px < width; px += pixelSize) {
        const blockCenterX = px + pixelSize / 2;
        const blockCenterY = py + pixelSize / 2;
        const distX = blockCenterX - radius;
        const distY = blockCenterY - radius;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance > radius) continue;

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
  }, []);

  const uploadBlurredImage = useCallback(async (canvas: HTMLCanvasElement) => {
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          try {
            // Upload with upsert to overwrite existing file
            const { error: uploadError } = await supabase.storage
              .from('daily-photos')
              .upload(storagePath, blob, {
                cacheControl: '3600',
                upsert: true,
              });

            if (uploadError) {
              throw uploadError;
            }

            // Get new public URL with cache-busting timestamp
            const { data: urlData } = supabase.storage
              .from('daily-photos')
              .getPublicUrl(storagePath);

            const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            resolve(newUrl);
          } catch (err) {
            reject(err);
          }
        },
        'image/png',
        1.0
      );
    });
  }, [storagePath]);

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isLoaded || isSaving) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get click coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Calculate blur radius relative to image size
    const avgDimension = (canvas.width + canvas.height) / 2;
    const blurRadius = Math.max(BLUR_RADIUS, avgDimension * 0.05);

    // Apply blur
    applyCircularBlur(ctx, x, y, blurRadius);

    // Update image reference for subsequent blurs
    const newImg = new Image();
    newImg.crossOrigin = 'anonymous';
    newImg.onload = () => {
      imageRef.current = newImg;
    };
    newImg.src = canvas.toDataURL('image/png');

    // Auto-save to Supabase
    setIsSaving(true);
    try {
      const newUrl = await uploadBlurredImage(canvas);
      onImageUpdated(newUrl);
      toast.success('블러 처리 완료 및 저장됨', { duration: 2000 });
    } catch (err) {
      console.error('Failed to save blurred image:', err);
      toast.error('이미지 저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative my-4 group">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`w-full rounded-lg shadow-md transition-all ${
          isLoaded && !isSaving
            ? 'cursor-crosshair hover:ring-4 hover:ring-primary/30'
            : 'cursor-wait'
        }`}
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: canvasSize.width && canvasSize.height 
            ? `${canvasSize.width} / ${canvasSize.height}` 
            : 'auto'
        }}
        title="클릭하여 블러 처리"
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="absolute top-2 right-2 bg-background/90 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg border border-border">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-xs text-foreground">저장 중...</span>
        </div>
      )}

      {/* Hover tooltip */}
      {isLoaded && !isSaving && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg pointer-events-none flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 px-3 py-2 rounded-lg shadow-lg border border-border">
            <p className="text-sm font-medium text-foreground">🖱️ 클릭하여 블러 처리</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultImageBlur;
