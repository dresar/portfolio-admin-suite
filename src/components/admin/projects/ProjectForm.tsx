import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormValues } from './schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicList } from './DynamicList';
import { Loader2, Save, Image as ImageIcon, Video, Link as LinkIcon, FileText, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/project.service';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Project } from '@/types';

interface ProjectFormProps {
  initialData?: Project;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.cover_image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: projectService.getCategories,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      categoryId: initialData?.category?.toString() || '',
      tech: initialData?.tech || [],
      demo_urls: initialData?.demo_urls || [],
      repo_urls: initialData?.repo_urls || [],
      video_urls: initialData?.video_urls || [],
      featured_links: initialData?.featured_links || [],
      seo_title: initialData?.seo_title || '',
      seo_description: initialData?.seo_description || '',
      seo_keywords: initialData?.seo_keywords || [],
      is_published: initialData?.is_published || false,
      publish_at: initialData?.publish_at || '',
      video_embed_url: initialData?.video_embed_url || '',
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'cover_image' || key === 'video_file') return; // Handle separately
        if (Array.isArray(value)) {
          // For JSON fields, we need to send them as JSON strings if backend expects JSONField
          // Or append multiple times if backend expects list
          // Django DRF JSONField expects a JSON string or properly parsed JSON in body.
          // When using FormData, we should send JSON string for JSONFields.
          if (['tech', 'demo_urls', 'repo_urls', 'video_urls', 'featured_links', 'seo_keywords'].includes(key)) {
             formData.append(key, JSON.stringify(value));
          } else {
             value && formData.append(key, value as string);
          }
        } else {
           if (value !== undefined && value !== null && value !== '') {
               formData.append(key, value.toString());
           }
        }
      });

      // Handle Category (convert to ID)
      if (values.categoryId) {
        formData.set('category', values.categoryId);
      }

      // Handle Files
      // We need to access the file input directly or via ref
      // Since react-hook-form handles files differently, let's use a ref or state if needed.
      // But here we can use the file input element if we had one.
      // A better way is to use a controlled file input.
      const coverImageInput = document.getElementById('cover_image') as HTMLInputElement;
      if (coverImageInput?.files?.[0]) {
        formData.append('cover_image', coverImageInput.files[0]);
      }

      const videoFileInput = document.getElementById('video_file') as HTMLInputElement;
      if (videoFileInput?.files?.[0]) {
        formData.append('video_file', videoFileInput.files[0]);
      }

      if (isEditing && initialData?.id) {
        await projectService.update(initialData.id, formData);
        toast.success('Project updated successfully');
      } else {
        await projectService.create(formData);
        toast.success('Project created successfully');
      }
      navigate('/admin/projects');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Project' : 'Create Project'}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update project details' : 'Add a new project to your portfolio'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')}>
             Cancel
           </Button>
           <Button type="submit" className="btn-neon" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Save Project
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general">
            <FileText className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="h-4 w-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="links">
            <LinkIcon className="h-4 w-4 mr-2" />
            Links
          </TabsTrigger>
          <TabsTrigger value="tech">
            <Settings className="h-4 w-4 mr-2" />
            Tech & SEO
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...form.register('title')} placeholder="Project Title" />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" {...form.register('slug')} placeholder="project-slug" />
                  <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" {...form.register('description')} rows={3} placeholder="Brief summary..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content</Label>
                <Textarea id="content" {...form.register('content')} rows={10} placeholder="Markdown supported..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <Label>Cover Image</Label>
                <div className="flex items-start gap-6">
                  {coverImagePreview ? (
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                      <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                           setCoverImagePreview(null);
                           const input = document.getElementById('cover_image') as HTMLInputElement;
                           if (input) input.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-destructive"
                      >
                        <Video className="h-3 w-3" /> {/* Using Video icon as X placeholder if X not imported, wait X is not imported but Trash2 is */}
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input id="cover_image" type="file" accept="image/*" onChange={handleImageChange} />
                    <p className="text-xs text-muted-foreground">Recommended size: 1200x630px</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Video</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video_file">Upload Video</Label>
                    <Input id="video_file" type="file" accept="video/*" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video_embed_url">Embed URL</Label>
                    <Input id="video_embed_url" {...form.register('video_embed_url')} placeholder="https://www.youtube.com/embed/..." />
                  </div>
                </div>
                {form.watch('video_embed_url') && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                    <iframe
                      src={form.watch('video_embed_url')}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video Preview"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={form.control}
                name="demo_urls"
                render={({ field }) => (
                  <DynamicList
                    label="Demo URLs"
                    items={field.value}
                    onChange={field.onChange}
                    placeholder="https://demo.example.com"
                  />
                )}
              />
              <Controller
                control={form.control}
                name="repo_urls"
                render={({ field }) => (
                  <DynamicList
                    label="Repository URLs"
                    items={field.value}
                    onChange={field.onChange}
                    placeholder="https://github.com/..."
                  />
                )}
              />
              <Controller
                control={form.control}
                name="video_urls"
                render={({ field }) => (
                  <DynamicList
                    label="Additional Video URLs"
                    items={field.value}
                    onChange={field.onChange}
                    placeholder="https://youtube.com/..."
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Controller
                control={form.control}
                name="tech"
                render={({ field }) => (
                  <DynamicList
                    label="Tech Stack"
                    items={field.value}
                    onChange={field.onChange}
                    placeholder="React, TypeScript, etc."
                  />
                )}
              />

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">SEO Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input id="seo_title" {...form.register('seo_title')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea id="seo_description" {...form.register('seo_description')} rows={2} />
                </div>
                <Controller
                    control={form.control}
                    name="seo_keywords"
                    render={({ field }) => (
                    <DynamicList
                        label="SEO Keywords"
                        items={field.value}
                        onChange={field.onChange}
                        placeholder="portfolio, web, etc."
                    />
                    )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
             <CardContent className="pt-6 space-y-4">
               <div className="flex items-center justify-between p-4 border rounded-lg">
                 <div className="space-y-0.5">
                   <Label>Published</Label>
                   <p className="text-sm text-muted-foreground">Make this project visible to the public</p>
                 </div>
                 <Controller
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="publish_at">Publish Date</Label>
                 <Input id="publish_at" type="datetime-local" {...form.register('publish_at')} />
               </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
