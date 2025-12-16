import { Heart, Sparkles } from 'lucide-react';
const Header = () => {
  return <header className="w-full py-6 px-4 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-card animate-float">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">의정부 늘봄주야간보호센터 <span className="text-gradient-warm">글쓰기 파트너</span>
            </h1>
            <p className="text-xs text-muted-foreground">어르신들의 하루를 따뜻하게 전하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-olive-light border border-secondary/20">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-xs font-medium text-secondary">AI 글쓰기</span>
        </div>
      </div>
    </header>;
};
export default Header;