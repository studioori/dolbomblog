import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, RotateCcw, FileText, Hash, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResultImageBlur from './ResultImageBlur';

interface PhotoBlogResultProps {
  title: string;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  imagePaths: string[];
  onReset: () => void;
  onDeletePhotos: () => Promise<void>;
  onImageUrlUpdate: (index: number, newUrl: string) => void;
}

const PhotoBlogResult = ({ 
  title, 
  content, 
  hashtags, 
  imageUrls,
  imagePaths,
  onReset, 
  onDeletePhotos,
  onImageUrlUpdate
}: PhotoBlogResultProps) => {
  const [copied, setCopied] = useState<'all' | 'html' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Parse content and split by image placeholders
  const renderContentWithInteractiveImages = () => {
    const parts: Array<{ type: 'text' | 'image'; content: string; index?: number }> = [];
    
    let remainingContent = content;
    const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
    let lastIndex = 0;
    let match;

    // Reset regex
    placeholderRegex.lastIndex = 0;

    while ((match = placeholderRegex.exec(content)) !== null) {
      // Add text before this placeholder
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add image placeholder
      const imageIndex = parseInt(match[1]) - 1;
      if (imageIndex >= 0 && imageIndex < imageUrls.length) {
        parts.push({
          type: 'image',
          content: imageUrls[imageIndex],
          index: imageIndex
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  };

  const getHtmlContent = () => {
    let html = `<h2>${title}</h2>\n\n`;
    
    let processedContent = content;
    imageUrls.forEach((url, index) => {
      const placeholder = `[IMAGE_PLACEHOLDER_${index + 1}]`;
      // Remove cache-busting query param for final URL
      const cleanUrl = url.split('?')[0];
      processedContent = processedContent.replace(
        placeholder,
        `\n<img src="${cleanUrl}" alt="활동 사진 ${index + 1}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`
      );
    });
    
    // Handle remaining placeholders
    const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
    processedContent = processedContent.replace(placeholderRegex, (match, num) => {
      const idx = parseInt(num) - 1;
      if (idx >= 0 && idx < imageUrls.length) {
        const cleanUrl = imageUrls[idx].split('?')[0];
        return `\n<img src="${cleanUrl}" alt="활동 사진 ${num}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`;
      }
      return '';
    });
    
    // Convert line breaks to <br> for HTML
    html += processedContent.split('\n').map(line => `<p>${line}</p>`).join('\n');
    html += `\n\n<p>${hashtags.join(' ')}</p>`;
    
    return html;
  };

  const copyAsHtml = async () => {
    try {
      const htmlContent = getHtmlContent();
      
      // Copy as rich text (HTML) for Naver blog
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([`${title}\n\n${content}\n\n${hashtags.join(' ')}`], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopied('html');
      toast({
        title: '네이버 블로그용 복사 완료! 🎉',
        description: '네이버 블로그 에디터에 붙여넣기하면 사진까지 함께 들어갑니다.',
      });
      setTimeout(() => setCopied(null), 3000);
    } catch (err) {
      // Fallback to plain text
      const plainText = `${title}\n\n${content}\n\n${hashtags.join(' ')}`;
      await navigator.clipboard.writeText(plainText);
      setCopied('all');
      toast({
        title: '텍스트로 복사됨',
        description: '브라우저 제한으로 HTML 복사가 불가합니다. 텍스트만 복사되었습니다.',
        variant: 'default',
      });
      setTimeout(() => setCopied(null), 3000);
    }
  };

  const handleDeletePhotos = async () => {
    setIsDeleting(true);
    try {
      await onDeletePhotos();
      toast({
        title: '이미지 삭제 완료! 🗑️',
        description: '업로드된 이미지가 모두 삭제되었습니다. 새 글을 쓰시려면 새로고침하세요.',
      });
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: '이미지 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const contentParts = renderContentWithInteractiveImages();

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              생성된 글 (사진 클릭하여 추가 블러 가능)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">제목</span>
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
            </div>
          </div>

          <Separator />

          {/* 본문 (인터랙티브 이미지 포함) */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              본문 미리보기 (이미지를 클릭하면 블러 처리됩니다)
            </span>
            <div className="p-4 rounded-lg bg-card border border-border max-h-[600px] overflow-y-auto">
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                {contentParts.map((part, idx) => {
                  if (part.type === 'text') {
                    return (
                      <div 
                        key={idx}
                        dangerouslySetInnerHTML={{ 
                          __html: part.content.replace(/\n/g, '<br />') 
                        }}
                      />
                    );
                  } else if (part.type === 'image' && part.index !== undefined) {
                    return (
                      <ResultImageBlur
                        key={`img-${part.index}-${idx}`}
                        imageUrl={part.content}
                        storagePath={imagePaths[part.index]}
                        alt={`활동 사진 ${part.index + 1}`}
                        onImageUpdated={(newUrl) => onImageUrlUpdate(part.index!, newUrl)}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* 해시태그 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">해시태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-olive-light text-secondary border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="olive"
          className="w-full h-12 text-base"
          onClick={copyAsHtml}
          disabled={isDeleting}
        >
          {copied === 'html' ? (
            <>
              <Check className="w-5 h-5" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              네이버 블로그용 복사하기 (사진 포함)
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDeletePhotos}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                붙여넣기 완료 (이미지 삭제)
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={onReset}
            disabled={isDeleting}
          >
            <RotateCcw className="w-4 h-4" />
            새로운 글 작성하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoBlogResult;
