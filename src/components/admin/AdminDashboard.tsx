"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Mediblog 관리자</h1>
              <p className="text-xs text-muted-foreground">서비스 관리 대시보드</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 업체 수</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>승인 대기</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <Building2 className="w-4 h-4 text-amber-500" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>오늘 생성된 글</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>월간 총 사용량</CardDescription>
              <CardTitle className="text-2xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for full admin features */}
        <Card>
          <CardHeader>
            <CardTitle>관리자 대시보드</CardTitle>
            <CardDescription>
              관리자 기능이 곧 추가될 예정입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              현재 Convex 데이터베이스와 연동된 관리자 기능을 준비 중입니다.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;
