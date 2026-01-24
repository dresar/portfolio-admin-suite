import { motion } from 'framer-motion';
import { FolderOpen, Inbox, FileText, Users, Briefcase, GraduationCap, Award, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: 'folder' | 'inbox' | 'file' | 'users' | 'briefcase' | 'graduation-cap' | 'award' | 'share-2';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons = {
  folder: FolderOpen,
  inbox: Inbox,
  file: FileText,
  users: Users,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  award: Award,
  'share-2': Share2,
};

export function EmptyState({ icon = 'folder', title, description, action, className }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
      >
        <Icon className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="btn-neon">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
