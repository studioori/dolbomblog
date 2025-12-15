import { Button } from '@/components/ui/button';
import { CATEGORIES, type ActivityCategory } from '@/types/blog';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  selectedCategory: ActivityCategory | null;
  onSelectCategory: (category: ActivityCategory) => void;
}

const CategoryChips = ({ selectedCategory, onSelectCategory }: CategoryChipsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">빠른 글쓰기</h2>
        <p className="text-sm text-muted-foreground">오늘의 활동 유형을 선택해주세요</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'chipActive' : 'chip'}
            size="chip"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'transition-all duration-300',
              selectedCategory === category.id && 'scale-105'
            )}
          >
            <span className="text-base mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;
