import { Users, UserPlus, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            총 가입 업체
          </CardTitle>
          <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalUsers}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">전체 회원 수</p>
        </CardContent>
      </Card>

      <Card 
        className="bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-600 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={onPendingClick}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
            신규 가입 대기
          </CardTitle>
          <UserPlus className="w-5 h-5 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingApproval}</div>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">승인 대기 중 →</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            오늘 생성된 글
          </CardTitle>
          <FileText className="w-5 h-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{todayPosts}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">24시간 이내</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            이번 달 총 사용량
          </CardTitle>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyUsage}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">전체 업체 합계</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsWidgets;
