import { useState, useMemo, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  MoreHorizontal,
  GripVertical,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useProjects, useUpdateProject, useDeleteProject } from '@/hooks/queries/useProjects';
import { projectService } from '@/services/project.service';
import { Project } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Local state for reordering (to be optimistic)
  const [localProjects, setLocalProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (projects.length > 0) {
      setLocalProjects(projects);
    }
  }, [projects]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
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
    let result = (reorderMode ? localProjects : projects).filter((p) => {
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

    // Sort only if NOT in reorder mode
    if (!reorderMode) {
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
    }

    return result;
  }, [projects, localProjects, debouncedSearch, statusFilter, sortField, sortDirection, reorderMode]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / rowsPerPage);
  const paginatedProjects = useMemo(() => {
    // In reorder mode, show all or handle pagination carefully. 
    // Usually reordering is easier without pagination or on a single page.
    // For now, we allow pagination but reorder only affects current page items if we drag?
    // Actually, Reorder.Group expects the full list or the list being rendered.
    // If we paginate, we can only reorder within the page.
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedProjects.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedProjects, currentPage, rowsPerPage]);

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

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('ID copied to clipboard');
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

  const handleReorder = async (newOrder: Project[]) => {
      // Optimistically update local state
      // We need to update the full list, not just the paginated slice
      // But if we are reordering the paginated slice, we need to merge it back
      // This is complex with pagination.
      // For simplicity, if in reorder mode, we might want to disable pagination or show all.
      // Or just update the current page's items in the local state.
      
      // Let's assume we update the paginated slice in the local state
      const startIndex = (currentPage - 1) * rowsPerPage;
      const newLocalProjects = [...localProjects];
      newLocalProjects.splice(startIndex, newOrder.length, ...newOrder);
      
      setLocalProjects(newLocalProjects);

      // Call API
      const orderedIds = newOrder.map(p => p.id);
      try {
          await projectService.reorder(orderedIds);
          // Don't toast on every drag, maybe on settle or debounce? 
          // Reorder.Group calls onReorder on every change.
          // Ideally we should have a save button or debounce.
          // But user asked for "realtime".
      } catch (error) {
          console.error("Failed to reorder", error);
      }
  };

  if (isLoading) {
      return <DashboardLayout><div className="flex justify-center p-8">Loading projects...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Project"
            description="Are you sure you want to delete this project? This action cannot be undone."
            onConfirm={selectedIds.length > 0 ? handleDeleteSelected : handleDeleteSingle}
        />

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
              onClick={() => {
                  setReorderMode(!reorderMode);
                  if (reorderMode) {
                      // When exiting reorder mode, refresh data to ensure sync
                      queryClient.invalidateQueries({ queryKey: ['projects'] });
                  }
              }}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {reorderMode ? 'Done Reordering' : 'Reorder'}
            </Button>
            <Button onClick={() => navigate('/admin/projects/new')} className="btn-neon">
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

        {/* Projects List */}
        {filteredAndSortedProjects.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No projects found"
            description="Create your first project or adjust your filters"
            action={{ label: 'Add Project', onClick: () => navigate('/admin/projects/new') }}
          />
        ) : reorderMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-4"
          >
            <Reorder.Group
              axis="y"
              values={paginatedProjects}
              onReorder={handleReorder}
              className="space-y-2"
            >
              {paginatedProjects.map((project) => (
                <Reorder.Item
                  key={project.id}
                  value={project}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:border-primary/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={project.cover_image_url || project.cover_image || ''}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                        {project.description}
                    </p>
                  </div>
                  <Badge className={project.is_published ? 'badge-success' : 'badge-muted'}>
                    {project.is_published ? 'published' : 'draft'}
                  </Badge>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <p className="text-center text-sm text-muted-foreground mt-4">
                Drag items to reorder. Changes are saved automatically.
            </p>
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
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                            <img
                                src={project.cover_image_url || project.cover_image || ''}
                                alt={project.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                                }}
                            />
                          </div>
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
                            <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                    setProjectToDelete(project.id);
                                    setDeleteDialogOpen(true);
                                }}
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

            {/* Mobile Cards (simplified) */}
            <div className="lg:hidden space-y-4">
              {paginatedProjects.map((project) => (
                <div key={project.id} className="glass p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
                        <img
                            src={project.cover_image_url || project.cover_image || ''}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                            }}
                        />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{project.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className={project.is_published ? 'badge-success' : 'badge-muted'}>
                          {project.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                            setProjectToDelete(project.id);
                            setDeleteDialogOpen(true);
                        }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
