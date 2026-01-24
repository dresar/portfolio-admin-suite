import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Globe,
  Share2,
  Palette,
  Shield,
  Save,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const socialIcons = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
];

const accentColors = [
  { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#10b981', label: 'Emerald', class: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
];

const Settings = () => {
  const {
    settings,
    profile,
    socialLinks,
    updateSettings,
    updateProfile,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
  } = useAdminStore();

  const [localProfile, setLocalProfile] = useState(profile);
  const [localSettings, setLocalSettings] = useState(settings);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', icon: '' });

  const handleSaveProfile = () => {
    updateProfile(localProfile);
    toast.success('Profile updated successfully');
  };

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    toast.success('Settings saved successfully');
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      toast.error('Please fill in all fields');
      return;
    }
    addSocialLink({
      platform: newSocialLink.platform,
      url: newSocialLink.url,
      icon: newSocialLink.icon || newSocialLink.platform.toLowerCase(),
    });
    setNewSocialLink({ platform: '', url: '', icon: '' });
    toast.success('Social link added');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio configuration</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Globe className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="system">
              <Shield className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your admin profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <img
                      src={localProfile.avatar}
                      alt={localProfile.name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20"
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={localProfile.avatar}
                        onChange={(e) => setLocalProfile({ ...localProfile, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={localProfile.name}
                        onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={localProfile.email}
                        onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={localProfile.role}
                      onChange={(e) => setLocalProfile({ ...localProfile, role: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Configure search engine optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={localSettings.siteName}
                      onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Meta Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={localSettings.siteDescription}
                      onChange={(e) => setLocalSettings({ ...localSettings, siteDescription: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {localSettings.siteDescription.length}/160 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Keywords (comma-separated)</Label>
                    <Input
                      id="metaKeywords"
                      value={localSettings.metaKeywords.join(', ')}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        metaKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      })}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {localSettings.metaKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save SEO Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>Manage your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Links */}
                  <div className="space-y-3">
                    {socialLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{link.platform}</p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            {link.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            deleteSocialLink(link.id);
                            toast.success('Social link removed');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Link */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Add New Link</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select
                          value={newSocialLink.platform}
                          onValueChange={(v) => setNewSocialLink({ ...newSocialLink, platform: v, icon: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {socialIcons.map((icon) => (
                              <SelectItem key={icon.value} value={icon.label}>
                                {icon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>URL</Label>
                        <Input
                          value={newSocialLink.url}
                          onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddSocialLink} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Theme Configuration</CardTitle>
                  <CardDescription>Customize your portfolio appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Default Theme</Label>
                    <div className="flex gap-4">
                      {(['dark', 'light', 'system'] as const).map((theme) => (
                        <Button
                          key={theme}
                          variant={localSettings.defaultTheme === theme ? 'default' : 'outline'}
                          onClick={() => setLocalSettings({ ...localSettings, defaultTheme: theme })}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Accent Color</Label>
                    <div className="flex flex-wrap gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setLocalSettings({ ...localSettings, accentColor: color.value })}
                          className={`w-10 h-10 rounded-full ${color.class} transition-transform hover:scale-110 ${
                            localSettings.accentColor === color.value
                              ? 'ring-4 ring-offset-2 ring-offset-background ring-white/50'
                              : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save Theme Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Manage system-level configurations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Lock the public frontend for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.maintenanceMode}
                      onCheckedChange={(checked) => {
                        setLocalSettings({ ...localSettings, maintenanceMode: checked });
                        updateSettings({ maintenanceMode: checked });
                        toast.success(checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
                      }}
                    />
                  </div>

                  {localSettings.maintenanceMode && (
                    <div className="p-4 bg-warning/20 border border-warning/30 rounded-lg">
                      <p className="text-sm text-warning">
                        ⚠️ Maintenance mode is active. Your portfolio is currently locked.
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Hero Section</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hero Title</Label>
                        <Input
                          value={localSettings.heroTitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hero Subtitle</Label>
                        <Input
                          value={localSettings.heroSubtitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Typing Roles (comma-separated)</Label>
                        <Input
                          value={localSettings.heroRoles.join(', ')}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            heroRoles: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
                          })}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {localSettings.heroRoles.map((role) => (
                            <Badge key={role} className="badge-primary">{role}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
