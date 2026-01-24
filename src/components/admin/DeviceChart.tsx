import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { Stats } from '@/store/adminStore';

interface DeviceChartProps {
  stats: Stats;
}

const deviceIcons = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

export function DeviceChart({ stats }: DeviceChartProps) {
  const data = stats.deviceStats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass rounded-xl p-5"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Device Breakdown</h3>
        <p className="text-sm text-muted-foreground">Traffic by device type</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3 w-full">
          {data.map((device) => {
            const Icon = deviceIcons[device.name as keyof typeof deviceIcons] || Monitor;
            return (
              <div key={device.name} className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${device.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: device.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{device.name}</span>
                    <span className="text-sm text-muted-foreground">{device.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${device.value}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
