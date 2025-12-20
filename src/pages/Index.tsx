import { useState } from 'react';
import Header from '@/components/Header';
import PhotoUploader, { type PhotoItem } from '@/components/PhotoUploader';
import PhotoBlogResult from '@/components/PhotoBlogResult';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePhotoBlog } from '@/hooks/usePhotoBlog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertCircle, ImageIcon } from 'lucide-react';

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
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        {/* 히어로 섹션 */}
        {!generatedBlog && (
          <div className="text-center space-y-5 py-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-warm flex items-center justify-center shadow-elevated animate-bounce-soft group cursor-default transition-all duration-300 hover:shadow-hover hover:scale-105">
              <ImageIcon className="w-9 h-9 text-primary-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                사진으로 <span className="text-gradient-warm inline-block transition-transform duration-300 hover:scale-105">따뜻한 이야기</span>를 만들어보세요
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                활동 사진을 업로드하고 키워드를 입력하면,<br/>
                AI가 사진과 글이 어우러진 블로그 포스팅을 자동으로 작성해 드립니다.
              </p>
            </div>
          </div>
        )}

        {/* 사진 업로더 */}
        {!generatedBlog && (
          <div className="space-y-5 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            <PhotoUploader
              photos={photos}
              onPhotosChange={setPhotos}
              isLoading={isLoading}
              maxPhotos={5}
            />

            {/* 에러 메시지 */}
            {error && (
              <Alert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 생성 버튼 */}
            {photos.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Button
                  variant="sage"
                  size="xl"
                  className="w-full group relative overflow-hidden"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center gap-2">
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
                        <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                        블로그 글 생성하기
                      </>
                    )}
                  </span>
                  {!isLoading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 생성된 결과 */}
        {generatedBlog && (
          <div className="animate-fade-in">
            <PhotoBlogResult
              title={generatedBlog.title}
              content={generatedBlog.content}
              hashtags={generatedBlog.hashtags}
              imageUrls={uploadedUrls}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="py-10 text-center text-sm text-muted-foreground border-t border-border/30 transition-colors duration-300 hover:border-border/50">
        <p className="font-medium transition-colors duration-200 hover:text-foreground/80">© 2025 studioori</p>
        <p className="mt-1.5 text-muted-foreground/80">어르신의 하루를 따뜻하게 전합니다 💚</p>
      </footer>
    </div>
  );
};

export default Index;