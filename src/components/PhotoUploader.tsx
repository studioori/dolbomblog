import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, X, GripVertical, Loader2, Shield } from 'lucide-react';
import { processImagesWithFaceBlur } from '@/lib/faceBlur';
import { toast } from 'sonner';

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  keyword: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  isLoading?: boolean;
  maxPhotos?: number;
}

const PhotoUploader = ({ photos, onPhotosChange, isLoading = false, maxPhotos = 5 }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus('얼굴 인식 모델 로딩 중...');

    try {
      const { processedFiles, totalFacesBlurred } = await processImagesWithFaceBlur(
        filesToAdd,
        (current, total) => {
          setProcessingStatus(`얼굴 인식 및 블러 처리 중... (${current}/${total})`);
        }
      );

      const newPhotos: PhotoItem[] = processedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        keyword: '',
      }));

      onPhotosChange([...photos, ...newPhotos]);

      if (totalFacesBlurred > 0) {
        toast.success(`${totalFacesBlurred}개의 얼굴이 자동으로 블러 처리되었습니다.`);
      }
    } catch (error) {
      console.error('Face blur processing failed:', error);
      toast.error('얼굴 블러 처리 중 오류가 발생했습니다. 원본 이미지가 사용됩니다.');
      
      // Fallback: use original files
      const newPhotos: PhotoItem[] = filesToAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        keyword: '',
      }));
      onPhotosChange([...photos, ...newPhotos]);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find(p => p.id === id);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onPhotosChange(photos.filter(p => p.id !== id));
  };

  const handleKeywordChange = (id: string, keyword: string) => {
    onPhotosChange(
      photos.map(p => p.id === id ? { ...p, keyword } : p)
    );
  };

  return (
    <div className="space-y-4">
      {/* Processing Overlay */}
      {isProcessing && (
        <Card className="border-primary/50 bg-primary/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{processingStatus}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" />
                개인정보 보호를 위해 얼굴을 자동으로 블러 처리합니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading || isProcessing || photos.length >= maxPhotos}
          />
          <Button
            variant="ghost"
            className="w-full h-24 flex flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessing || photos.length >= maxPhotos}
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              📸 오늘의 활동 사진 순서대로 선택하기 (최대 {maxPhotos}장)
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>얼굴 자동 블러 처리 • {photos.length}/{maxPhotos}장 선택됨</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Photo List */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            선택된 사진 ({photos.length}장) - 순서대로 블로그에 삽입됩니다
          </p>
          
          {photos.map((photo, index) => (
            <Card key={photo.id} className="overflow-hidden animate-fade-in">
              <CardContent className="p-3">
                <div className="flex gap-3 items-start">
                  {/* Order indicator */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={photo.preview}
                      alt={`사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Keyword Input */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">
                      이 사진의 상황/키워드 입력
                    </label>
                    <Input
                      placeholder="예: 오전 인지활동, 집중하시는 모습"
                      value={photo.keyword}
                      onChange={(e) => handleKeywordChange(photo.id, e.target.value)}
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePhoto(photo.id)}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
