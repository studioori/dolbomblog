import { useState } from 'react';
import Header from '@/components/Header';
import PhotoUploader, { type PhotoItem } from '@/components/PhotoUploader';
import PhotoBlogResult from '@/components/PhotoBlogResult';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePhotoBlog } from '@/hooks/usePhotoBlog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

const Index = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const { toast } = useToast();
  
  const {
    isUploading,
    isGenerating,
    uploadedUrls,
    generatedBlog,
    error,
    uploadAndGenerate,
    deletePhotos,
    reset,
  } = usePhotoBlog();

  const isLoading = isUploading || isGenerating;

  const handleGenerate = async () => {
    if (photos.length === 0) {
      toast({
        title: '사진을 선택해주세요',
        description: '최소 1장 이상의 사진이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    await uploadAndGenerate(photos);
  };

  const handleReset = () => {
    // Cleanup preview URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    reset();
  };

  const handleDeleteAndReset = async () => {
    await deletePhotos();
    handleReset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* 히어로 섹션 */}
        {!generatedBlog && (
          <div className="text-center space-y-4 py-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-warm flex items-center justify-center shadow-card animate-float">
              <span className="text-4xl">📸</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              사진으로 <span className="text-gradient-warm">따뜻한 이야기</span>를 만들어보세요
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              활동 사진을 업로드하고 키워드를 입력하면,
              AI가 사진과 글이 어우러진 블로그 포스팅을 자동으로 작성해 드립니다.
            </p>
          </div>
        )}

        {/* 사진 업로더 (결과가 없을 때만 표시) */}
        {!generatedBlog && (
          <div className="space-y-4">
            <PhotoUploader
              photos={photos}
              onPhotosChange={setPhotos}
              isLoading={isLoading}
              maxPhotos={5}
            />

            {/* 에러 메시지 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 생성 버튼 */}
            {photos.length > 0 && (
              <Button
                variant="olive"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    사진 업로드 중...
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI가 글을 작성하고 있어요...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    블로그 글 생성하기
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* 생성된 결과 */}
        {generatedBlog && (
          <PhotoBlogResult
            title={generatedBlog.title}
            content={generatedBlog.content}
            hashtags={generatedBlog.hashtags}
            imageUrls={uploadedUrls}
            onReset={handleReset}
            onDeletePhotos={handleDeleteAndReset}
          />
        )}
      </main>

      {/* 푸터 */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>© 2025 studioori </p>
        <p className="mt-1">어르신의 하루를 따뜻하게 전합니다 💚</p>
      </footer>
    </div>
  );
};

export default Index;
