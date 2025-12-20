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
import { Camera, X, GripVertical, Loader2, ImagePlus } from 'lucide-react';

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
      className={`overflow-hidden animate-fade-in transition-all duration-300 border-border/60 ${
        isDragging 
          ? 'opacity-60 shadow-elevated ring-2 ring-primary/40 scale-[1.01] z-50' 
          : 'shadow-soft hover:shadow-card'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* Drag Handle + Order indicator */}
          <div 
            className="flex flex-col items-center gap-2 pt-1 cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />
            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
          </div>

          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-soft">
            <img
              src={photo.preview}
              alt={`사진 ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Keyword Input */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              이 사진의 상황/키워드 입력
            </label>
            <Input
              placeholder="예: 오전 인지활동, 집중하시는 모습"
              value={photo.keyword}
              onChange={(e) => onKeywordChange(photo.id, e.target.value)}
              disabled={isDisabled}
              className="text-sm h-10"
            />
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
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
    <div className="space-y-5">
      {/* Upload Button */}
      <Card className="border-dashed border-2 border-primary/25 bg-terracotta-light/50 hover:bg-terracotta-light hover:border-primary/40 transition-all duration-300">
        <CardContent className="p-8">
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
            className="w-full h-28 flex flex-col gap-3 hover:bg-transparent"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || photos.length >= maxPhotos}
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium">
                  사진 최적화 중...
                </span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <ImagePlus className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-foreground">
                    오늘의 활동 사진 순서대로 선택하기
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {photos.length}/{maxPhotos}장 선택됨 · 최대 {maxPhotos}장
                  </span>
                </div>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Photo List with Drag & Drop */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            드래그하여 순서 변경 가능 ({photos.length}장)
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