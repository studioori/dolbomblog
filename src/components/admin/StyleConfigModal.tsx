import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, FileText, PenTool, FlaskConical, Sparkles, Copy, Check, Dna, MessageSquareText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import PhotoUploader, { PhotoItem } from '@/components/PhotoUploader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StyleConfig {
  styleReferenceText: string;
  customPrompt: string;
}

interface StyleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName: string;
  region?: string;
  maxImageCount: number;
  initialConfig: StyleConfig;
  onSave: (config: StyleConfig) => Promise<void>;
}

const defaultConfig: StyleConfig = {
  styleReferenceText: '',
  customPrompt: '',
};

const StyleConfigModal = ({ 
  isOpen, 
  onClose, 
  centerName, 
  region = '',
  maxImageCount,
  initialConfig, 
  onSave 
}: StyleConfigModalProps) => {
  const [config, setConfig] = useState<StyleConfig>({ ...defaultConfig, ...initialConfig });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Test generation state
  const [testPhotos, setTestPhotos] = useState<PhotoItem[]>([]);
  const [isTestGenerating, setIsTestGenerating] = useState(false);
  const [testResult, setTestResult] = useState<{ text: string; images: string[] } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      toast.success('스타일 설정이 저장되었습니다');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyResult = async () => {
    if (!testResult) return;
    await navigator.clipboard.writeText(testResult.text);
    setCopied(true);
    toast.success('클립보드에 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  };

  // 이미지 플레이스홀더를 실제 이미지로 치환하여 렌더링
  const renderTestResultWithImages = () => {
    if (!testResult) return null;
    
    const { text, images } = testResult;
    
    // Guard: 이미지가 없으면 텍스트만 반환
    if (!images || images.length === 0) {
      return <span>{text}</span>;
    }
    
    // 이미지 플레이스홀더 패턴들을 마커로 치환
    let processedText = text;
    images.forEach((_, index) => {
      const patterns = [
        `[사진 ${index + 1}]`,
        `(사진 ${index + 1})`,
        `[이미지 ${index + 1}]`,
        `[IMAGE_PLACEHOLDER_${index + 1}]`,
        `(사진${index + 1})`,
        `[사진${index + 1}]`,
      ];
      patterns.forEach(pattern => {
        processedText = processedText.split(pattern).join(`__IMG_MARKER_${index}__`);
      });
    });
    
    // 마커를 기준으로 분할하여 텍스트와 이미지를 번갈아 렌더링
    const parts = processedText.split(/__IMG_MARKER_(\d+)__/);
    
    return parts.map((part, i) => {
      // 홀수 인덱스는 이미지 인덱스 번호
      if (i % 2 === 1) {
        const imgIndex = parseInt(part);
        if (images[imgIndex]) {
          return (
            <img 
              key={`img-${i}`} 
              src={images[imgIndex]} 
              alt={`사진 ${imgIndex + 1}`}
              className="max-w-full h-auto rounded-lg my-3 mx-auto block shadow-soft"
            />
          );
        }
        return null;
      }
      // 짝수 인덱스는 텍스트
      return <span key={`text-${i}`}>{part}</span>;
    });
  };

  const handleTestGenerate = async () => {
    if (testPhotos.length === 0) {
      toast.error('테스트할 사진을 먼저 업로드해주세요');
      return;
    }

    setIsTestGenerating(true);
    setTestResult(null);

    try {
      // Upload photos to storage and get URLs
      const uploadedPhotos = await Promise.all(
        testPhotos.map(async (photo, index) => {
          const fileName = `test-${Date.now()}-${index}.jpg`;
          const filePath = `test/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('daily-photos')
            .upload(filePath, photo.file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('daily-photos')
            .getPublicUrl(filePath);

          return {
            imageUrl: urlData.publicUrl,
            keyword: photo.keyword || `사진 ${index + 1}`,
          };
        })
      );

      // Call the edge function with current config
      const { data, error } = await supabase.functions.invoke('generate-blog-vision', {
        body: {
          photos: uploadedPhotos,
          centerName,
          region,
          styleConfig: config,
        },
      });

      if (error) throw error;

      // Format the result with image URLs
      const formattedResult = `📌 제목: ${data.title}\n\n${data.content}\n\n${data.hashtags?.join(' ') || ''}`;
      setTestResult({
        text: formattedResult,
        images: uploadedPhotos.map(p => p.imageUrl),
      });
      toast.success('테스트 글 생성 완료!');

      // Cleanup test photos from storage
      const filePaths = testPhotos.map((_, index) => `test/test-${Date.now()}-${index}.jpg`);
      await supabase.storage.from('daily-photos').remove(filePaths);

    } catch (error) {
      console.error('Test generation error:', error);
      toast.error('테스트 생성 중 오류가 발생했습니다');
    } finally {
      setIsTestGenerating(false);
    }
  };

  const handleClose = () => {
    // Cleanup previews
    testPhotos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setTestPhotos([]);
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] w-[calc(100vw-2rem)] sm:w-full flex flex-col overflow-hidden bg-gradient-to-b from-background to-accent/30 border-border/50 shadow-elevated">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">AI 글쓰기 스타일 설정</span>
              <Badge variant="secondary" className="mt-1 text-xs font-normal">
                {centerName}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {centerName}의 블로그 글 스타일을 설정합니다
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-5 py-5">
            {/* Section A: Style DNA (Reference Text) */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-soft transition-all duration-300 hover:shadow-card hover:border-primary/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-secondary" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Dna className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      스타일 DNA
                      <Badge variant="outline" className="text-[10px] font-normal text-primary border-primary/30">
                        핵심
                      </Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      모방할 예시 글을 붙여넣으세요
                    </p>
                  </div>
                </div>
                <Textarea
                  value={config.styleReferenceText}
                  onChange={(e) => setConfig({ ...config, styleReferenceText: e.target.value })}
                  placeholder="AI가 흉내 내기를 원하는 블로그 글 본문을 통째로 붙여넣으세요.

예시:
안녕하세요~ 정성과 실력의 OO치과입니다! 🦷
오늘도 환자분들의 건강한 미소를 위해 최선을 다하고 있어요.
편안한 진료, 꼼꼼한 상담으로 여러분을 모시겠습니다..."
                  rows={8}
                  className="resize-none text-sm bg-background/50 border-border/50 focus:bg-background transition-colors duration-200"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  AI가 문체, 호흡, 구성 방식을 자동으로 분석하여 적용합니다
                </div>
              </div>
            </div>

            {/* Section B: Custom Instructions */}
            <div className="group relative overflow-hidden rounded-2xl border border-secondary/20 bg-card shadow-soft transition-all duration-300 hover:shadow-card hover:border-secondary/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-secondary/80 to-primary" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <MessageSquareText className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      관리자 지시사항
                      <Badge variant="outline" className="text-[10px] font-normal text-secondary border-secondary/30">
                        선택
                      </Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      추가 요청사항을 자유롭게 입력하세요
                    </p>
                  </div>
                </div>
                <Textarea
                  value={config.customPrompt}
                  onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                  placeholder="전화번호, 필수 해시태그, 또는 특별히 주의해야 할 점 등을 자유롭게 적어주세요.

예시:
- 글 마지막에 항상 '상담 문의: 02-1234-5678' 넣기
- #OO동치과 해시태그 필수 포함
- '환자분'이라는 표현 사용, 친근하고 전문적인 톤 유지"
                  rows={5}
                  className="resize-none text-sm bg-background/50 border-border/50 focus:bg-background transition-colors duration-200"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <PenTool className="w-3.5 h-3.5 text-secondary" />
                  여기에 적은 내용은 AI가 글 작성 시 엄격히 따릅니다
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section C: Test Generation */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft transition-all duration-300 hover:shadow-card">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted-foreground/30 via-muted-foreground/50 to-muted-foreground/30" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <FlaskConical className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                      스타일 테스트
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        최대 {maxImageCount}장
                      </Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      위 설정으로 실제 글 생성 결과를 미리 확인해보세요
                    </p>
                  </div>
                </div>

                <PhotoUploader
                  photos={testPhotos}
                  onPhotosChange={setTestPhotos}
                  isLoading={isTestGenerating}
                  maxPhotos={maxImageCount}
                />

                <Button
                  onClick={handleTestGenerate}
                  disabled={isTestGenerating || testPhotos.length === 0}
                  variant="secondary"
                  className="w-full h-11 text-sm font-medium shadow-soft hover:shadow-card transition-all duration-300"
                >
                  {isTestGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI가 글을 작성하고 있습니다...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      현재 설정으로 테스트 생성
                    </>
                  )}
                </Button>

                {/* Test Result */}
                {testResult && (
                  <div className="relative mt-4 p-4 rounded-xl bg-gradient-to-br from-background to-accent/20 border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        생성된 테스트 글
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResult}
                        className="h-8 px-3 text-xs hover:bg-primary/10"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            복사
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2">
                      <div className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
                        {renderTestResultWithImages()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t border-border/50 flex-shrink-0 gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 sm:flex-none h-11 border-border/50 hover:bg-muted/50"
          >
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex-1 sm:flex-none h-11 bg-primary hover:bg-primary/90 shadow-soft hover:shadow-card transition-all duration-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                스타일 저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StyleConfigModal;
