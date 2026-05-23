import { motion } from 'framer-motion';
import { Card } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { cn } from '@/common/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: string;
  bg: string;
  index: number;
}

export const StatCard = ({ label, value, icon: Icon, trend, color, bg, index }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20", bg)} />
        <div className="flex items-start justify-between relative z-10">
          <div className={cn("p-3 rounded-2xl", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none rounded-lg">
            {trend}
          </Badge>
        </div>
        <div className="mt-4 relative z-10">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
      </Card>
    </motion.div>
  );
};
