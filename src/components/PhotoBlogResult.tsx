import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, RotateCcw, FileText, Hash, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoBlogResultProps {
  title: string;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  onReset: () => void;
  onDeletePhotos: () => Promise<void>;
}

const PhotoBlogResult = ({ 
  title, 
  content, 
  hashtags, 
  imageUrls,
  onReset, 
  onDeletePhotos
}: PhotoBlogResultProps) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const copyAsHtml = async () => {
    try {
      // Build HTML content with Supabase URLs
      let html = `<h2>${title}</h2>\n\n`;
      
      let processedContent = content;
      imageUrls.forEach((url, index) => {
        const placeholder = `[IMAGE_PLACEHOLDER_${index + 1}]`;
        processedContent = processedContent.replace(
          placeholder,
          `\n<img src="${url}" alt="활동 사진 ${index + 1}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`
        );
      });
      
      // Handle any remaining placeholders
      const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
      processedContent = processedContent.replace(placeholderRegex, (match, num) => {
        const idx = parseInt(num) - 1;
        if (idx >= 0 && idx < imageUrls.length) {
          return `\n<img src="${imageUrls[idx]}" alt="활동 사진 ${num}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`;
        }
        return '';
      });
      
      // Convert line breaks to paragraphs
      html += processedContent.split('\n').map(line => `<p>${line}</p>`).join('\n');
      html += `\n\n<p>${hashtags.join(' ')}</p>`;

      // Copy as HTML to clipboard
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([`${title}\n\n${content}\n\n${hashtags.join(' ')}`], { type: 'text/plain' })
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

  const handleDeletePhotos = async () => {
    setIsDeleting(true);
    try {
      await onDeletePhotos();
      toast({
        title: '이미지 삭제 완료! 🗑️',
        description: '업로드된 이미지가 모두 삭제되었습니다.',
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

  // Render content with images
  const renderContentWithImages = () => {
    const parts: Array<{ type: 'text' | 'image'; content: string; index?: number }> = [];
    
    const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
    let lastIndex = 0;
    let match;

    placeholderRegex.lastIndex = 0;

    while ((match = placeholderRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

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

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  };

  const contentParts = renderContentWithImages();

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              생성된 글
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

          {/* 본문 */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              본문 미리보기
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
                  } else if (part.type === 'image') {
                    return (
                      <img
                        key={`img-${part.index}-${idx}`}
                        src={part.content}
                        alt={`활동 사진 ${(part.index ?? 0) + 1}`}
                        className="w-full rounded-lg shadow-md my-4"
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
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              복사 완료! 네이버에 붙여넣으세요
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
