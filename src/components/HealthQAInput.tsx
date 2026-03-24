/**
 * 건강정보 Q&A 입력 컴포넌트
 * 
 * 원장님이 작성한 Q&A 초안을 입력받아 AI가 블로그용으로 다듬어주는 입력 폼
 * 
 * @lastUpdated 2025-03-24
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, FileText, Info } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface HealthQAInputData {
  draft: string;
  style: string;
  contentLength: string;
}

interface HealthQAInputProps {
  onSubmit: (data: HealthQAInputData) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// ============================================
// Constants
// ============================================

// 글쓰기 스타일 옵션
const STYLE_OPTIONS = [
  {
    value: 'friendly_expert',
    label: '💝 친근한 전문가',
    description: '따뜻하고 전문적인 톤, ~해요 체',
  },
  {
    value: 'fun_casual',
    label: '🎉 재미있고 유쾌한',
    description: '밈/유머 요소, 짧은 문장',
  },
  {
    value: 'calm_professional',
    label: '🩺 차분하고 신뢰감',
    description: '격식체, 근거 중심',
  },
];

// 글 길이 옵션
const LENGTH_OPTIONS = [
  {
    value: 'short',
    label: '간결하게',
    description: '약 600자',
  },
  {
    value: 'medium',
    label: '보통',
    description: '약 900자',
  },
  {
    value: 'long',
    label: '자세하게',
    description: '약 1200자',
  },
];

// 최소 입력 글자수
const MIN_DRAFT_LENGTH = 100;

// ============================================
// Component
// ============================================

const HealthQAInput = ({ onSubmit, isLoading = false, disabled = false }: HealthQAInputProps) => {
  const [draft, setDraft] = useState('');
  const [style, setStyle] = useState('friendly_expert');
  const [contentLength, setContentLength] = useState('medium');
  const [error, setError] = useState<string | null>(null);

  // 글자수 카운트
  const charCount = draft.length;
  const isValidLength = charCount >= MIN_DRAFT_LENGTH;

  // 제출 핸들러
  const handleSubmit = () => {
    setError(null);

    // 입력 검증
    if (!draft.trim()) {
      setError('초안 내용을 입력해주세요.');
      return;
    }

    if (charCount < MIN_DRAFT_LENGTH) {
      setError(`최소 ${MIN_DRAFT_LENGTH}자 이상 입력해주세요. (현재 ${charCount}자)`);
      return;
    }

    // 부모 컴포넌트로 데이터 전달
    onSubmit({
      draft: draft.trim(),
      style,
      contentLength,
    });
  };

  const isDisabled = isLoading || disabled;

  return (
    <div className="space-y-6">
      {/* 초안 입력 카드 */}
      <Card className="border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Q&A 초안 입력
          </CardTitle>
          <CardDescription>
            원장님이 작성하신 Q&A 초안(질문+답변)을 붙여넣으세요. AI가 블로그용으로 다듬어드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 텍스트에리어 */}
          <div className="space-y-2">
            <Textarea
              placeholder={`예시:\n\nQ: 임플란트 수명은 얼마나 되나요?\n\nA: 임플란트의 수명은 환자분의 관리 상태에 따라 다릅니다. 일반적으로 10~15년 이상 사용하시는 분들도 많습니다. 정기적인 검진과 올바른 구강 관리가 중요합니다.\n\n관리 방법:\n- 정기 검진 (6개월~1년)\n- 올바른 양치질\n- 치실 사용\n- 금연 권장`}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              disabled={isDisabled}
              className="min-h-[240px] text-sm leading-relaxed resize-y transition-all duration-200 focus:shadow-soft"
            />
            
            {/* 글자수 표시 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  최소 {MIN_DRAFT_LENGTH}자 이상 입력
                </span>
              </div>
              <span className={`font-medium transition-colors duration-200 ${
                isValidLength 
                  ? 'text-green-600 dark:text-green-400' 
                  : charCount > 0 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-muted-foreground'
              }`}>
                {charCount}자
              </span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 스타일 설정 카드 */}
      <Card className="border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">글쓰기 스타일</CardTitle>
          <CardDescription>
            블로그 글의 톤앤매너를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={style}
            onValueChange={setStyle}
            disabled={isDisabled}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {STYLE_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  style === option.value
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 길이 설정 카드 */}
      <Card className="border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">글 길이</CardTitle>
          <CardDescription>
            블로그 글의 길이를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={contentLength}
            onValueChange={setContentLength}
            disabled={isDisabled}
            className="grid grid-cols-3 gap-3"
          >
            {LENGTH_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  contentLength === option.value
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <Button
        onClick={handleSubmit}
        disabled={isDisabled || !isValidLength}
        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-soft hover:shadow-elevated transition-all duration-300 disabled:opacity-50"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            블로그 글로 다듬는 중...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            블로그 글로 다듬기
          </>
        )}
      </Button>

      {/* 도움말 */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>💡 팁: 질문과 답변을 명확하게 구분해서 적어주시면 더 좋은 결과를 얻을 수 있어요.</p>
        <p>⚠️ 의료법 규정에 따라 "완치", "100%", "최고" 등의 표현은 자동으로 수정됩니다.</p>
      </div>
    </div>
  );
};

export default HealthQAInput;
