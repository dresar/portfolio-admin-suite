import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Image as ImageIcon,
  Type,
  FileText,
  Plus,
  X,
  GripVertical,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  Upload,
  Loader2
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useHomeContent, useAboutContent } from '@/hooks/queries/useContent';
import { HomeContent, AboutContent } from '@/types';

const ContentEditor = () => {
  const { homeContent, updateHomeContent, isLoading: isHomeLoading } = useHomeContent();
  const { aboutContent, updateAboutContent, isLoading: isAboutLoading } = useAboutContent();

  const [localHome, setLocalHome] = useState<Partial<HomeContent>>({});
  const [localAbout, setLocalAbout] = useState<Partial<AboutContent>>({});
  
  const [newRole, setNewRole] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  
  // Rich text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    if (homeContent) {
        setLocalHome(homeContent);
        try {
            const parsedRoles = JSON.parse(homeContent.roles_id || '[]');
            if (Array.isArray(parsedRoles)) {
                setRoles(parsedRoles);
            }
        } catch (e) {
            setRoles([]);
        }
    }
  }, [homeContent]);

  useEffect(() => {
    if (aboutContent) {
        setLocalAbout(aboutContent);
    }
  }, [aboutContent]);

  const handleSaveHome = async () => {
    try {
      await updateHomeContent({
        ...localHome,
        roles_id: JSON.stringify(roles),
        // greeting_en and roles_en are auto-translated by backend usually, but we can send them if we want manual override
      });
      toast.success('Home content saved successfully!');
    } catch (error) {
      toast.error('Failed to save home content');
    }
  };

  const handleSaveAbout = async () => {
    try {
      await updateAboutContent(localAbout);
      toast.success('About content saved successfully!');
    } catch (error) {
      toast.error('Failed to save about content');
    }
  };

  const addRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setRoles(roles.filter((role) => role !== roleToRemove));
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'list' | 'ordered') => {
    const textarea = document.getElementById('about-bio') as HTMLTextAreaElement;
    if (!textarea) return;

    const currentText = localAbout.long_description_id || '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentText.substring(start, end);

    let formattedText = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = end + 4;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = end + 2;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        newCursorPos = end + 3;
        break;
      case 'ordered':
        formattedText = `\n1. ${selectedText}`;
        newCursorPos = end + 4;
        break;
    }

    const newBio = currentText.substring(0, start) + formattedText + currentText.substring(end);
    setLocalAbout({ ...localAbout, long_description_id: newBio });

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (isHomeLoading || isAboutLoading) {
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
            <h1 className="text-3xl font-bold tracking-tight">Content Editor</h1>
            <p className="text-muted-foreground mt-1">Manage your hero section and about page content</p>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="hero" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <FileText className="h-4 w-4" />
              About Section
            </TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-6">
             <div className="flex justify-end">
                <Button onClick={handleSaveHome} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save Hero Changes
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hero Text Content */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Hero Text (Indonesian)
                  </CardTitle>
                  <CardDescription>
                    Customize the main heading and greeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="greeting_id">Greeting</Label>
                    <Input
                      id="greeting_id"
                      placeholder="Halo, Saya"
                      value={localHome.greeting_id || ''}
                      onChange={(e) => setLocalHome({ ...localHome, greeting_id: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hero Image */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Hero Image
                  </CardTitle>
                  <CardDescription>
                    Upload or replace your profile image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        {localHome.heroImage ? (
                        <img
                            src={localHome.heroImage}
                            alt="Hero"
                            className="w-full h-48 object-cover rounded-xl"
                        />
                        ) : (
                            <div className="w-full h-48 bg-muted flex items-center justify-center rounded-xl">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                        <Input 
                            type="file" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setLocalHome({ ...localHome, heroImageFile: file });
                                }
                            }}
                        />
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Typing Roles */}
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Typing Text Roles
                </CardTitle>
                <CardDescription>
                  These roles will be animated in the hero section typewriter effect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a role (e.g., Pengembang Full-Stack)"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRole()}
                  />
                  <Button onClick={addRole}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {roles.length > 0 && (
                  <Reorder.Group
                    axis="y"
                    values={roles}
                    onReorder={setRoles}
                    className="space-y-2"
                  >
                    {roles.map((role) => (
                      <Reorder.Item
                        key={role}
                        value={role}
                        className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{role}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeRole(role)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}

                {roles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No roles added yet. Add your first role above.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section Tab */}
          <TabsContent value="about" className="space-y-6">
             <div className="flex justify-end">
                <Button onClick={handleSaveAbout} className="btn-neon">
                    <Save className="h-4 w-4 mr-2" />
                    Save About Changes
                </Button>
            </div>
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  About Content (Indonesian)
                </CardTitle>
                <CardDescription>
                  Write a compelling biography. Supports basic markdown formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="short_description_id">Short Description</Label>
                    <Input
                      id="short_description_id"
                      value={localAbout.short_description_id || ''}
                      onChange={(e) => setLocalAbout({ ...localAbout, short_description_id: e.target.value })}
                    />
                  </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                  <Toggle
                    size="sm"
                    pressed={isBold}
                    onPressedChange={setIsBold}
                    onClick={() => applyFormatting('bold')}
                    aria-label="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={isItalic}
                    onPressedChange={setIsItalic}
                    onClick={() => applyFormatting('italic')}
                    aria-label="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Toggle>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Toggle
                    size="sm"
                    onClick={() => applyFormatting('list')}
                    aria-label="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    onClick={() => applyFormatting('ordered')}
                    aria-label="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Toggle>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Toggle size="sm" aria-label="Align Left">
                    <AlignLeft className="h-4 w-4" />
                  </Toggle>
                </div>

                {/* Text Area */}
                <Textarea
                  id="about-bio"
                  placeholder="Write your bio here... (supports **bold**, *italic*, - lists)"
                  value={localAbout.long_description_id || ''}
                  onChange={(e) => setLocalAbout({ ...localAbout, long_description_id: e.target.value })}
                  className="min-h-[300px] font-mono text-sm"
                />

                <p className="text-xs text-muted-foreground">
                  Tip: Use **text** for bold, *text* for italic, and - for bullet points
                </p>
                
                 {/* About Image */}
                 <div className="mt-4">
                    <Label>About Image</Label>
                    <div className="flex flex-col items-center gap-4 mt-2">
                        {localAbout.aboutImage ? (
                        <img
                            src={localAbout.aboutImage}
                            alt="About"
                            className="w-full h-48 object-cover rounded-xl"
                        />
                        ) : (
                            <div className="w-full h-48 bg-muted flex items-center justify-center rounded-xl">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                        <Input 
                            type="file" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setLocalAbout({ ...localAbout, aboutImageFile: file });
                                }
                            }}
                        />
                    </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentEditor;
