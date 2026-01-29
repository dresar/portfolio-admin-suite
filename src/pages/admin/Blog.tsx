import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Search,
  Loader2,
  Tag
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useBlogPosts, useBlogCategories } from '@/hooks/queries/useBlog';
import { BlogPost } from '@/types';

const Blog = () => {
  const { posts, isLoading: isPostsLoading, createBlogPost, updateBlogPost, deleteBlogPost } = useBlogPosts();
  const { categories, isLoading: isCategoriesLoading } = useBlogCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const openEditDialog = (post?: BlogPost) => {
    setEditingPost(
      post
        ? { ...post }
        : {
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            is_published: false,
            category: null,
            tags: [],
          }
    );
    setCoverImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    if (!editingPost.title || !editingPost.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
        const data = { ...editingPost };
        if (coverImageFile) {
            // @ts-ignore
            data.coverImageFile = coverImageFile;
        }

        if (editingPost.id) {
            await updateBlogPost({ id: editingPost.id, data });
            toast.success('Post updated successfully');
        } else {
            await createBlogPost(data);
            toast.success('Post created successfully');
        }
        setDialogOpen(false);
        setEditingPost(null);
    } catch (error) {
        toast.error('Failed to save post');
    }
  };

  const handleDelete = async () => {
    if (postToDelete) {
      try {
        await deleteBlogPost(postToDelete);
        toast.success('Post deleted');
        setPostToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const isLoading = isPostsLoading || isCategoriesLoading;

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">Manage your blog content</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </motion.div>

        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>

        {filteredPosts.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No posts found"
            description="Start writing your first blog post."
            action={{ label: 'New Post', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden card-hover group flex flex-col h-full"
              >
                <div className="relative h-48 bg-muted">
                    {post.coverImage ? (
                        <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <FileText className="h-10 w-10" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openEditDialog(post)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                            setPostToDelete(post.id);
                            setDeleteDialogOpen(true);
                        }}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <Badge 
                        className="absolute bottom-2 left-2"
                        variant={post.is_published ? "default" : "secondary"}
                    >
                        {post.is_published ? "Published" : "Draft"}
                    </Badge>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg line-clamp-2 mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                        {post.excerpt || post.content.substring(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views_count || 0}
                        </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost?.id ? 'Edit' : 'New'} Blog Post</DialogTitle>
                <DialogDescription>
                  Write and publish your content.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={editingPost?.title || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Post Title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                            value={editingPost?.slug || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="post-url-slug"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Excerpt</Label>
                        <Textarea
                            value={editingPost?.excerpt || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Short summary..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Content (Markdown)</Label>
                        <Textarea
                            value={editingPost?.content || ''}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your post here..."
                            className="min-h-[400px] font-mono"
                        />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span>Published</span>
                            <Switch
                                checked={editingPost?.is_published || false}
                                onCheckedChange={(c) => setEditingPost(prev => ({ ...prev, is_published: c }))}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={editingPost?.category?.toString() || '0'}
                            onValueChange={(v) => setEditingPost(prev => ({ ...prev, category: v === '0' ? null : parseInt(v) }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                     <div className="space-y-2">
                        <Label>Cover Image</Label>
                         <div className="flex flex-col items-center gap-2 border-2 border-dashed rounded-lg p-4">
                             {editingPost?.coverImage ? (
                                 <img src={editingPost.coverImage} className="w-full h-32 object-cover rounded" />
                             ) : (
                                 <div className="text-muted-foreground text-sm">No Image</div>
                             )}
                             <Input 
                                type="file" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setCoverImageFile(file);
                                }}
                             />
                         </div>
                    </div>
                    
                     <div className="space-y-2">
                        <Label>Tags (Comma separated)</Label>
                        <Input
                             value={editingPost?.tags?.join(', ') || ''}
                             onChange={(e) => {
                                 const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                 setEditingPost(prev => ({ ...prev, tags }));
                             }}
                             placeholder="react, typescript, tutorial"
                        />
                    </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                  {editingPost?.id ? 'Save Changes' : 'Create Post'}
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Post"
          description="Are you sure you want to delete this post?"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default Blog;
