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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, FileText, Shield, ArrowLeft, Edit, Building2, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
}

interface Stats {
  totalUsers: number;
  todayPosts: number;
  activeUsers: number;
}

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, todayPosts: 0, activeUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editCenterName, setEditCenterName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editMonthlyLimit, setEditMonthlyLimit] = useState(10);
  const [editIsActive, setEditIsActive] = useState(false);
  const [editPlanTier, setEditPlanTier] = useState('free');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

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
      setProfiles(profilesData || []);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayPostsCount } = await supabase
        .from('generated_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        totalUsers: profilesData?.length || 0,
        todayPosts: todayPostsCount || 0,
        activeUsers: profilesData?.filter(p => p.is_active).length || 0,
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

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditCenterName(profile.center_name);
    setEditRegion(profile.region || '');
    setEditMonthlyLimit(profile.monthly_limit);
    setEditIsActive(profile.is_active);
    setEditPlanTier(profile.plan_tier);
    setValidationError(null);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          center_name: editCenterName,
          region: editRegion,
          monthly_limit: editMonthlyLimit,
          is_active: editIsActive,
          plan_tier: editPlanTier,
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                관리자 대시보드
              </h1>
              <p className="text-muted-foreground">업체 관리 및 서비스 현황</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 가입 업체</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">활성: {stats.activeUsers}개</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">오늘 생성된 글</CardTitle>
              <FileText className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.todayPosts}</div>
              <p className="text-xs text-muted-foreground">24시간 이내</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">활성 업체</CardTitle>
              <Building2 className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">서비스 이용 중</p>
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>업체 목록</CardTitle>
            <CardDescription>가입한 모든 업체를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>센터명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>요금제</TableHead>
                    <TableHead>사용량</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        가입된 업체가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id} className={!profile.is_active ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">
                          {profile.center_name === '내 센터' ? (
                            <span className="text-muted-foreground italic">미등록</span>
                          ) : (
                            profile.center_name
                          )}
                        </TableCell>
                        <TableCell>
                          {profile.region ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {profile.region}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.plan_tier === 'premium' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              : profile.plan_tier === 'basic'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                          }`}>
                            {profile.plan_tier}
                          </span>
                        </TableCell>
                        <TableCell>
                          {profile.current_usage} / {profile.monthly_limit}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {profile.is_active ? '활성' : '비활성'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(profile.created_at), 'yyyy.MM.dd', { locale: ko })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(profile)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>업체 정보 수정</DialogTitle>
              <DialogDescription>
                {selectedProfile?.email}의 정보를 수정합니다
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
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

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active">서비스 활성화 (승인)</Label>
                <Switch
                  id="edit-active"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
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
      </div>
    </div>
  );
};

export default Admin;
