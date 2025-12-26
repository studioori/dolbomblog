import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Edit, Building2, MapPin, AlertCircle, Plus, ImagePlus, ShieldCheck, Trash2, Palette, BarChart3, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsWidgets from '@/components/admin/StatsWidgets';
import GlobalActivityFeed from '@/components/admin/GlobalActivityFeed';
import StyleConfigModal, { type StyleConfig } from '@/components/admin/StyleConfigModal';
import UsageHistoryModal from '@/components/admin/UsageHistoryModal';

interface Profile {
  id: string;
  email: string;
  center_name: string;
  region: string;
  plan_tier: string;
  monthly_limit: number;
  current_usage: number;
  is_active: boolean;
  created_at: string;
  writing_tone_prompt: string | null;
  max_image_count: number;
  style_config: any;
  // Analytics fields (computed)
  lastActive?: Date | null;
  totalPosts?: number;
}

interface Stats {
  totalUsers: number;
  pendingApproval: number;
  todayPosts: number;
  monthlyUsage: number;
}

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingApproval: 0, todayPosts: 0, monthlyUsage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Create user modal state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createCenterName, setCreateCenterName] = useState('');
  const [createRegion, setCreateRegion] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editCenterName, setEditCenterName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editMonthlyLimit, setEditMonthlyLimit] = useState(10);
  const [editIsActive, setEditIsActive] = useState(false);
  const [editPlanTier, setEditPlanTier] = useState('free');
  const [editMaxImageCount, setEditMaxImageCount] = useState(5);
  const [editIsAdminRole, setEditIsAdminRole] = useState(false);
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete user state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Style config modal state
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [styleModalProfile, setStyleModalProfile] = useState<Profile | null>(null);

  // Usage history modal state
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageModalProfile, setUsageModalProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: '접근 권한 없음',
        description: '관리자만 접근할 수 있는 페이지입니다.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch admin roles
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Filter out admin accounts - only show client companies
      const clientProfiles = (profilesData || []).filter(
        profile => !adminUserIds.has(profile.id)
      );

      // Fetch activity logs for last active time
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('user_id, created_at')
        .in('user_id', clientProfiles.map(p => p.id))
        .order('created_at', { ascending: false });

      // Group activity logs by user to get most recent
      const lastActiveMap: Record<string, Date> = {};
      activityLogs?.forEach(log => {
        if (!lastActiveMap[log.user_id]) {
          lastActiveMap[log.user_id] = new Date(log.created_at);
        }
      });

      // Fetch total posts count per user
      const { data: postCounts } = await supabase
        .from('generated_posts')
        .select('user_id');

      // Count posts per user
      const postsCountMap: Record<string, number> = {};
      postCounts?.forEach(post => {
        if (post.user_id) {
          postsCountMap[post.user_id] = (postsCountMap[post.user_id] || 0) + 1;
        }
      });

      // Enrich profiles with analytics
      const enrichedProfiles: Profile[] = clientProfiles.map(profile => ({
        ...profile,
        lastActive: lastActiveMap[profile.id] || null,
        totalPosts: postsCountMap[profile.id] || 0,
      }));

      setProfiles(enrichedProfiles);

      // Calculate stats (excluding admins)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayPostsCount } = await supabase
        .from('generated_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate monthly usage sum
      const monthlyUsageSum = clientProfiles.reduce((sum, p) => sum + (p.current_usage || 0), 0);
      const pendingCount = clientProfiles.filter(p => !p.is_active).length;

      setStats({
        totalUsers: clientProfiles.length,
        pendingApproval: pendingCount,
        todayPosts: todayPostsCount || 0,
        monthlyUsage: monthlyUsageSum,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: '데이터 로드 실패',
        description: '데이터를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = async (profile: Profile) => {
    setSelectedProfile(profile);
    setEditCenterName(profile.center_name);
    setEditRegion(profile.region || '');
    setEditMonthlyLimit(profile.monthly_limit);
    setEditIsActive(profile.is_active);
    setEditPlanTier(profile.plan_tier);
    setEditMaxImageCount(profile.max_image_count || 5);
    setValidationError(null);
    setShowAdminWarning(false);

    // Check if this user has admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id)
      .maybeSingle();
    
    setEditIsAdminRole(roleData?.role === 'admin');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProfile) return;

    // Validation: 활성화 시 센터명과 지역 필수
    if (editIsActive) {
      if (!editCenterName.trim() || editCenterName === '내 센터') {
        setValidationError('서비스 활성화를 위해 센터명을 입력해주세요.');
        return;
      }
      if (!editRegion.trim()) {
        setValidationError('서비스 활성화를 위해 지역을 입력해주세요.');
        return;
      }
    }

    setValidationError(null);
    setIsSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          center_name: editCenterName,
          region: editRegion,
          monthly_limit: editMonthlyLimit,
          is_active: editIsActive,
          plan_tier: editPlanTier,
          max_image_count: editMaxImageCount,
        })
        .eq('id', selectedProfile.id);

      if (profileError) throw profileError;

      // Update role if changed
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', selectedProfile.id)
        .maybeSingle();

      const wasAdmin = currentRole?.role === 'admin';
      if (wasAdmin !== editIsAdminRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: editIsAdminRole ? 'admin' : 'user' })
          .eq('user_id', selectedProfile.id);

        if (roleError) throw roleError;
      }

      toast({
        title: '저장 완료',
        description: '업체 정보가 성공적으로 업데이트되었습니다.',
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: '저장 실패',
        description: '업체 정보 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateDialog = () => {
    setCreateEmail('');
    setCreatePassword('');
    setCreateCenterName('');
    setCreateRegion('');
    setCreateError(null);
    setIsCreateDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!createEmail || !createPassword || !createCenterName || !createRegion) {
      setCreateError('모든 필드를 입력해주세요.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCreateError('로그인이 필요합니다.');
        return;
      }

      const response = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: createEmail,
          password: createPassword,
          centerName: createCenterName,
          region: createRegion,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: '등록 완료',
        description: `${createCenterName} 업체가 성공적으로 등록되었습니다.`,
      });

      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : '업체 등록 중 오류가 발생했습니다.';
      setCreateError(errorMessage);
      toast({
        title: '등록 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePendingClick = () => {
    setActiveTab('companies');
  };

  // Filter profiles by pending status
  const pendingProfiles = profiles.filter(p => !p.is_active);
  const activeProfiles = profiles.filter(p => p.is_active);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Stats Widgets */}
        <StatsWidgets 
          totalUsers={stats.totalUsers}
          pendingApproval={stats.pendingApproval}
          todayPosts={stats.todayPosts}
          monthlyUsage={stats.monthlyUsage}
          onPendingClick={handlePendingClick}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">
              📊 활동 모니터링
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">
              🏢 업체 관리
              {stats.pendingApproval > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {stats.pendingApproval}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Activity Feed */}
          <TabsContent value="overview" className="space-y-6">
            <GlobalActivityFeed />
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            {/* Pending Approvals Section */}
            {pendingProfiles.length > 0 && (
              <Card className="bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-600">
                <CardHeader className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        승인 대기 중인 업체 ({pendingProfiles.length})
                      </CardTitle>
                      <CardDescription className="text-amber-700/70 dark:text-amber-300/70">
                        아래 업체들의 정보를 확인하고 승인해주세요
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="text-slate-600 dark:text-slate-300">센터명</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">지역</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">이메일</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">가입일</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfiles.map((profile) => (
                        <TableRow key={profile.id} className="bg-amber-50/50 dark:bg-amber-900/10">
                          <TableCell className="font-medium">
                            {profile.center_name === '내 센터' ? (
                              <span className="text-amber-600 dark:text-amber-400 italic">미등록</span>
                            ) : (
                              profile.center_name
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.region ? (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <MapPin className="w-3 h-3" />
                                {profile.region}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">{profile.email}</TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">
                            {format(new Date(profile.created_at), 'yyyy.MM.dd', { locale: ko })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openEditDialog(profile)}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              승인하기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Active Companies Section */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      업체 목록
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      가입한 모든 업체를 관리합니다
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateDialog} className="gap-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500">
                    <Plus className="w-4 h-4" />
                    신규 업체 등록
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="text-slate-600 dark:text-slate-300">센터명</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">지역</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">사용률</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">최근 접속</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">누적 생성</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300">상태</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-300 text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                            가입된 업체가 없습니다
                          </TableCell>
                        </TableRow>
                      ) : (
                        profiles.map((profile) => {
                          const utilization = profile.monthly_limit > 0 
                            ? Math.round((profile.current_usage / profile.monthly_limit) * 100) 
                            : 0;
                          const utilizationColor = utilization >= 100 
                            ? 'bg-red-500' 
                            : utilization >= 70 
                            ? 'bg-emerald-500' 
                            : 'bg-slate-300 dark:bg-slate-600';
                          
                          return (
                            <TableRow key={profile.id} className={!profile.is_active ? 'bg-slate-50 dark:bg-slate-800/30' : ''}>
                              <TableCell className="font-medium text-slate-800 dark:text-slate-100">
                                <div>
                                  {profile.center_name === '내 센터' ? (
                                    <span className="text-slate-400 italic">미등록</span>
                                  ) : (
                                    profile.center_name
                                  )}
                                  <p className="text-xs text-slate-500">{profile.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {profile.region ? (
                                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-3 h-3" />
                                    {profile.region}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Progress value={utilization} className={`w-16 h-2 [&>div]:${utilizationColor}`} />
                                    <span className={`text-sm font-medium ${
                                      utilization >= 100 ? 'text-red-600 dark:text-red-400' 
                                      : utilization >= 70 ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-slate-500'
                                    }`}>
                                      {utilization}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    ({profile.current_usage}/{profile.monthly_limit})
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {profile.lastActive ? (
                                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(profile.lastActive, { addSuffix: true, locale: ko })}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">기록 없음</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">
                                  {profile.totalPosts || 0}개
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={profile.is_active ? 'default' : 'secondary'} className={`
                                  ${profile.is_active 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                  }
                                `}>
                                  {profile.is_active ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUsageModalProfile(profile);
                                      setUsageModalOpen(true);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    title="이용 통계"
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setStyleModalProfile(profile);
                                      setStyleModalOpen(true);
                                    }}
                                    className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    title="스타일 설정"
                                  >
                                    <Palette className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(profile)}
                                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    title="정보 수정"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUserToDelete(profile);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>업체 정보 수정</DialogTitle>
            <DialogDescription>
              {selectedProfile?.email}의 정보를 수정합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* 승인 대기 안내 */}
            {selectedProfile && !selectedProfile.is_active && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">승인 대기 중인 업체입니다</p>
                  <p className="text-xs mt-1">서비스 활성화를 위해 센터명과 지역을 입력해주세요.</p>
                </div>
              </div>
            )}

            {/* 유효성 검사 에러 */}
            {validationError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{validationError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-center-name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                센터명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-center-name"
                value={editCenterName}
                onChange={(e) => setEditCenterName(e.target.value)}
                placeholder="예: 행복한주야간보호센터"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-region" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                지역 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-region"
                value={editRegion}
                onChange={(e) => setEditRegion(e.target.value)}
                placeholder="예: 성남 분당"
              />
              <p className="text-xs text-muted-foreground">
                AI 글 생성 시 지역명이 자동 반영됩니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plan">요금제</Label>
              <Select value={editPlanTier} onValueChange={setEditPlanTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-limit">월간 한도</Label>
              <Input
                id="edit-limit"
                type="number"
                value={editMonthlyLimit}
                onChange={(e) => setEditMonthlyLimit(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                현재 사용량: {selectedProfile?.current_usage}회
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-max-images" className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                최대 이미지 업로드 수
              </Label>
              <Input
                id="edit-max-images"
                type="number"
                value={editMaxImageCount}
                onChange={(e) => setEditMaxImageCount(parseInt(e.target.value) || 5)}
                min={1}
                max={20}
              />
              <p className="text-xs text-muted-foreground">
                한 번에 업로드 가능한 사진 개수 (기본: 5장)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">서비스 활성화 (승인)</Label>
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
            </div>

            {/* Admin Role Section */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-admin-role" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  관리자(Admin) 권한 부여
                </Label>
                <Switch
                  id="edit-admin-role"
                  checked={editIsAdminRole}
                  onCheckedChange={(checked) => {
                    if (checked && !showAdminWarning) {
                      setShowAdminWarning(true);
                    } else {
                      setEditIsAdminRole(checked);
                      if (!checked) setShowAdminWarning(false);
                    }
                  }}
                />
              </div>

              {showAdminWarning && !editIsAdminRole && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ 이 사용자에게 시스템 전체 접근 권한을 부여하시겠습니까?
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    관리자는 모든 업체 정보를 조회/수정하고, 다른 사용자에게 권한을 부여할 수 있습니다.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdminWarning(false)}
                    >
                      취소
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        setEditIsAdminRole(true);
                        setShowAdminWarning(false);
                      }}
                    >
                      권한 부여
                    </Button>
                  </div>
                </div>
              )}

              {editIsAdminRole && (
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  ✓ 이 사용자는 관리자 권한을 가집니다
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신규 업체 등록</DialogTitle>
            <DialogDescription>
              새로운 업체를 직접 등록합니다. 이메일 인증 없이 바로 이용 가능합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {createError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{createError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-email">이메일 <span className="text-destructive">*</span></Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">초기 비밀번호 <span className="text-destructive">*</span></Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="최소 6자리"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-center-name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                센터명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-center-name"
                value={createCenterName}
                onChange={(e) => setCreateCenterName(e.target.value)}
                placeholder="예: OO데이케어센터"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-region" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                지역 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-region"
                value={createRegion}
                onChange={(e) => setCreateRegion(e.target.value)}
                placeholder="시, 군, 구 (예: 성남시 분당구)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 업체를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              생성된 모든 글과 데이터가 영구적으로 사라집니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!userToDelete) return;
                setIsDeleting(true);
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) throw new Error('로그인이 필요합니다.');
                  
                  const response = await supabase.functions.invoke('admin-delete-user', {
                    body: { userId: userToDelete.id },
                  });
                  
                  if (response.error) throw new Error(response.error.message);
                  if (response.data?.error) throw new Error(response.data.error);
                  
                  toast({ title: '삭제 완료', description: `${userToDelete.center_name} 업체가 삭제되었습니다.` });
                  setDeleteConfirmOpen(false);
                  fetchData();
                } catch (error) {
                  toast({ title: '삭제 실패', description: error instanceof Error ? error.message : '오류 발생', variant: 'destructive' });
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Style Config Modal */}
      {styleModalProfile && (
        <StyleConfigModal
          isOpen={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
          centerName={styleModalProfile.center_name}
          initialConfig={styleModalProfile.style_config || { tone: 'warm', emojiFrequency: 'moderate', requiredKeywords: [], forbiddenWords: [], customPrompt: '' }}
          onSave={async (config) => {
            await supabase.from('profiles').update({ style_config: config as any }).eq('id', styleModalProfile.id);
            fetchData();
          }}
        />
      )}

      {/* Usage History Modal */}
      <UsageHistoryModal
        isOpen={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        profile={usageModalProfile}
      />
    </div>
  );
};

export default Admin;
