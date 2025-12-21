import { Heart, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="w-full py-4 px-4 border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-forest flex items-center justify-center shadow-card transition-all duration-300 group-hover:shadow-elevated group-hover:scale-105">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight transition-colors duration-200">
              의정부 늘봄주야간보호센터{' '}
              <span className="text-gradient-gold">글쓰기 파트너</span>
            </h1>
            <p className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-muted-foreground/80">
              어르신들의 하루를 따뜻하게 전하세요
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-foreground tracking-tight">
              <span className="text-gradient-gold">글쓰기 파트너</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-light border border-secondary/20 transition-all duration-300 hover:shadow-soft hover:scale-105 hover:border-secondary/40 cursor-default group">
            <Sparkles className="w-3.5 h-3.5 text-secondary transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-xs font-medium text-gold-dark">AI 글쓰기</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;