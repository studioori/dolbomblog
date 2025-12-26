import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PhotoUploader, { type PhotoItem } from '@/components/PhotoUploader';
import PhotoBlogResult from '@/components/PhotoBlogResult';
import RecentPostsList from '@/components/RecentPostsList';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePhotoBlog } from '@/hooks/usePhotoBlog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertCircle, ImageIcon, Lock } from 'lucide-react';

const Index = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, canGenerate, isLoading: authLoading, isAdmin } = useAuth();
  
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

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '서비스를 이용하려면 먼저 로그인해주세요.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // Admins bypass approval check
    if (!isAdmin && !profile?.is_active) {
      toast({
        title: '서비스 이용 불가',
        description: '관리자 승인 후 이용할 수 있습니다.',
        variant: 'destructive',
      });
      return;
    }

    // Admins bypass usage limit check
    if (!isAdmin && !canGenerate) {
      toast({
        title: '이용 횟수 초과',
        description: '이번 달 이용 횟수를 초과했습니다. 관리자에게 문의하세요.',
        variant: 'destructive',
      });
      return;
    }

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show inactive notice (not for admins)
  const showInactiveNotice = user && profile && !profile.is_active && !isAdmin;
  const showLimitReached = user && profile && profile.is_active && !canGenerate && !isAdmin;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {/* 비활성화 상태 안내 */}
        {showInactiveNotice && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              계정이 아직 승인되지 않았습니다. 관리자 승인 후 서비스를 이용할 수 있습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 사용량 초과 안내 */}
        {showLimitReached && (
          <Alert className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              이번 달 이용 횟수({profile.monthly_limit}회)를 모두 사용했습니다. 관리자에게 문의하세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 히어로 섹션 */}
        {!generatedBlog && (
          <div className="text-center space-y-4 sm:space-y-5 py-6 sm:py-8 animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-forest flex items-center justify-center shadow-elevated group cursor-default transition-all duration-500 hover:shadow-glow hover:scale-105 ring-4 ring-primary/10">
              <ImageIcon className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                사진으로 <span className="text-gradient-gold inline-block transition-transform duration-300 hover:scale-105">따뜻한 이야기</span>를 만들어보세요
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-4 sm:px-0">
                활동 사진을 업로드하고 키워드를 입력하면,<br className="hidden sm:block"/>
                AI가 사진과 글이 어우러진 블로그 포스팅을 자동으로 작성해 드립니다.
              </p>
              {profile && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{profile.center_name}</span> · 
                  이번 달 {profile.current_usage}/{profile.monthly_limit}회 사용
                </p>
              )}
            </div>
          </div>
        )}

        {/* 사진 업로더 */}
        {!generatedBlog && canGenerate && (
          <div className="space-y-5 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            <PhotoUploader
              photos={photos}
              onPhotosChange={setPhotos}
              isLoading={isLoading}
              maxPhotos={profile?.max_image_count || 5}
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
                  variant="forest"
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

        {/* 최근 생성된 글 목록 */}
        {!generatedBlog && (
          <RecentPostsList />
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
