import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CATEGORIES, REACTION_KEYWORDS, type ActivityCategory, type BlogInput } from '@/types/blog';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight, X } from 'lucide-react';

interface ActivityFormProps {
  category: ActivityCategory;
  onSubmit: (input: BlogInput) => void;
  isLoading: boolean;
}

const ActivityForm = ({ category, onSubmit, isLoading }: ActivityFormProps) => {
  const categoryInfo = CATEGORIES.find(c => c.id === category)!;
  
  const [activityName, setActivityName] = useState('');
  const [selectedReactions, setSelectedReactions] = useState<string[]>([]);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [customDetails, setCustomDetails] = useState('');
  const [centerName, setCenterName] = useState('');

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
      centerName: centerName.trim() || '늘푸른주야간보호센터',
    });
  };

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
        {/* 센터명 */}
        <div className="space-y-2">
          <Label htmlFor="centerName" className="text-sm font-medium">
            센터 이름
          </Label>
          <Input
            id="centerName"
            placeholder="예: 늘푸른주야간보호센터"
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            className="h-11"
          />
        </div>

        {/* 활동명 */}
        <div className="space-y-2">
          <Label htmlFor="activityName" className="text-sm font-medium">
            오늘의 활동명 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="activityName"
            placeholder="예: 가을 단풍 색칠하기"
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

        {/* 어르신 반응 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">어르신 반응 (복수 선택 가능)</Label>
          <div className="flex flex-wrap gap-2">
            {REACTION_KEYWORDS.map((reaction) => (
              <Badge
                key={reaction}
                variant={selectedReactions.includes(reaction) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  selectedReactions.includes(reaction) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                )}
                onClick={() => toggleReaction(reaction)}
              >
                {reaction}
                {selectedReactions.includes(reaction) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* 기대효과 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">활동 효과 (선택)</Label>
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
          variant="warm"
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
