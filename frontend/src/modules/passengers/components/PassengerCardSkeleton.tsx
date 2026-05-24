import { Card } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';

export const PassengerCardSkeleton = () => {
  return (
    <Card className="p-6 border-none shadow-sm space-y-4">
      <div className="flex gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
    </Card>
  );
};
