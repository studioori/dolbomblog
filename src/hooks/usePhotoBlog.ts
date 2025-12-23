import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  generatedBlog: GeneratedBlog | null;
  error: string | null;
  uploadAndGenerate: (photos: PhotoItem[]) => Promise<void>;
  reset: () => void;
}

export const usePhotoBlog = (): UsePhotoBlogReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, refreshProfile } = useAuth();

  const uploadPhotos = async (photos: PhotoItem[]): Promise<string[]> => {
    const urls: string[] = [];
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
    }

    return urls;
  };

  const uploadAndGenerate = async (photos: PhotoItem[]) => {
    if (photos.length === 0) {
      setError('사진을 최소 1장 이상 선택해주세요.');
      return;
    }

    if (!user || !profile) {
      setError('로그인이 필요합니다.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Step 1: Upload photos to storage
      const urls = await uploadPhotos(photos);
      setUploadedUrls(urls);

      setIsUploading(false);
      setIsGenerating(true);

      // Step 2: Call AI vision function with center name
      const photosData = photos.map((photo, index) => ({
        imageUrl: urls[index],
        keyword: photo.keyword || '',
      }));

      const { data, error: fnError } = await supabase.functions.invoke('generate-blog-vision', {
        body: { photos: photosData, centerName: profile.center_name },
      });

      if (fnError) {
        throw new Error(fnError.message || '블로그 생성 중 오류가 발생했습니다.');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const blogData = {
        title: data.title || '오늘 하루도 따뜻했습니다',
        content: data.content || '',
        hashtags: data.hashtags || ['#늘봄주야간보호센터'],
      };

      setGeneratedBlog(blogData);

      // Save to database for 24h history
      const fullContent = `${blogData.title}\n\n${blogData.content}\n\n${blogData.hashtags.join(' ')}`;
      
      const { error: saveError } = await supabase
        .from('generated_posts')
        .insert({
          content: fullContent,
          image_paths: urls,
          user_id: user.id,
        });

      if (saveError) {
        console.warn('Failed to save post to history:', saveError);
      }

      // Increment usage count
      await supabase.rpc('increment_usage', { _user_id: user.id });
      refreshProfile();

    } catch (err) {
      console.error('Error in uploadAndGenerate:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setUploadedUrls([]);
    setGeneratedBlog(null);
    setError(null);
  };

  return {
    isUploading,
    isGenerating,
    uploadedUrls,
    generatedBlog,
    error,
    uploadAndGenerate,
    reset,
  };
};
