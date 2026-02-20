"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function BlogGenerator() {
  const { user } = useUser();
  const [photos, setPhotos] = useState<File[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch profile
  const profile = useQuery(
    api.users.getProfile,
    user?.id ? { userId: user.id } : "skip"
  );

  // Generate blog action
  const generateBlog = useAction(api.generateBlog.generateBlog);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...files]);
      setKeywords((prev) => [...prev, ...files.map(() => "")]);
    }
  };

  const handleKeywordChange = (index: number, value: string) => {
    setKeywords((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (photos.length === 0) {
      toast.error("사진을 최소 1장 이상 선택해주세요.");
      return;
    }

    if (!profile) {
      toast.error("프로필을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      // Convert photos to base64 for API
      const photoDataUrls = await Promise.all(
        photos.map(async (photo) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
        })
      );

      const photosData = photoDataUrls.map((url, index) => ({
        imageUrl: url,
        keyword: keywords[index] || "",
      }));

      const result = await generateBlog({
        photos: photosData,
        centerName: profile.center_name || "병원",
        region: profile.region || "",
        department: profile.department || undefined,
      });

      const fullContent = `${result.title}\n\n${result.content}\n\n${result.hashtags?.join(" ") || ""}`;
      setGeneratedContent(fullContent);
      toast.success("블로그 글이 생성되었습니다!");
    } catch (error) {
      console.error("Error generating blog:", error);
      toast.error("블로그 글 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("클립보드에 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Usage Info */}
      {profile && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                이번 달 사용량
              </span>
              <span className="font-medium">
                {profile.current_usage} / {profile.monthly_limit}회
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📸 진료/이벤트 사진 업로드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos">사진 선택 (최대 10장)</Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="mt-2"
            />
          </div>

          {photos.length > 0 && (
            <div className="space-y-2">
              {photos.map((photo, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-secondary/10 rounded-lg">
                  <span className="text-sm truncate flex-1">{photo.name}</span>
                  <Input
                    placeholder="키워드 (선택)"
                    value={keywords[index]}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                    className="w-32 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePhoto(index)}
                    className="text-destructive"
                  >
                    제거
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || photos.length === 0}
        className="w-full bg-gradient-forest hover:opacity-90"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            블로그 글 생성하기
          </>
        )}
      </Button>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">📝 생성된 블로그 글</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[400px] font-sans"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BlogGenerator;
