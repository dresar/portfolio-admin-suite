import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Briefcase,
  Edit,
  Trash2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience } from '@/hooks/queries/useResume';
import { Experience } from '@/types';

const ExperienceManager = () => {
  const { data: experiences = [], isLoading } = useExperiences();
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);

  const openEditDialog = (experience?: Experience) => {
    setEditingExperience(
      experience
        ? { ...experience }
        : { 
            company: '', 
            role: '', 
            description: '', 
            startDate: new Date().toISOString().split('T')[0],
            endDate: null,
            isCurrent: false,
            location: '',
          }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingExperience) return;

    if (!editingExperience.company || !editingExperience.role) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
        if (editingExperience.id) {
            await updateMutation.mutateAsync({ id: editingExperience.id, data: editingExperience });
            toast.success('Experience updated successfully');
        } else {
            await createMutation.mutateAsync(editingExperience);
            toast.success('Experience added successfully');
        }
        setDialogOpen(false);
        setEditingExperience(null);
    } catch (error) {
        toast.error('Failed to save experience');
    }
  };

  const handleDelete = async () => {
    if (experienceToDelete) {
      await deleteMutation.mutateAsync(experienceToDelete);
      toast.success('Experience deleted');
      setExperienceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  if (isLoading) {
      return <DashboardLayout><div className="flex justify-center p-8">Loading...</div></DashboardLayout>;
  }

  const FormContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role / Position *</Label>
          <Input
            id="role"
            placeholder="e.g., Senior Frontend Developer"
            value={editingExperience?.role || ''}
            onChange={(e) =>
              setEditingExperience((prev) => ({ ...prev, role: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            placeholder="e.g., Tech Corp"
            value={editingExperience?.company || ''}
            onChange={(e) =>
              setEditingExperience((prev) => ({ ...prev, company: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA or Remote"
            value={editingExperience?.location || ''}
            onChange={(e) =>
              setEditingExperience((prev) => ({ ...prev, location: e.target.value }))
            }
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {editingExperience?.startDate
                  ? format(new Date(editingExperience.startDate), 'MMM yyyy')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={editingExperience?.startDate ? new Date(editingExperience.startDate) : undefined}
                onSelect={(date) =>
                  setEditingExperience((prev) => ({
                    ...prev,
                    startDate: date?.toISOString().split('T')[0] || '',
                  }))
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={editingExperience?.isCurrent}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editingExperience?.isCurrent
                    ? 'Present'
                    : editingExperience?.endDate
                    ? format(new Date(editingExperience.endDate), 'MMM yyyy')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editingExperience?.endDate ? new Date(editingExperience.endDate) : undefined}
                  onSelect={(date) =>
                    setEditingExperience((prev) => ({
                      ...prev,
                      endDate: date?.toISOString().split('T')[0] || null,
                    }))
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
              <Checkbox
                id="current"
                checked={editingExperience?.isCurrent || false}
                onCheckedChange={(checked) =>
                  setEditingExperience((prev) => ({
                    ...prev,
                    isCurrent: !!checked,
                    endDate: checked ? null : prev?.endDate,
                  }))
                }
              />
              <Label htmlFor="current" className="text-sm cursor-pointer">
                I currently work here
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your role and achievements..."
          value={editingExperience?.description || ''}
          onChange={(e) => setEditingExperience(prev => ({ ...prev, description: e.target.value }))}
          rows={5}
        />
      </div>
    </div>
  );

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
            <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
            <p className="text-muted-foreground mt-1">Manage your work history and career timeline</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </motion.div>

        {/* Experience List */}
        {sortedExperiences.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="No experience added"
            description="Add your work experience to showcase your career journey"
            action={{ label: 'Add Experience', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="space-y-4">
            {sortedExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 card-hover relative overflow-hidden"
              >
                {exp.isCurrent && (
                  <div className="absolute top-0 right-0 bg-success text-success-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Current
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{exp.role}</h3>
                    </div>
                    
                    <p className="text-muted-foreground font-medium">{exp.company}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(exp.startDate), 'MMM yyyy')} -{' '}
                        {exp.isCurrent ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : ''}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                        {exp.description}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(exp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setExperienceToDelete(exp.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>{editingExperience?.id ? 'Edit' : 'Add'} Experience</DialogTitle>
                <DialogDescription>
                    {editingExperience?.id ? 'Update your work experience' : 'Add a new work experience to your timeline'}
                </DialogDescription>
                </DialogHeader>
                <FormContent />
                <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                    {editingExperience?.id ? 'Save Changes' : 'Add Experience'}
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Experience"
          description="Are you sure you want to delete this experience? This action cannot be undone."
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default ExperienceManager;
