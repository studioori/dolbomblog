import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type PhotoItem } from '@/components/PhotoUploader';

interface GeneratedBlog {
  title: string;
  content: string;
  hashtags: string[];
}

interface UsePhotoBlogReturn {
  isUploading: boolean;
  isGenerating: boolean;
  uploadedUrls: string[];
  uploadedPaths: string[];
  generatedBlog: GeneratedBlog | null;
  error: string | null;
  uploadAndGenerate: (photos: PhotoItem[]) => Promise<void>;
  deletePhotos: () => Promise<void>;
  reset: () => void;
  updateImageUrl: (index: number, newUrl: string) => void;
}

export const usePhotoBlog = (): UsePhotoBlogReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadPhotos = async (photos: PhotoItem[]): Promise<{ urls: string[], paths: string[] }> => {
    const urls: string[] = [];
    const paths: string[] = [];
    const sessionId = `session-${Date.now()}`;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${sessionId}/${i + 1}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('daily-photos')
        .upload(fileName, photo.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`사진 ${i + 1} 업로드 실패: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('daily-photos')
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
      paths.push(fileName);
    }

    return { urls, paths };
  };

  const uploadAndGenerate = async (photos: PhotoItem[]) => {
    if (photos.length === 0) {
      setError('사진을 최소 1장 이상 선택해주세요.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Step 1: Upload photos to storage
      const { urls, paths } = await uploadPhotos(photos);
      setUploadedUrls(urls);
      setUploadedPaths(paths);

      setIsUploading(false);
      setIsGenerating(true);

      // Step 2: Call AI vision function
      const photosData = photos.map((photo, index) => ({
        imageUrl: urls[index],
        keyword: photo.keyword || '',
      }));

      const { data, error: fnError } = await supabase.functions.invoke('generate-blog-vision', {
        body: { photos: photosData },
      });

      if (fnError) {
        throw new Error(fnError.message || '블로그 생성 중 오류가 발생했습니다.');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedBlog({
        title: data.title || '오늘 하루도 따뜻했습니다',
        content: data.content || '',
        hashtags: data.hashtags || ['#늘봄주야간보호센터'],
      });

    } catch (err) {
      console.error('Error in uploadAndGenerate:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  const deletePhotos = async () => {
    if (uploadedPaths.length === 0) return;

    try {
      const { error: fnError } = await supabase.functions.invoke('delete-photos', {
        body: { filePaths: uploadedPaths },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setUploadedUrls([]);
      setUploadedPaths([]);
    } catch (err) {
      console.error('Error deleting photos:', err);
      throw err;
    }
  };

  const reset = () => {
    setUploadedUrls([]);
    setUploadedPaths([]);
    setGeneratedBlog(null);
    setError(null);
  };

  const updateImageUrl = (index: number, newUrl: string) => {
    setUploadedUrls(prev => {
      const updated = [...prev];
      if (index >= 0 && index < updated.length) {
        updated[index] = newUrl;
      }
      return updated;
    });
  };

  return {
    isUploading,
    isGenerating,
    uploadedUrls,
    uploadedPaths,
    generatedBlog,
    error,
    uploadAndGenerate,
    deletePhotos,
    reset,
    updateImageUrl,
  };
};
