import { Heart, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-5 px-4 border-b border-border/40 bg-card/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-card">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              의정부 늘봄주야간보호센터{' '}
              <span className="text-gradient-warm">글쓰기 파트너</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              어르신들의 하루를 따뜻하게 전하세요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-light border border-secondary/20">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span className="text-xs font-medium text-secondary">AI 글쓰기</span>
        </div>
      </div>
    </header>
  );
};

export default Header;