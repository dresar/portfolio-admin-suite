import { useState, useMemo, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  ExternalLink,
  Github,
  GripVertical,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ImagePreview } from '@/components/admin/ImagePreview';
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
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/queries/useProjects';
import { Project } from '@/types';

type SortField = 'title' | 'created_at' | 'is_published' | 'views_count';
type SortDirection = 'asc' | 'desc';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Projects = () => {
  const { data: projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-primary" />
    );
  };

  // Filter, search, and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.tech || []).some((t) => t.toLowerCase().includes(debouncedSearch.toLowerCase()));
      
      const isPublished = p.is_published;
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'published' && isPublished) ||
                            (statusFilter === 'draft' && !isPublished);
      return matchesSearch && matchesStatus;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'is_published':
          comparison = (a.is_published === b.is_published) ? 0 : a.is_published ? 1 : -1;
          break;
        case 'views_count':
          comparison = (a.views_count || 0) - (b.views_count || 0);
          break;
        default:
          comparison = a.order - b.order;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, debouncedSearch, statusFilter, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / rowsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedProjects.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedProjects, currentPage, rowsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, rowsPerPage]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedProjects.map((p) => p.id) : []);
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await deleteProjectMutation.mutateAsync(id);
    }
    setSelectedIds([]);
    setDeleteDialogOpen(false);
    toast.success(`${selectedIds.length} project(s) deleted`);
  };

  const handleDeleteSingle = async () => {
    if (projectToDelete) {
      await deleteProjectMutation.mutateAsync(projectToDelete);
      setProjectToDelete(null);
      toast.success('Project deleted');
    }
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;

    try {
      if (editingProject.id) {
        await updateProjectMutation.mutateAsync({ id: editingProject.id, data: editingProject });
        toast.success('Project updated successfully');
      } else {
        await createProjectMutation.mutateAsync({
            ...editingProject,
            order: 0,
            views_count: 0,
            slug: editingProject.title?.toLowerCase().replace(/\s+/g, '-') || 'new-project',
        });
        toast.success('Project created successfully');
      }
      setEditDialogOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save project');
    }
  };

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('ID copied to clipboard');
  };

  const openEditDialog = (project?: Project) => {
    if (project) {
        setEditingProject({ ...project });
    } else {
        setEditingProject({
            tech: [],
            is_published: false,
            demo_urls: [],
            repo_urls: []
        });
    }
    setEditDialogOpen(true);
  };

  const toggleProjectStatus = async (project: Project) => {
      try {
          await updateProjectMutation.mutateAsync({
              id: project.id,
              data: { is_published: !project.is_published }
          });
          toast.success(`Project ${!project.is_published ? 'published' : 'unpublished'}`);
      } catch (error) {
          toast.error('Failed to update status');
      }
  };

  if (isLoading) {
      return <DashboardLayout><div className="flex justify-center p-8">Loading projects...</div></DashboardLayout>;
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
        {filteredAndSortedProjects.length === 0 ? (
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
              values={filteredAndSortedProjects}
              onReorder={(newOrder) => {
                  // Reorder implementation required in backend if strictly needed
                  // For now just local reorder logic would be complex with pagination
                  // Maybe just show toast "Reordering..."
              }}
              className="space-y-2"
            >
              {filteredAndSortedProjects.map((project) => (
                <Reorder.Item
                  key={project.id}
                  value={project}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <img
                    src={project.cover_image || ''}
                    alt={project.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.tech_stack?.slice(0, 3).join(', ')}</p>
                  </div>
                  <Badge className={project.is_published ? 'badge-success' : 'badge-muted'}>
                    {project.is_published ? 'published' : 'draft'}
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
                        checked={selectedIds.length === paginatedProjects.length && paginatedProjects.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Project {getSortIcon('title')}
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tech Stack</th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('is_published')}
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Status {getSortIcon('is_published')}
                      </button>
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('views_count')}
                        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Views {getSortIcon('views_count')}
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project) => (
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
                            src={project.cover_image || ''}
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
                          {project.tech?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tech && project.tech.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tech.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Switch
                          checked={project.is_published}
                          onCheckedChange={() => toggleProjectStatus(project)}
                        />
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{(project.views_count || 0).toLocaleString()}</span>
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
                            {project.demo_urls && project.demo_urls.length > 0 && (
                              <DropdownMenuItem asChild>
                                <a href={project.demo_urls[0]} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Live
                                </a>
                              </DropdownMenuItem>
                            )}
                            {project.repo_urls && project.repo_urls.length > 0 && (
                              <DropdownMenuItem asChild>
                                <a href={project.repo_urls[0]} target="_blank" rel="noopener noreferrer">
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
              {paginatedProjects.map((project, index) => (
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
                      src={project.cover_image || ''}
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
                        {project.tech?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge className={project.is_published ? 'badge-success' : 'badge-muted'}>
                          {project.is_published ? 'published' : 'draft'}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {project.views_count} views
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 glass rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={(v) => setRowsPerPage(Number(v))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground ml-4">
                    Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'btn-neon' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
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
                <Label htmlFor="description">Content (Markdown)</Label>
                <Textarea
                  id="description"
                  value={editingProject.content || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, content: e.target.value })}
                  placeholder="Project content..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image URL</Label>
                <Input
                  id="image"
                  value={editingProject.cover_image || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, cover_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {editingProject.cover_image && (
                  <img
                    src={editingProject.cover_image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tech Stack (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editingProject.tech?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tech: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live Demo URL</Label>
                  <Input
                    id="liveUrl"
                    value={editingProject.demo_urls?.[0] || ''}
                    onChange={(e) => {
                       const newUrls = e.target.value ? [e.target.value] : [];
                       setEditingProject({
                         ...editingProject,
                         demo_urls: newUrls
                       });
                    }}
                    placeholder="https://project.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub Repo URL</Label>
                  <Input
                    id="githubUrl"
                    value={editingProject.repo_urls?.[0] || ''}
                    onChange={(e) => {
                       const newUrls = e.target.value ? [e.target.value] : [];
                       setEditingProject({
                         ...editingProject,
                         repo_urls: newUrls
                       });
                    }}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={editingProject.is_published}
                    onCheckedChange={(checked) =>
                      setEditingProject({ ...editingProject, is_published: checked })
                    }
                  />
                  <Label htmlFor="status">Published</Label>
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
