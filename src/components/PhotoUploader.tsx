import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, X, GripVertical, Loader2 } from 'lucide-react';

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

interface SortablePhotoItemProps {
  photo: PhotoItem;
  index: number;
  onKeywordChange: (id: string, keyword: string) => void;
  onRemove: (id: string) => void;
  isDisabled: boolean;
}

const SortablePhotoItem = ({ photo, index, onKeywordChange, onRemove, isDisabled }: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden animate-fade-in transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 shadow-xl ring-2 ring-primary scale-[1.02] z-50' 
          : 'shadow-sm'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex gap-3 items-start">
          {/* Drag Handle + Order indicator */}
          <div 
            className="flex flex-col items-center gap-1 pt-2 cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground/70 hover:text-primary transition-colors" />
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
          </div>

          {/* Keyword Input */}
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">
              이 사진의 상황/키워드 입력
            </label>
            <Input
              placeholder="예: 오전 인지활동, 집중하시는 모습"
              value={photo.keyword}
              onChange={(e) => onKeywordChange(photo.id, e.target.value)}
              disabled={isDisabled}
              className="text-sm"
            />
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(photo.id)}
            disabled={isDisabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
};

const PhotoUploader = ({ photos, onPhotosChange, isLoading = false, maxPhotos = 5 }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onPhotosChange(arrayMove(photos, oldIndex, newIndex));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    setIsCompressing(true);

    try {
      const compressedFiles = await Promise.all(
        filesToAdd.map(file => compressImage(file))
      );

      const newPhotos: PhotoItem[] = compressedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        keyword: '',
      }));

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const isDisabled = isLoading || isCompressing;

  return (
    <div className="space-y-4">
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
            disabled={isDisabled || photos.length >= maxPhotos}
          />
          <Button
            variant="ghost"
            className="w-full h-24 flex flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || photos.length >= maxPhotos}
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium">
                  📷 사진 최적화 중...
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  📸 오늘의 활동 사진 순서대로 선택하기 (최대 {maxPhotos}장)
                </span>
                <span className="text-xs text-muted-foreground">
                  {photos.length}/{maxPhotos}장 선택됨
                </span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Photo List with Drag & Drop */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            ↕️ 드래그하여 순서 변경 가능 ({photos.length}장)
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {photos.map((photo, index) => (
                  <SortablePhotoItem
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onKeywordChange={handleKeywordChange}
                    onRemove={handleRemovePhoto}
                    isDisabled={isDisabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
