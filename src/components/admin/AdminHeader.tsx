import { Shield, LogOut, User, Home, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="w-full py-4 px-6 border-b border-border/50 bg-gradient-to-r from-card via-background to-card sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-4 group cursor-pointer">
          {/* Premium Logo */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-forest flex items-center justify-center shadow-elevated transition-all duration-500 group-hover:shadow-glow group-hover:scale-105">
              <Shield className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center shadow-soft animate-pulse-soft">
              <Sparkles className="w-2.5 h-2.5 text-secondary-foreground" />
            </div>
          </div>
          
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <span className="text-gradient-forest">통합 관리 센터</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
               Mediblog · 서비스 관리
            </p>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-card"
          >
            <Home className="w-4 h-4 mr-2" />
            글쓰기 도구
          </Button>
          
          <ThemeToggle />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300"
                >
                  <User className="w-4 h-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-elevated">
                <DropdownMenuLabel className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">{profile?.center_name}</span>
                    <span className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
