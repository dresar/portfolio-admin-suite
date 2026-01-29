import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Globe,
  Mail,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useSocialLinks } from '@/hooks/queries/useSettings';
import { SocialLink } from '@/types';

const socialPlatforms = [
  { value: 'github', label: 'GitHub', icon: Github, color: 'hover:bg-gray-800' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'hover:bg-blue-700' },
  { value: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'hover:bg-sky-500' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'hover:bg-pink-600' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'hover:bg-red-600' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'hover:bg-blue-600' },
  { value: 'email', label: 'Email', icon: Mail, color: 'hover:bg-green-600' },
  { value: 'website', label: 'Website', icon: Globe, color: 'hover:bg-primary' },
  { value: 'other', label: 'Other', icon: LinkIcon, color: 'hover:bg-muted' },
];

const getIconComponent = (iconName: string) => {
  const platform = socialPlatforms.find((p) => p.value === iconName || p.label.toLowerCase() === iconName?.toLowerCase());
  return platform?.icon || LinkIcon;
};

const SocialLinks = () => {
  const { socialLinks, addSocialLink, updateSocialLink, deleteSocialLink, isLoading } = useSocialLinks();
  const isMobile = useIsMobile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);

  const openEditDialog = (link?: SocialLink) => {
    setEditingLink(
      link
        ? { ...link }
        : {
            platform: '',
            url: '',
            icon: 'other',
          }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingLink) return;

    if (!editingLink.platform || !editingLink.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      if (editingLink.icon !== 'email') {
        new URL(editingLink.url);
      }
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
        if (editingLink.id) {
            await updateSocialLink({ id: editingLink.id, data: editingLink });
            toast.success('Social link updated successfully');
        } else {
            await addSocialLink(editingLink as Omit<SocialLink, 'id'>);
            toast.success('Social link added successfully');
        }
        setDialogOpen(false);
        setEditingLink(null);
    } catch (error) {
        toast.error('Failed to save social link');
    }
  };

  const handleDelete = async () => {
    if (linkToDelete) {
      try {
        await deleteSocialLink(linkToDelete);
        toast.success('Social link deleted');
        setLinkToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error('Failed to delete social link');
      }
    }
  };

  const FormContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Platform</Label>
        <Select
          value={editingLink?.icon || ''}
          onValueChange={(v) => {
            const platform = socialPlatforms.find((p) => p.value === v);
            setEditingLink((prev) => ({
              ...prev,
              icon: v,
              platform: platform?.label || '',
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <SelectItem key={platform.value} value={platform.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {editingLink?.icon === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="platform">Platform Name</Label>
          <Input
            id="platform"
            placeholder="e.g., Dribbble"
            value={editingLink?.platform || ''}
            onChange={(e) =>
              setEditingLink((prev) => ({ ...prev, platform: e.target.value }))
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">
          {editingLink?.icon === 'email' ? 'Email Address' : 'Profile URL'}
        </Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="url"
            placeholder={
              editingLink?.icon === 'email'
                ? 'your@email.com'
                : 'https://github.com/username'
            }
            className="pl-10"
            value={editingLink?.url || ''}
            onChange={(e) =>
              setEditingLink((prev) => ({ ...prev, url: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Preview */}
      {editingLink?.platform && editingLink?.url && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = getIconComponent(editingLink.icon || 'other');
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            <div>
              <p className="font-medium">{editingLink.platform}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                {editingLink.url}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Social Links</h1>
            <p className="text-muted-foreground mt-1">Manage your social media profiles</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </motion.div>

        {/* Social Links Grid */}
        {(!socialLinks || socialLinks.length === 0) ? (
          <EmptyState
            icon="share-2"
            title="No social links added"
            description="Add your social media profiles to connect with visitors"
            action={{ label: 'Add Social Link', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {socialLinks.map((link, index) => {
              const Icon = getIconComponent(link.icon || 'other');
              const platform = socialPlatforms.find((p) => p.value === link.icon || p.label === link.platform);
              
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 card-hover group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                        'bg-muted/50 group-hover:text-white',
                        platform?.color || 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setLinkToDelete(link.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold">{link.platform}</h3>
                  <a
                    href={link.icon === 'email' ? `mailto:${link.url}` : link.url}
                    target={link.icon === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 truncate"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Edit Dialog/Drawer */}
        {isMobile ? (
          <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{editingLink?.id ? 'Edit' : 'Add'} Social Link</DrawerTitle>
                <DrawerDescription>
                  {editingLink?.id ? 'Update your social link' : 'Add a new social media profile'}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4">
                <FormContent />
              </div>
              <DrawerFooter>
                <Button onClick={handleSave} className="btn-neon">
                  {editingLink?.id ? 'Save Changes' : 'Add Link'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLink?.id ? 'Edit' : 'Add'} Social Link</DialogTitle>
                <DialogDescription>
                  {editingLink?.id ? 'Update your social link' : 'Add a new social media profile'}
                </DialogDescription>
              </DialogHeader>
              <FormContent />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                  {editingLink?.id ? 'Save Changes' : 'Add Link'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Social Link"
          description="Are you sure you want to delete this social link? This action cannot be undone."
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default SocialLinks;
