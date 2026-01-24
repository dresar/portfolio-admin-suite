import { useState, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Star,
  MoreHorizontal,
  ExternalLink,
  Github,
  GripVertical,
  Copy,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ImagePreview } from '@/components/admin/ImagePreview';
import { useAdminStore, type Project } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Projects = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    deleteProjects,
    toggleProjectStatus,
    toggleProjectFeatured,
    reorderProjects,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.order - b.order);
  }, [projects, searchQuery, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredProjects.map((p) => p.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleDeleteSelected = () => {
    deleteProjects(selectedIds);
    setSelectedIds([]);
    setDeleteDialogOpen(false);
    toast.success(`${selectedIds.length} project(s) deleted`);
  };

  const handleDeleteSingle = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
      toast.success('Project deleted');
    }
  };

  const handleSaveProject = () => {
    if (!editingProject) return;

    if (editingProject.id) {
      updateProject(editingProject.id, editingProject);
      toast.success('Project updated successfully');
    } else {
      addProject({
        title: editingProject.title || 'Untitled Project',
        description: editingProject.description || '',
        image: editingProject.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        tags: editingProject.tags || [],
        status: editingProject.status || 'draft',
        featured: editingProject.featured || false,
        views: 0,
        liveUrl: editingProject.liveUrl,
        githubUrl: editingProject.githubUrl,
      });
      toast.success('Project created successfully');
    }
    setEditDialogOpen(false);
    setEditingProject(null);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('ID copied to clipboard');
  };

  const openEditDialog = (project?: Project) => {
    setEditingProject(project ? { ...project } : { tags: [], status: 'draft', featured: false });
    setEditDialogOpen(true);
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
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your portfolio projects</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={reorderMode ? 'default' : 'outline'}
              onClick={() => setReorderMode(!reorderMode)}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {reorderMode ? 'Done' : 'Reorder'}
            </Button>
            <Button onClick={() => openEditDialog()} className="btn-neon">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 glass rounded-xl"
          >
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </motion.div>
        )}

        {/* Projects Table/Cards */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No projects found"
            description="Create your first project or adjust your filters"
            action={{ label: 'Add Project', onClick: () => openEditDialog() }}
          />
        ) : reorderMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-4"
          >
            <Reorder.Group
              axis="y"
              values={filteredProjects}
              onReorder={(newOrder) => reorderProjects(newOrder.map((p, i) => ({ ...p, order: i + 1 })))}
              className="space-y-2"
            >
              {filteredProjects.map((project) => (
                <Reorder.Item
                  key={project.id}
                  value={project}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.tags.slice(0, 3).join(', ')}</p>
                  </div>
                  <Badge className={project.status === 'published' ? 'badge-success' : 'badge-muted'}>
                    {project.status}
                  </Badge>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block glass rounded-xl overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedIds.length === filteredProjects.length && filteredProjects.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Project</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tags</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Featured</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Views</th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-border table-row-hover"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedIds.includes(project.id)}
                          onCheckedChange={(checked) => handleSelect(project.id, !!checked)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ImagePreview
                            src={project.image}
                            alt={project.title}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <button
                              onClick={() => handleCopyId(project.id)}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              ID: {project.id}
                              {copiedId === project.id ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Switch
                          checked={project.status === 'published'}
                          onCheckedChange={() => {
                            toggleProjectStatus(project.id);
                            toast.success(`Project ${project.status === 'published' ? 'unpublished' : 'published'}`);
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            toggleProjectFeatured(project.id);
                            toast.success(`Project ${project.featured ? 'unfeatured' : 'featured'}`);
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            project.featured
                              ? "bg-warning/20 text-warning"
                              : "hover:bg-muted text-muted-foreground"
                          )}
                        >
                          <Star className={cn("h-5 w-5", project.featured && "fill-current")} />
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{project.views.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {project.liveUrl && (
                              <DropdownMenuItem asChild>
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Live
                                </a>
                              </DropdownMenuItem>
                            )}
                            {project.githubUrl && (
                              <DropdownMenuItem asChild>
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4 mr-2" />
                                  GitHub
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setProjectToDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid gap-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 card-hover"
                >
                  <div className="flex gap-4">
                    <Checkbox
                      checked={selectedIds.includes(project.id)}
                      onCheckedChange={(checked) => handleSelect(project.id, !!checked)}
                    />
                    <ImagePreview
                      src={project.image}
                      alt={project.title}
                      className="w-20 h-20 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium truncate">{project.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setProjectToDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge className={project.status === 'published' ? 'badge-success' : 'badge-muted'}>
                          {project.status}
                        </Badge>
                        <button
                          onClick={() => toggleProjectFeatured(project.id)}
                          className={cn(
                            "p-1",
                            project.featured ? "text-warning" : "text-muted-foreground"
                          )}
                        >
                          <Star className={cn("h-4 w-4", project.featured && "fill-current")} />
                        </button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {project.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject?.id ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {editingProject?.id ? 'Update your project details' : 'Create a new portfolio project'}
            </DialogDescription>
          </DialogHeader>

          {editingProject && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingProject.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="Project title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Project description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={editingProject.image || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {editingProject.image && (
                  <img
                    src={editingProject.image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editingProject.tags?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://project.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={editingProject.status === 'published'}
                    onCheckedChange={(checked) =>
                      setEditingProject({ ...editingProject, status: checked ? 'published' : 'draft' })
                    }
                  />
                  <Label htmlFor="status">Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={editingProject.featured}
                    onCheckedChange={(checked) =>
                      setEditingProject({ ...editingProject, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} className="btn-neon">
              {editingProject?.id ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Selected Projects"
        description={`Are you sure you want to delete ${selectedIds.length} project(s)? This action cannot be undone.`}
        onConfirm={handleDeleteSelected}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDeleteSingle}
        confirmText="Delete"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default Projects;
