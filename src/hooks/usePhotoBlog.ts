import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { type PhotoItem } from '@/components/PhotoUploader';

interface GeneratedBlog {
  title: string;
  content: string;
  hashtags: string[];
}

interface SimulationProfile {
  id: string;
  center_name: string;
  region: string;
  writing_tone_prompt: string | null;
  style_config: Record<string, unknown> | null;
}

interface UsePhotoBlogOptions {
  simulationProfile?: SimulationProfile | null;
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

export const usePhotoBlog = (options?: UsePhotoBlogOptions): UsePhotoBlogReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  
  const simulationProfile = options?.simulationProfile;

  const uploadPhotos = async (photos: PhotoItem[]): Promise<{ urls: string[]; fileNames: string[] }> => {
    const urls: string[] = [];
    const fileNames: string[] = [];
    const sessionId = `session-${Date.now()}`;

    try {
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
        fileNames.push(fileName);
      }

      return { urls, fileNames };
    } catch (originalError) {
      // Cleanup previously uploaded files on partial failure
      // Keep cleanup exception separate from original error
      if (fileNames.length > 0) {
        await cleanupUploadedPhotos(fileNames);
      }
      throw originalError;
    }
  };

  const cleanupUploadedPhotos = async (fileNames: string[]) => {
    if (fileNames.length === 0) return;

    try {
      const { error: removeError } = await supabase.storage
        .from('daily-photos')
        .remove(fileNames);

      if (removeError) {
        console.warn('Failed to cleanup uploaded photos:', removeError);
      }
    } catch (err) {
      console.warn('Exception during cleanup:', err);
    }
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

    let uploadedFileNames: string[] = [];

    try {
      // Step 1: Upload photos to storage
      const { urls, fileNames } = await uploadPhotos(photos);
      uploadedFileNames = fileNames;
      setUploadedUrls(urls);

      setIsUploading(false);
      setIsGenerating(true);

      // Step 2: Call AI vision function with center name
      // Use simulation profile if admin is testing, otherwise use own profile
      const targetProfile = simulationProfile || profile;

      const photosData = photos.map((photo, index) => ({
        imageUrl: urls[index],
        keyword: photo.keyword || '',
      }));

      // Replace {{CURRENT_DATE}} token with actual date in Korean format
      const today = new Date();
      const currentDateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
      const processedTonePrompt = (targetProfile.writing_tone_prompt || '')
        .replace(/\{\{CURRENT_DATE\}\}/g, currentDateStr);

      // 최근 4주 글의 제목·도입부 → 도입 중복 회피용으로 전달
      // generated_posts는 24h 후 삭제되므로 별도 장기보존 테이블(post_style_history)에서 조회
      let recentSamples: { title: string; opening: string }[] = [];
      {
        const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recent, error: recentErr } = await supabase
          .from('post_style_history')
          .select('title, opening')
          .eq('user_id', user.id)
          .gte('created_at', fourWeeksAgo)
          .order('created_at', { ascending: false })
          .limit(8);
        if (recentErr) {
          console.warn('Failed to fetch recent style history:', recentErr.message);
        } else {
          recentSamples = (recent || []).map((r) => ({
            title: r.title || '',
            opening: (r.opening || '').slice(0, 60),
          }));
        }
      }

      const { data, error: fnError } = await supabase.functions.invoke('generate-blog-vision', {
        body: {
          photos: photosData,
          centerName: targetProfile.center_name,
          region: targetProfile.region || '',
          writingTonePrompt: processedTonePrompt || null,
          styleConfig: targetProfile.style_config || null,
          recentSamples,
        },
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

      // Save lightweight style history (장기 보존 — 도입부 중복 회피용)
      {
        const titleLine = (blogData.content || '').split('\n').map((l) => l.trim()).filter(Boolean);
        const { error: histError } = await supabase.from('post_style_history').insert({
          user_id: user.id,
          title: blogData.title || '',
          opening: (titleLine[0] || '').slice(0, 120),
        });
        if (histError) {
          console.warn('Failed to save style history:', histError.message);
        }
      }

      // Increment usage count and log activity (only on complete success)
      const { error: usageError } = await supabase.rpc('increment_usage', { _user_id: user.id });
      if (usageError) {
        console.warn('Failed to increment usage:', usageError);
      }

      const { error: logError } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'GENERATE_POST',
      });
      if (logError) {
        console.warn('Failed to log activity:', logError);
      }

      refreshProfile();

    } catch (err) {
      console.error('Error in uploadAndGenerate:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');

      // Cleanup uploaded photos on failure
      if (uploadedFileNames.length > 0) {
        await cleanupUploadedPhotos(uploadedFileNames);
      }
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
