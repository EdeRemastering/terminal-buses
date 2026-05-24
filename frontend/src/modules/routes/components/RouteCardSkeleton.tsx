import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

export const RouteCardSkeleton = () => (
  <Card className="p-6 border-none shadow-sm space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-14 w-full rounded-xl" />
  </Card>
);
