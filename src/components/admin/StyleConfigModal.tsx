import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, FileText, PenTool } from 'lucide-react';

export interface StyleConfig {
  styleReferenceText: string;
  customPrompt: string;
}

interface StyleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName: string;
  initialConfig: StyleConfig;
  onSave: (config: StyleConfig) => Promise<void>;
}

const defaultConfig: StyleConfig = {
  styleReferenceText: '',
  customPrompt: '',
};

const StyleConfigModal = ({ isOpen, onClose, centerName, initialConfig, onSave }: StyleConfigModalProps) => {
  const [config, setConfig] = useState<StyleConfig>({ ...defaultConfig, ...initialConfig });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-full flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            AI 글쓰기 스타일 설정
          </DialogTitle>
          <DialogDescription>
            {centerName}의 블로그 글 스타일을 설정합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1">
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
              rows={10}
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
              rows={6}
              className="resize-none text-sm"
            />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 여기에 적은 내용은 AI가 글 작성 시 엄격히 따릅니다.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
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
