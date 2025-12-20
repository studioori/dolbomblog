import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type GeneratedBlog } from '@/types/blog';
import { Copy, Check, RotateCcw, FileText, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContentProps {
  blog: GeneratedBlog;
  onReset: () => void;
}

const GeneratedContent = ({ blog, onReset }: GeneratedContentProps) => {
  const [copied, setCopied] = useState<'title' | 'content' | 'all' | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'title' | 'content' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: '복사 완료!',
        description: '클립보드에 복사되었습니다. 블로그 에디터에 붙여넣기 하세요.',
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: '복사 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const fullContent = `${blog.title}\n\n${blog.content}\n\n${blog.hashtags.join(' ')}`;

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              생성된 글
            </CardTitle>
            <Button
              variant="sage"
              size="sm"
              onClick={() => copyToClipboard(fullContent, 'all')}
            >
              {copied === 'all' ? (
                <>
                  <Check className="w-4 h-4" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  전체 복사
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">제목</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(blog.title, 'title')}
              >
                {copied === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 border border-border">
              <h3 className="text-lg font-bold text-foreground">{blog.title}</h3>
            </div>
          </div>

          <Separator />

          {/* 본문 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">본문</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(blog.content, 'content')}
              >
                {copied === 'content' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border max-h-[400px] overflow-y-auto">
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {blog.content}
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
              {blog.hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-sage-light text-secondary border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 다시 작성 버튼 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
      >
        <RotateCcw className="w-4 h-4" />
        새로운 글 작성하기
      </Button>
    </div>
  );
};

export default GeneratedContent;
