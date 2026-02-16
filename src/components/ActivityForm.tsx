import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CATEGORIES, type ActivityCategory, type BlogInput } from '@/types/blog';
import { getRandomReactions } from '@/data/reactionData';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight, X, RefreshCw } from 'lucide-react';

interface ActivityFormProps {
  category: ActivityCategory;
  onSubmit: (input: BlogInput) => void;
  isLoading: boolean;
}

const HARDCODED_CENTER_NAME = '행복치과';

const ActivityForm = ({ category, onSubmit, isLoading }: ActivityFormProps) => {
  const categoryInfo = CATEGORIES.find(c => c.id === category)!;
  
  const [activityName, setActivityName] = useState('');
  const [selectedReactions, setSelectedReactions] = useState<string[]>([]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [customDetails, setCustomDetails] = useState('');
  const [displayedReactions, setDisplayedReactions] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 카테고리 변경 시 랜덤 반응 갱신
  const refreshReactions = useCallback(() => {
    setIsRefreshing(true);
    const newReactions = getRandomReactions(category, 7);
    
    // 애니메이션 효과를 위한 딜레이
    setTimeout(() => {
      setDisplayedReactions(newReactions);
      // 선택된 반응 중 새 목록에 없는 것은 유지 (이미 선택한 것은 사라지지 않음)
      setIsRefreshing(false);
    }, 200);
  }, [category]);

  useEffect(() => {
    refreshReactions();
    setSelectedReactions([]);
  }, [category, refreshReactions]);

  const toggleReaction = (reaction: string) => {
    setSelectedReactions(prev => 
      prev.includes(reaction) 
        ? prev.filter(r => r !== reaction)
        : [...prev, reaction]
    );
  };

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const handleSubmit = () => {
    if (!activityName.trim()) return;
    
    onSubmit({
      category,
      activityName: activityName.trim(),
      reactions: selectedReactions,
      effects: selectedEffects.length > 0 ? selectedEffects : categoryInfo.effects.slice(0, 2),
      customDetails: customDetails.trim(),
      centerName: HARDCODED_CENTER_NAME,
    });
  };

  // 선택된 반응 + 현재 표시된 반응 (중복 제거)
  const allDisplayedReactions = [...new Set([...selectedReactions, ...displayedReactions])];

  return (
    <Card className="shadow-card border-border/50 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
            {categoryInfo.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{categoryInfo.label} 글쓰기</CardTitle>
            <CardDescription>{categoryInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 활동명 */}
        <div className="space-y-2">
          <Label htmlFor="activityName" className="text-sm font-medium">
            오늘의 활동명 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="activityName"
            placeholder="예: 임플란트 상담"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            className="h-11"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryInfo.examples.map((example) => (
              <Badge
                key={example}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActivityName(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>

        {/* 환자 반응 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">환자 반응 (복수 선택 가능)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshReactions}
              disabled={isRefreshing}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
              <span className="text-xs">다른 표현</span>
            </Button>
          </div>
          <div className={cn(
            "flex flex-wrap gap-2 transition-opacity duration-200",
            isRefreshing && "opacity-50"
          )}>
            {allDisplayedReactions.map((reaction) => (
              <Badge
                key={reaction}
                variant={selectedReactions.includes(reaction) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 text-wrap text-left leading-relaxed py-1.5',
                  selectedReactions.includes(reaction) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                )}
                onClick={() => toggleReaction(reaction)}
              >
                {reaction}
                {selectedReactions.includes(reaction) && (
                  <X className="w-3 h-3 ml-1 flex-shrink-0" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* 기대효과 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">시술 효과 (선택)</Label>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.effects.map((effect) => (
              <Badge
                key={effect}
                variant={selectedEffects.includes(effect) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  selectedEffects.includes(effect)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'hover:bg-olive-light hover:text-secondary border-secondary/30'
                )}
                onClick={() => toggleEffect(effect)}
              >
                {effect}
                {selectedEffects.includes(effect) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* 추가 내용 */}
        <div className="space-y-2">
          <Label htmlFor="customDetails" className="text-sm font-medium">
            추가하고 싶은 내용 (선택)
          </Label>
          <Textarea
            id="customDetails"
            placeholder="특별히 언급하고 싶은 에피소드나 세부 사항을 적어주세요..."
            value={customDetails}
            onChange={(e) => setCustomDetails(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* 생성 버튼 */}
        <Button
          variant="forest"
          size="xl"
          className="w-full"
          onClick={handleSubmit}
          disabled={!activityName.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              글 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              AI로 블로그 글 생성하기
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityForm;
