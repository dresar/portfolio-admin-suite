import { motion } from 'framer-motion';
import { Eye, MessageSquare, FolderKanban, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { VisitorChart } from '@/components/admin/VisitorChart';
import { DeviceChart } from '@/components/admin/DeviceChart';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { useAdminStore } from '@/store/adminStore';

const Dashboard = () => {
  const { stats, activities } = useAdminStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your portfolio performance</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Views"
            value={stats.totalViews}
            change={stats.viewsChange}
            icon={<Eye className="h-6 w-6" />}
            delay={0}
          />
          <StatsCard
            title="Messages"
            value={stats.totalMessages}
            change={stats.messagesChange}
            icon={<MessageSquare className="h-6 w-6" />}
            delay={0.1}
          />
          <StatsCard
            title="Projects"
            value={stats.totalProjects}
            change={stats.projectsChange}
            icon={<FolderKanban className="h-6 w-6" />}
            delay={0.2}
          />
          <StatsCard
            title="Subscribers"
            value={stats.totalSubscribers}
            change={stats.subscribersChange}
            icon={<Users className="h-6 w-6" />}
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisitorChart stats={stats} />
          </div>
          <DeviceChart stats={stats} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
