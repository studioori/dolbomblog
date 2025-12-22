import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Copy, Check, Clock, Info, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GeneratedPost {
  id: string;
  content: string;
  image_paths: string[];
  created_at: string;
}

const RecentPostsList = () => {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up realtime subscription
    const channel = supabase
      .channel('generated_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const copyPost = async (post: GeneratedPost) => {
    try {
      // Parse title from content (first line or generate one)
      const lines = post.content.split('\n').filter(l => l.trim());
      const title = lines[0]?.replace(/^#+\s*/, '') || '오늘 하루도 따뜻했습니다';
      
      let html = `<h2>${title}</h2>\n\n`;
      
      // Process content with images
      let processedContent = post.content;
      post.image_paths.forEach((url, index) => {
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
        if (idx >= 0 && idx < post.image_paths.length) {
          return `\n<img src="${post.image_paths[idx]}" alt="활동 사진 ${num}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`;
        }
        return '';
      });
      
      html += processedContent.split('\n').map(line => `<p>${line}</p>`).join('\n');

      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([post.content], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      setCopiedId(post.id);
      toast({
        title: '복사 완료! 🎉',
        description: '네이버 블로그 에디터에 붙여넣기하세요.',
      });
      setTimeout(() => setCopiedId(null), 3000);
      
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: '복사 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const getPreviewText = (content: string): string => {
    // Remove image placeholders and get first 2-3 lines
    const cleaned = content.replace(/\[IMAGE_PLACEHOLDER_\d+\]/g, '').trim();
    const lines = cleaned.split('\n').filter(l => l.trim());
    return lines.slice(0, 2).join(' ').substring(0, 120) + (lines.length > 2 ? '...' : '');
  };

  const getTimeAgo = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ko 
    });
  };

  if (loading) {
    return (
      <section className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          최근 생성된 글 (24시간 보관)
        </h2>
        
        {/* Notice */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            생성된 글과 사진은 서버 용량 관리를 위해 <strong className="text-foreground">24시간 뒤에 자동으로 영구 삭제</strong>됩니다.
          </p>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>최근 24시간 내에 생성된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article 
              key={post.id}
              className="group p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                {post.image_paths.length > 0 ? (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={post.image_paths[0]} 
                      alt="썸네일"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">
                    {getPreviewText(post.content)}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(post.created_at)} 생성됨
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => copyPost(post)}
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          복사하기
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentPostsList;
