import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  delay?: number;
}

export function StatsCard({ title, value, change, icon, delay = 0 }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-sm text-muted-foreground">vs last period</span>
      </div>
    </motion.div>
  );
}
