import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, FileText, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Post {
  id: string;
  content: string;
  image_paths: string[];
  created_at: string;
  user_id: string;
  center_name: string;
  region: string;
}

const GlobalActivityFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Fetch posts with user profile info
      const { data: postsData, error } = await supabase
        .from('generated_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles for user info
      const userIds = [...new Set(postsData?.map(p => p.user_id).filter(Boolean) || [])];
      
      let profilesMap: Record<string, { center_name: string; region: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, center_name, region')
          .in('id', userIds);
        
        profilesData?.forEach(p => {
          profilesMap[p.id] = { center_name: p.center_name, region: p.region || '' };
        });
      }

      const enrichedPosts: Post[] = (postsData || []).map(post => ({
        ...post,
        center_name: profilesMap[post.user_id]?.center_name || '알 수 없음',
        region: profilesMap[post.user_id]?.region || '',
      }));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const getPreviewText = (content: string) => {
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
    return cleanContent.length > 50 ? cleanContent.substring(0, 50) + '...' : cleanContent;
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FileText className="w-5 h-5" />
            전체 생성글 모니터링
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            모든 업체에서 생성된 최근 50개의 글을 확인합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="text-slate-600 dark:text-slate-300 w-[180px]">업체 정보</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300">내용 미리보기</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300 w-[160px]">생성 일시</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300 text-right w-[100px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      생성된 글이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {post.center_name}
                          </span>
                          {post.region && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {post.region}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-2">{getPreviewText(post.content)}</p>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPostModal(post)}
                          className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          전문 보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {selectedPost?.center_name}
              </Badge>
              {selectedPost?.region && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedPost.region}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              {/* Images */}
              {selectedPost?.image_paths && selectedPost.image_paths.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedPost.image_paths.map((path, index) => {
                    const { data } = supabase.storage.from('daily-photos').getPublicUrl(path);
                    return (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={data.publicUrl} 
                          alt={`이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Content */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {selectedPost && format(new Date(selectedPost.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                </p>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedPost?.content || '' }}
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalActivityFeed;
