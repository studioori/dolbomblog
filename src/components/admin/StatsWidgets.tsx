import { Users, UserPlus, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsWidgetsProps {
  totalUsers: number;
  pendingApproval: number;
  todayPosts: number;
  monthlyUsage: number;
  onPendingClick: () => void;
}

const StatsWidgets = ({ 
  totalUsers, 
  pendingApproval, 
  todayPosts, 
  monthlyUsage,
  onPendingClick 
}: StatsWidgetsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <Card className="group relative overflow-hidden bg-card border-border/50 shadow-soft hover:shadow-card transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                총 가입 업체
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{totalUsers}</span>
                <span className="text-sm text-muted-foreground">개</span>
              </div>
              <p className="text-xs text-muted-foreground">전체 회원 수</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approval */}
      <Card 
        className="group relative overflow-hidden bg-card border-secondary/30 shadow-soft hover:shadow-glow cursor-pointer transition-all duration-300"
        onClick={onPendingClick}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold" />
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                신규 가입 대기
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-secondary">{pendingApproval}</span>
                <span className="text-sm text-secondary/70">건</span>
              </div>
              <p className="text-xs text-secondary/70 flex items-center gap-1">
                승인 대기 중 
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <UserPlus className="w-5 h-5 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today Posts */}
      <Card className="group relative overflow-hidden bg-card border-border/50 shadow-soft hover:shadow-card transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                오늘 생성된 글
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{todayPosts}</span>
                <span className="text-sm text-muted-foreground">건</span>
              </div>
              <p className="text-xs text-muted-foreground">24시간 이내</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Usage */}
      <Card className="group relative overflow-hidden bg-card border-border/50 shadow-soft hover:shadow-card transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400" />
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                이번 달 총 사용량
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyUsage}</span>
                <span className="text-sm text-muted-foreground">회</span>
              </div>
              <p className="text-xs text-muted-foreground">전체 업체 합계</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsWidgets;
