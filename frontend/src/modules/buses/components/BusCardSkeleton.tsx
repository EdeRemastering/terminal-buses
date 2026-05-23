import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

export const BusCardSkeleton = () => (
  <Card className="p-6 border-none shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <div className="flex justify-between gap-4 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </Card>
);
