import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

export const TripCardSkeleton = () => (
  <Card className="p-6 border-none shadow-sm">
    <div className="flex gap-6">
      <Skeleton className="w-24 h-24 rounded-2xl" />
      <div className="flex-1 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  </Card>
);
