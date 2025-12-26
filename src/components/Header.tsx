import { Heart, LogIn, LogOut, Shield, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="w-full py-4 px-4 border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-forest flex items-center justify-center shadow-card transition-all duration-300 group-hover:shadow-elevated group-hover:scale-105">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight transition-colors duration-200">
              {profile?.center_name || '늘봄 블로그 생성기'}{' '}
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
        </Link>
        <div className="flex items-center gap-2">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="text-xs font-medium text-muted-foreground">
                이번 달 글쓰기 {profile.current_usage}/{profile.monthly_limit}회
              </span>
            </div>
          )}
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.center_name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4 mr-2" />
                    관리자 대시보드
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              <LogIn className="w-4 h-4 mr-2" />
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
