import { useState } from 'react';
import Header from '@/components/Header';
import CategoryChips from '@/components/CategoryChips';
import ActivityForm from '@/components/ActivityForm';
import GeneratedContent from '@/components/GeneratedContent';
import { type ActivityCategory, type BlogInput, type GeneratedBlog } from '@/types/blog';
import { generateBlogContent } from '@/lib/blogGenerator';
import { useToast } from '@/hooks/use-toast';
const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleCategorySelect = (category: ActivityCategory) => {
    setSelectedCategory(category);
    setGeneratedBlog(null);
  };
  const handleSubmit = async (input: BlogInput) => {
    setIsLoading(true);
    try {
      const blog = await generateBlogContent(input);
      setGeneratedBlog(blog);
      toast({
        title: '글 생성 완료! ✨',
        description: '생성된 글을 확인하고 복사해주세요.'
      });
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '글 생성 중 문제가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    setSelectedCategory(null);
    setGeneratedBlog(null);
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* 히어로 섹션 */}
        {!selectedCategory && !generatedBlog && <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-warm flex items-center justify-center shadow-card animate-float">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              오늘의 활동을 <span className="text-gradient-warm">따뜻하게</span> 전해보세요
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              어르신들의 일상을 보호자님께 전문적이고 감성적으로 전달하는 
              블로그 글을 AI가 작성해 드립니다.
            </p>
          </div>}

        {/* 카테고리 선택 */}
        {!generatedBlog && <CategoryChips selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />}

        {/* 입력 폼 */}
        {selectedCategory && !generatedBlog && <ActivityForm category={selectedCategory} onSubmit={handleSubmit} isLoading={isLoading} />}

        {/* 생성된 콘텐츠 */}
        {generatedBlog && <GeneratedContent blog={generatedBlog} onReset={handleReset} />}
      </main>

      {/* 푸터 */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>© 2025 늘봄종합복지센터 글쓰기 파트너</p>
        <p className="mt-1">어르신의 하루를 따뜻하게 전합니다 💚</p>
      </footer>
    </div>;
};
export default Index;