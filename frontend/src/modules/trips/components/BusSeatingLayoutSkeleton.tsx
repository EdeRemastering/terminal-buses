import { Skeleton } from '@/common/components/ui/skeleton';

interface BusSeatingLayoutSkeletonProps {
  capacity: number;
}

export const BusSeatingLayoutSkeleton = ({ capacity }: BusSeatingLayoutSkeletonProps) => {
  const numRows = Math.ceil(capacity / 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="relative bg-card border rounded-2xl p-6 pt-10 shadow-sm">
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <Skeleton className="h-3 w-16" />
            </div>

            <div className="w-full max-w-sm mx-auto space-y-2">
              {Array.from({ length: numRows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-2">
                  <Skeleton className="w-5 h-4 rounded shrink-0" />
                  <Skeleton className="flex-1 h-14 rounded-xl" />
                  <Skeleton className="flex-1 h-14 rounded-xl" />
                  <div className="w-8 shrink-0" />
                  <Skeleton className="flex-1 h-14 rounded-xl" />
                  <Skeleton className="flex-1 h-14 rounded-xl" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
