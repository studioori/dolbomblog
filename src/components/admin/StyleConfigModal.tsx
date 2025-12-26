import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Palette, Sparkles, MessageSquare, Ban, PenTool } from 'lucide-react';

export interface StyleConfig {
  tone: 'warm' | 'energetic' | 'professional';
  emojiFrequency: 'minimal' | 'moderate' | 'plentiful';
  requiredKeywords: string[];
  forbiddenWords: string[];
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
  tone: 'warm',
  emojiFrequency: 'moderate',
  requiredKeywords: [],
  forbiddenWords: [],
  customPrompt: '',
};

const StyleConfigModal = ({ isOpen, onClose, centerName, initialConfig, onSave }: StyleConfigModalProps) => {
  const [config, setConfig] = useState<StyleConfig>({ ...defaultConfig, ...initialConfig });
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newForbiddenWord, setNewForbiddenWord] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !config.requiredKeywords.includes(newKeyword.trim())) {
      setConfig({
        ...config,
        requiredKeywords: [...config.requiredKeywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setConfig({
      ...config,
      requiredKeywords: config.requiredKeywords.filter(k => k !== keyword),
    });
  };

  const addForbiddenWord = () => {
    if (newForbiddenWord.trim() && !config.forbiddenWords.includes(newForbiddenWord.trim())) {
      setConfig({
        ...config,
        forbiddenWords: [...config.forbiddenWords, newForbiddenWord.trim()],
      });
      setNewForbiddenWord('');
    }
  };

  const removeForbiddenWord = (word: string) => {
    setConfig({
      ...config,
      forbiddenWords: config.forbiddenWords.filter(w => w !== word),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            AI 글쓰기 스타일 상세 설정
          </DialogTitle>
          <DialogDescription>
            {centerName}의 블로그 글 스타일을 세밀하게 조정합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tone Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <MessageSquare className="w-4 h-4" />
              톤앤매너 (Tone)
            </Label>
            <Select 
              value={config.tone} 
              onValueChange={(value: 'warm' | 'energetic' | 'professional') => 
                setConfig({ ...config, tone: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warm">🌿 따뜻하고 차분한 (기본)</SelectItem>
                <SelectItem value="energetic">⚡ 활기차고 에너지 넘치는</SelectItem>
                <SelectItem value="professional">💼 전문적이고 신뢰감 있는</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              글의 전반적인 분위기와 어조를 결정합니다
            </p>
          </div>

          {/* Emoji Frequency */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="w-4 h-4" />
              이모지 사용 빈도
            </Label>
            <RadioGroup
              value={config.emojiFrequency}
              onValueChange={(value: 'minimal' | 'moderate' | 'plentiful') =>
                setConfig({ ...config, emojiFrequency: value })
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="minimal" id="emoji-minimal" />
                <Label htmlFor="emoji-minimal" className="cursor-pointer flex-1">
                  <span className="font-medium">최소화</span>
                  <span className="text-sm text-muted-foreground ml-2">거의 안 씀 (제목에만 1개)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="moderate" id="emoji-moderate" />
                <Label htmlFor="emoji-moderate" className="cursor-pointer flex-1">
                  <span className="font-medium">적당히</span>
                  <span className="text-sm text-muted-foreground ml-2">문단 끝에만 배치</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="plentiful" id="emoji-plentiful" />
                <Label htmlFor="emoji-plentiful" className="cursor-pointer flex-1">
                  <span className="font-medium">풍부하게</span>
                  <span className="text-sm text-muted-foreground ml-2">중간중간 자연스럽게 포함</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Required Keywords */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <PenTool className="w-4 h-4" />
              필수 포함 키워드
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="예: #치매예방, 존중"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                추가
              </Button>
            </div>
            {config.requiredKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.requiredKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1 pr-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              글 작성 시 꼭 포함되어야 할 단어나 해시태그
            </p>
          </div>

          {/* Forbidden Words */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
              <Ban className="w-4 h-4" />
              금지어 설정
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="예: 노인네, 치매노인"
                value={newForbiddenWord}
                onChange={(e) => setNewForbiddenWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addForbiddenWord())}
              />
              <Button type="button" variant="outline" onClick={addForbiddenWord}>
                추가
              </Button>
            </div>
            {config.forbiddenWords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.forbiddenWords.map((word) => (
                  <Badge key={word} variant="destructive" className="gap-1 pr-1">
                    {word}
                    <button
                      type="button"
                      onClick={() => removeForbiddenWord(word)}
                      className="ml-1 hover:bg-red-700 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              절대 사용하면 안 되는 비하 표현이나 부적절한 단어
            </p>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="flex items-center gap-2 text-base font-semibold">
              📝 고급 프롬프트 (Custom Prompt)
            </Label>
            <Textarea
              value={config.customPrompt}
              onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
              placeholder="위의 옵션으로 커버되지 않는 특별 지침을 적어주세요...

예: 
- 문장 끝에 '~랍니다', '~이지요' 같은 정중한 어미 사용
- 각 활동의 의학적/전문적 효과를 언급
- 어르신 성함 대신 '어르신', '어른신분' 등으로 표현"
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              세부적인 글쓰기 스타일 지침을 자유롭게 작성하세요
            </p>
          </div>
        </div>

        <DialogFooter>
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
