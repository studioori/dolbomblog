/**
 * 건강정보 Q&A 결과 컴포넌트
 * 
 * AI가 다듬은 블로그 글을 네이버 블로그 스타일로 미리보기하고 복사하는 기능
 * Unsplash 이미지 추천 기능 포함 (2025-03-25 추가)
 * 
 * @lastUpdated 2025-03-25
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, RotateCcw, FileText, Lightbulb, Hash, ChevronDown, ChevronUp, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UnsplashImagePicker, { type UnsplashImage } from '@/components/UnsplashImagePicker';

// ============================================
// Types
// ============================================

interface HealthQAResultProps {
  title: string;
  content: string;
  hashtags: string[];
  keyPoints: string[];
  originalDraft?: string;
  onReset: () => void;
}

// ============================================
// Component
// ============================================

const HealthQAResult = ({
  title,
  content,
  hashtags,
  keyPoints,
  originalDraft,
  onReset,
}: HealthQAResultProps) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // 이미지 관련 상태 (2025-03-25 추가)
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  const { toast } = useToast();

  // 네이버 블로그용 HTML 복사
  const copyAsHtml = async () => {
    try {
      // HTML 포맷으로 변환
      let html = `<h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1a1a1a;">${title}</h2>\n\n`;
      
      // 선택된 이미지가 있으면 본문 앞에 추가 (2025-03-25 추가)
      if (selectedImage) {
        html += `<div style="margin-bottom: 24px;">\n`;
        html += `<img src="${selectedImage.urls.regular}" alt="${selectedImage.alt_description || '블로그 이미지'}" style="width: 100%; max-width: 800px; border-radius: 8px; margin-bottom: 8px;" />\n`;
        html += `<p style="font-size: 12px; color: #888; text-align: right;">Photo by <a href="${selectedImage.user.links.html}?utm_source=mediblog&utm_medium=referral" target="_blank" style="color: #888;">${selectedImage.user.name}</a> on <a href="https://unsplash.com/?utm_source=mediblog&utm_medium=referral" target="_blank" style="color: #888;">Unsplash</a></p>\n`;
        html += `</div>\n\n`;
      }
      
      // 본문을 문단별로 변환
      const paragraphs = content.split('\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        // 소제목 체크 (## 로 시작)
        if (paragraph.startsWith('## ')) {
          const heading = paragraph.replace('## ', '');
          html += `<h3 style="font-size: 18px; font-weight: bold; margin: 24px 0 12px 0; color: #333;">${heading}</h3>\n`;
        } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          // Bold 텍스트
          const boldText = paragraph.replace(/\*\*/g, '');
          html += `<p style="font-size: 16px; line-height: 1.8; margin-bottom: 16px; color: #333;"><strong>${boldText}</strong></p>\n`;
        } else {
          html += `<p style="font-size: 16px; line-height: 1.8; margin-bottom: 16px; color: #333;">${paragraph}</p>\n`;
        }
      });

      // 핵심 포인트 추가
      if (keyPoints && keyPoints.length > 0) {
        html += `\n<div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">\n`;
        html += `<p style="font-size: 14px; font-weight: bold; margin-bottom: 12px; color: #666;">📌 핵심 포인트</p>\n`;
        html += `<ul style="margin: 0; padding-left: 20px;">\n`;
        keyPoints.forEach(point => {
          html += `<li style="font-size: 14px; line-height: 1.6; margin-bottom: 8px; color: #444;">${point}</li>\n`;
        });
        html += `</ul>\n</div>\n`;
      }

      // 해시태그 추가
      html += `\n<p style="margin-top: 24px; color: #03C75A;">${hashtags.join(' ')}</p>`;

      // 클립보드에 HTML과 텍스트 모두 복사
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([`${title}\n\n${content}\n\n📌 핵심 포인트\n${keyPoints.map(p => `- ${p}`).join('\n')}\n\n${hashtags.join(' ')}`], { type: 'text/plain' })
      });

      await navigator.clipboard.write([clipboardItem]);

      setCopied(true);
      toast({
        title: '네이버 블로그용 HTML 복사 완료! 🎉',
        description: '네이버 블로그 에디터에 붙여넣기하세요.',
      });
      setTimeout(() => setCopied(false), 3000);

    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: '복사 실패',
        description: '복사 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  // 본문 포맷팅 (소제목, bold 처리)
  const formatContent = (text: string) => {
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, idx) => {
      // 소제목 체크 (## 로 시작)
      if (paragraph.startsWith('## ')) {
        const heading = paragraph.replace('## ', '');
        return (
          <h3
            key={idx}
            className="font-bold mt-8 mb-4 text-lg"
            style={{ color: '#333' }}
          >
            {heading}
          </h3>
        );
      }
      
      // Bold 텍스트 처리
      const boldRegex = /\*\*([^*]+)\*\*/g;
      if (boldRegex.test(paragraph)) {
        const parts = paragraph.split(boldRegex);
        return (
          <p
            key={idx}
            className="mb-6"
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333333',
            }}
          >
            {parts.map((part, partIdx) =>
              partIdx % 2 === 1 ? (
                <strong key={partIdx} className="font-semibold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      // 일반 텍스트
      return (
        <p
          key={idx}
          className="mb-6"
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#333333',
          }}
        >
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="w-full animate-fade-in space-y-6">
      {/* 핵심 포인트 카드 */}
      {keyPoints && keyPoints.length > 0 && (
        <Card className="border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              핵심 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-foreground/80 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 이미지 추천 섹션 (2025-03-25 추가) */}
      <Card className="border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            블로그 이미지 추천
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedImage ? (
            <div className="space-y-3">
              {/* 선택된 이미지 미리보기 */}
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={selectedImage.urls.small}
                  alt={selectedImage.alt_description || '선택된 이미지'}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                📸 {selectedImage.user.name} / Unsplash
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImagePicker(true)}
                  className="flex-1"
                >
                  다른 이미지 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  이미지 제거
                </Button>
              </div>
            </div>
          ) : showImagePicker ? (
            <div className="space-y-3">
              <UnsplashImagePicker
                title={title}
                content={content}
                onImageSelect={(image) => {
                  setSelectedImage(image);
                  setShowImagePicker(false);
                }}
                selectedImageId={selectedImage?.id}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImagePicker(false)}
                className="w-full"
              >
                취소
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                블로그에 어울리는 이미지를 찾아보세요
              </p>
              <Button
                variant="outline"
                onClick={() => setShowImagePicker(true)}
              >
                이미지 검색하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 네이버 블로그 스타일 미리보기 */}
      <article
        className="mx-auto bg-white shadow-lg border border-gray-200"
        style={{
          maxWidth: '800px',
          fontFamily: "'Nanum Gothic', 'Malgun Gothic', sans-serif",
        }}
      >
        {/* 블로그 헤더 바 */}
        <div className="bg-gradient-to-r from-[#03C75A] to-[#00B843] px-6 py-3">
          <span className="text-white text-xs font-medium tracking-wide">
            📝 네이버 블로그 미리보기
          </span>
        </div>

        {/* 콘텐츠 영역 */}
        <div
          className="px-5 sm:px-10 py-10"
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#333333',
            wordBreak: 'keep-all',
          }}
        >
          {/* 제목 */}
          <h1
            className="font-bold mb-8 pb-4 border-b-2 border-[#03C75A]"
            style={{
              fontSize: '24px',
              lineHeight: '1.4',
              color: '#1a1a1a',
            }}
          >
            {title}
          </h1>

          {/* 선택된 이미지 표시 (2025-03-25 추가) */}
          {selectedImage && (
            <div className="mb-8">
              <img
                src={selectedImage.urls.regular}
                alt={selectedImage.alt_description || '블로그 이미지'}
                className="w-full rounded-lg"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
              <p className="text-xs text-gray-400 text-right mt-2">
                📸 Photo by{' '}
                <a
                  href={selectedImage.user.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {selectedImage.user.name}
                </a>{' '}
                on Unsplash
              </p>
            </div>
          )}

          {/* 본문 */}
          <div className="space-y-0">
            {formatContent(content)}
          </div>

          {/* 해시태그 */}
          <div
            className="mt-10 pt-6 border-t border-gray-200"
            style={{ color: '#03C75A' }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Hash className="w-4 h-4" />
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm hover:underline cursor-pointer"
                  style={{ color: '#03C75A' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* 원문 초안 보기 (토글) */}
      {originalDraft && (
        <Card className="border-border/60 shadow-soft max-w-[800px] mx-auto">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">원장님 원문 초안 보기</span>
            </div>
            {showOriginal ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {showOriginal && (
            <CardContent className="pt-0 border-t">
              <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {originalDraft}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="max-w-[800px] mx-auto px-4 flex gap-3">
        <Button
          variant="forest"
          className="flex-1 h-12 text-base font-medium"
          onClick={copyAsHtml}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              네이버 블로그용 복사하기
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="h-12 px-6 font-medium"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          새 글 작성
        </Button>
      </div>

      {/* 도움말 */}
      <div className="max-w-[800px] mx-auto text-center text-xs text-muted-foreground space-y-1">
        <p>💡 네이버 블로그 에디터에서 Ctrl+V (또는 Cmd+V)로 붙여넣기 하세요.</p>
        <p>📋 HTML 형식으로 복사되어 서식이 그대로 유지됩니다.</p>
      </div>
    </div>
  );
};

export default HealthQAResult;
