import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, FileText, PenTool, FlaskConical, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  
  // Test generation state
  const [testPhotos, setTestPhotos] = useState<PhotoItem[]>([]);
  const [isTestGenerating, setIsTestGenerating] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

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

      // Format the result
      const formattedResult = `📌 제목: ${data.title}\n\n${data.content}\n\n${data.hashtags?.join(' ') || ''}`;
      setTestResult(formattedResult);
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
      <DialogContent className="max-w-3xl h-[90vh] w-[calc(100vw-2rem)] sm:w-full flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            AI 글쓰기 스타일 설정
          </DialogTitle>
          <DialogDescription>
            {centerName}의 블로그 글 스타일을 설정합니다
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-6 py-4">
            {/* Section A: Style DNA (Reference Text) */}
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <Label className="text-base font-semibold text-purple-900 dark:text-purple-100">
                  🧬 스타일 DNA (Reference Text)
                </Label>
              </div>
              <Textarea
                value={config.styleReferenceText}
                onChange={(e) => setConfig({ ...config, styleReferenceText: e.target.value })}
                placeholder="AI가 흉내 내기를 원하는 블로그 글 본문을 통째로 붙여넣으세요.

예시:
안녕하세요~ 사랑과 정성의 OO주야간보호센터입니다! 🌸
오늘 하루도 어르신들의 밝은 웃음소리로 가득했답니다.
아침부터 불어오는 봄바람이 참 좋았는데요..."
                rows={8}
                className="resize-none text-sm"
              />
              <p className="text-xs text-purple-600 dark:text-purple-400">
                💡 AI가 이 글의 문체, 호흡, 구성 방식을 스스로 분석하여 적용합니다.
              </p>
            </div>

            {/* Section B: Custom Instructions */}
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-600" />
                <Label className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  ✍️ 관리자 지시사항 (Custom Instructions)
                </Label>
              </div>
              <Textarea
                value={config.customPrompt}
                onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                placeholder="전화번호, 필수 해시태그, 또는 특별히 주의해야 할 점 등을 자유롭게 적어주세요.

예시:
- 글 마지막에 항상 '상담 문의: 010-1234-5678' 넣기
- #OO동노인돌봄 해시태그 필수 포함
- '어르신'이라는 표현 대신 '어른신분'으로 통일"
                rows={5}
                className="resize-none text-sm"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 여기에 적은 내용은 AI가 글 작성 시 엄격히 따릅니다.
              </p>
            </div>

            <Separator />

            {/* Section C: Test Generation */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                <Label className="text-base font-semibold text-amber-900 dark:text-amber-100">
                  🧪 테스트용 사진 업로드 (최대 {maxImageCount}장)
                </Label>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                위 스타일 설정으로 실제 글 생성 결과를 미리 확인해보세요. (저장 없이 테스트만 수행)
              </p>

              <PhotoUploader
                photos={testPhotos}
                onPhotosChange={setTestPhotos}
                isLoading={isTestGenerating}
                maxPhotos={maxImageCount}
              />

              <Button
                onClick={handleTestGenerate}
                disabled={isTestGenerating || testPhotos.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isTestGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    테스트 글 생성 중...
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
                <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700">
                  <Label className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2 block">
                    📝 생성된 테스트 글
                  </Label>
                  <div className="text-sm whitespace-pre-wrap text-foreground max-h-60 overflow-y-auto">
                    {testResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '스타일 저장'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StyleConfigModal;
