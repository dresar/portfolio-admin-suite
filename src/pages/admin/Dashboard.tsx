import { motion } from 'framer-motion';
import { Eye, MessageSquare, FolderKanban, Users, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { VisitorChart } from '@/components/admin/VisitorChart';
import { DeviceChart } from '@/components/admin/DeviceChart';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { useProjects } from '@/hooks/queries/useProjects';
import { useMessages, useSubscribers } from '@/hooks/queries/useMessages';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const Dashboard = () => {
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const { messages, isLoading: isMessagesLoading } = useMessages();
  const { subscribers, isLoading: isSubscribersLoading } = useSubscribers();

  // Fetch real stats from backend
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats/');
      return response.data;
    },
    // Fallback if endpoint fails or during loading
    initialData: {
        totalViews: 0,
        viewsChange: 0,
        totalMessages: 0,
        messagesChange: 0,
        totalProjects: 0,
        projectsChange: 0,
        totalSubscribers: 0,
        subscribersChange: 0,
        weeklyVisitors: [],
        monthlyVisitors: [],
        deviceStats: []
    }
  });

  const isLoading = isProjectsLoading || isMessagesLoading || isSubscribersLoading || isStatsLoading;

  // Activities adapted to ActivityFeed structure
  const activities = [
    ...(messages || []).slice(0, 5).map(m => ({
      id: `msg-${m.id}`,
      type: 'message',
      title: 'New message received',
      description: m.subject || 'Inquiry',
      timestamp: m.createdAt,
    })),
    ...(projects || []).slice(0, 5).map(p => ({
      id: `proj-${p.id}`,
      type: 'project',
      title: 'New project published',
      description: p.title,
      timestamp: p.createdAt,
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  if (isLoading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );
  }

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
