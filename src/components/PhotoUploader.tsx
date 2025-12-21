import { useRef, useState, useMemo } from 'react';
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
import { X, GripVertical, Loader2, ImagePlus, Upload } from 'lucide-react';

const PLACEHOLDER_EXAMPLES = [
  "예: 오전 인지활동, 집중하시는 모습",
  "예: 점심식사, 맛있게 드시는 장면",
  "예: 미술활동, 작품 만드시는 모습",
  "예: 체조시간, 함께 운동하시는 모습",
  "예: 생일잔치, 케이크 앞에서 미소",
  "예: 노래교실, 즐겁게 노래하시는 모습",
  "예: 산책시간, 야외에서 걷는 모습",
  "예: 종이접기, 손으로 만드시는 모습",
  "예: 간식시간, 다과 드시는 장면",
  "예: 프로그램 참여, 적극적으로 활동하시는 모습",
];

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
  placeholderExample: string;
}

const SortablePhotoItem = ({ photo, index, onKeywordChange, onRemove, isDisabled, placeholderExample }: SortablePhotoItemProps) => {
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
      className={`overflow-hidden transition-all duration-300 border-border/60 group ${
        isDragging 
          ? 'opacity-60 shadow-elevated ring-2 ring-primary/40 scale-[1.02] z-50 rotate-1' 
          : 'shadow-soft hover:shadow-card hover:border-primary/30'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* Drag Handle + Order indicator */}
          <div 
            className="flex flex-col items-center gap-2 pt-1 cursor-grab active:cursor-grabbing touch-none transition-transform duration-200 hover:scale-110"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors duration-200" />
            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-105">
              {index + 1}
            </span>
          </div>

          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-soft group/thumb transition-transform duration-300 hover:scale-105">
            <img
              src={photo.preview}
              alt={`사진 ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Keyword Input */}
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground/70">
              이 사진의 상황/키워드 입력
            </label>
            <Input
              placeholder={placeholderExample}
              value={photo.keyword}
              onChange={(e) => onKeywordChange(photo.id, e.target.value)}
              disabled={isDisabled}
              className="text-sm h-10 transition-all duration-200 focus:shadow-soft"
            />
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
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
  const [isDragOver, setIsDragOver] = useState(false);

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
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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
      {/* Upload Button with Drag & Drop */}
      <Card 
        className={`border-dashed border-2 transition-all duration-300 cursor-pointer group ${
          isDragOver 
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-elevated' 
            : 'border-primary/25 bg-forest-light hover:bg-primary/5 hover:border-primary/40 hover:shadow-card'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isDisabled && photos.length < maxPhotos && fileInputRef.current?.click()}
      >
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
          <div className="w-full h-28 flex flex-col items-center justify-center gap-3">
            {isCompressing ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium animate-pulse">
                  사진 최적화 중...
                </span>
              </>
            ) : isDragOver ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center animate-bounce">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">
                  여기에 사진을 놓으세요!
                </span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/25 group-hover:scale-110 group-hover:rotate-3">
                  <ImagePlus className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                    오늘의 활동 사진 순서대로 선택하기
                  </span>
                  <span className="text-xs text-muted-foreground block transition-colors duration-200">
                    {photos.length}/{maxPhotos}장 선택됨 · 드래그 앤 드롭 가능
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo List with Drag & Drop */}
      {photos.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 transition-colors duration-200 hover:text-foreground/70">
            <GripVertical className="w-4 h-4 animate-pulse" />
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
                    placeholderExample={PLACEHOLDER_EXAMPLES[index % PLACEHOLDER_EXAMPLES.length]}
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