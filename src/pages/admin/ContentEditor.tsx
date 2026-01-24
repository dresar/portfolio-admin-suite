import { useState } from 'react';
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
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { useAdminStore } from '@/store/adminStore';
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

const ContentEditor = () => {
  const { settings, updateSettings } = useAdminStore();
  
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle);
  const [heroRoles, setHeroRoles] = useState(settings.heroRoles);
  const [heroImage, setHeroImage] = useState(settings.heroImage);
  const [aboutBio, setAboutBio] = useState(settings.aboutBio);
  const [newRole, setNewRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Rich text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleSave = () => {
    updateSettings({
      heroTitle,
      heroSubtitle,
      heroRoles,
      heroImage,
      aboutBio,
    });
    toast.success('Content saved successfully!');
  };

  const addRole = () => {
    if (newRole.trim() && !heroRoles.includes(newRole.trim())) {
      setHeroRoles([...heroRoles, newRole.trim()]);
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setHeroRoles(heroRoles.filter((role) => role !== roleToRemove));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Simulate file upload with placeholder image
    const mockUrls = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    ];

    const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setHeroImage(randomUrl);
    toast.success('Hero image uploaded (simulated)');
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'list' | 'ordered') => {
    const textarea = document.getElementById('about-bio') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = aboutBio.substring(start, end);

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

    const newBio = aboutBio.substring(0, start) + formattedText + aboutBio.substring(end);
    setAboutBio(newBio);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

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
          <Button onClick={handleSave} className="btn-neon">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hero Text Content */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Hero Text
                  </CardTitle>
                  <CardDescription>
                    Customize the main heading and subtitle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Main Title</Label>
                    <Input
                      id="heroTitle"
                      placeholder="Hi, I'm Alex"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      placeholder="Building digital experiences that matter"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
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
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl overflow-hidden transition-colors',
                      isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    {heroImage ? (
                      <div className="relative">
                        <img
                          src={heroImage}
                          alt="Hero"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="secondary"
                            onClick={() => setHeroImage('')}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Replace Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop your hero image here
                        </p>
                      </div>
                    )}
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
                    placeholder="Add a role (e.g., Full-Stack Developer)"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRole()}
                  />
                  <Button onClick={addRole}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {heroRoles.length > 0 && (
                  <Reorder.Group
                    axis="y"
                    values={heroRoles}
                    onReorder={setHeroRoles}
                    className="space-y-2"
                  >
                    {heroRoles.map((role) => (
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

                {heroRoles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No roles added yet. Add your first role above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card className="glass border-border overflow-hidden">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your hero section will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-to-br from-background to-muted rounded-xl p-8 min-h-[200px] flex items-center">
                  <div className="flex items-center gap-8 w-full">
                    {heroImage && (
                      <div className="shrink-0">
                        <img
                          src={heroImage}
                          alt="Hero Preview"
                          className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <h2 className="text-2xl lg:text-4xl font-bold">{heroTitle || 'Your Title Here'}</h2>
                      <p className="text-lg text-muted-foreground">{heroSubtitle || 'Your subtitle here'}</p>
                      {heroRoles.length > 0 && (
                        <div className="flex items-center gap-2 text-primary">
                          <span className="text-lg">I'm a</span>
                          <span className="text-lg font-semibold border-r-2 border-primary pr-1 animate-pulse">
                            {heroRoles[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  About Bio
                </CardTitle>
                <CardDescription>
                  Write a compelling biography. Supports basic markdown formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  value={aboutBio}
                  onChange={(e) => setAboutBio(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />

                <p className="text-xs text-muted-foreground">
                  Tip: Use **text** for bold, *text* for italic, and - for bullet points
                </p>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your about section will render</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  {aboutBio.split('\n').map((paragraph, i) => {
                    // Simple markdown parsing
                    let text = paragraph;
                    
                    // Bold
                    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    // Italic
                    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    // List items
                    if (text.startsWith('- ')) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1">
                          <span className="text-primary mt-1">•</span>
                          <span dangerouslySetInnerHTML={{ __html: text.slice(2) }} />
                        </div>
                      );
                    }
                    // Numbered list
                    const numberedMatch = text.match(/^(\d+)\.\s/);
                    if (numberedMatch) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1">
                          <span className="text-primary">{numberedMatch[1]}.</span>
                          <span dangerouslySetInnerHTML={{ __html: text.slice(numberedMatch[0].length) }} />
                        </div>
                      );
                    }

                    if (!text.trim()) return <br key={i} />;
                    
                    return (
                      <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: text }} />
                    );
                  })}
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
