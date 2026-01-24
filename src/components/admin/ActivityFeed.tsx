import { motion } from 'framer-motion';
import { MessageSquare, FolderKanban, UserPlus, Settings, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Activity } from '@/store/adminStore';

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  message: MessageSquare,
  project: FolderKanban,
  subscriber: UserPlus,
  system: Settings,
};

const activityColors = {
  message: 'bg-blue-500/20 text-blue-500',
  project: 'bg-primary/20 text-primary',
  subscriber: 'bg-success/20 text-success',
  system: 'bg-warning/20 text-warning',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-4 pr-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  activityColors[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTime(activity.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
