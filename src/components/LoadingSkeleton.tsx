import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'hero' | 'uploader' | 'result';
}

const LoadingSkeleton = ({ type = 'uploader' }: LoadingSkeletonProps) => {
  if (type === 'hero') {
    return (
      <div className="text-center space-y-5 py-8 animate-pulse">
        <Skeleton className="w-20 h-20 mx-auto rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-80 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-96 mx-auto rounded-md" />
          <Skeleton className="h-4 w-72 mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  if (type === 'result') {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-pulse">
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 h-28">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSkeleton;
