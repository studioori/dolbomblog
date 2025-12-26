import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  centerName: z.string().trim().min(1, '센터명을 입력해주세요').max(100, '센터명은 100자 이하로 입력해주세요'),
  region: z.string().trim().min(1, '지역을 입력해주세요').max(50, '지역은 50자 이하로 입력해주세요'),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupCenterName, setSignupCenterName] = useState('');
  const [signupRegion, setSignupRegion] = useState('');
  
  const { signIn, signUp, user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only redirect if user is already logged in on page load
  useEffect(() => {
    if (user && !isLoading) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast({
        title: '입력 오류',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error, isAdmin: userIsAdmin } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = '로그인에 실패했습니다.';
      if (error.message.includes('Invalid login credentials')) {
        message = '이메일 또는 비밀번호가 올바르지 않습니다.';
      }
      toast({
        title: '로그인 실패',
        description: message,
        variant: 'destructive',
      });
    } else {
      // Redirect based on role immediately after successful login
      if (userIsAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ 
      email: signupEmail, 
      password: signupPassword,
      centerName: signupCenterName,
      region: signupRegion,
    });
    if (!validation.success) {
      toast({
        title: '입력 오류',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, {
      center_name: signupCenterName.trim(),
      region: signupRegion.trim(),
    });
    setIsLoading(false);

    if (error) {
      let message = '회원가입에 실패했습니다.';
      if (error.message.includes('already registered')) {
        message = '이미 가입된 이메일입니다.';
      }
      toast({
        title: '회원가입 실패',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '회원가입 요청 완료',
        description: '회원가입 요청이 완료되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.',
      });
      setSignupEmail('');
      setSignupPassword('');
      setSignupCenterName('');
      setSignupRegion('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              돌봄 블로그 생성기
            </CardTitle>
            <CardDescription className="mt-2">
              돌봄기관을 위한 AI 블로그 자동 생성 서비스
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일 <span className="text-destructive">*</span></Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호 <span className="text-destructive">*</span></Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="최소 6자리"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-center-name">센터명 <span className="text-destructive">*</span></Label>
                  <Input
                    id="signup-center-name"
                    type="text"
                    placeholder="예: OO데이케어센터"
                    value={signupCenterName}
                    onChange={(e) => setSignupCenterName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-region">지역 <span className="text-destructive">*</span></Label>
                  <Input
                    id="signup-region"
                    type="text"
                    placeholder="시, 군, 구 (예: 성남시 분당구, 의정부시)"
                    value={signupRegion}
                    onChange={(e) => setSignupRegion(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ 입력하신 센터명과 지역은 가입 후 임의로 수정할 수 없습니다.
                </p>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    '회원가입 요청'
                  )}
                </Button>
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <p className="text-xs text-center text-muted-foreground">
                    📋 회원가입 요청 후 관리자가 승인하면 서비스를 이용하실 수 있습니다.
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
