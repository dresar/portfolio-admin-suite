import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Briefcase,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useAdminStore, type Experience, type EmploymentType } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
];

const typeColors: Record<EmploymentType, string> = {
  'full-time': 'bg-success/20 text-success border-success/30',
  'part-time': 'bg-warning/20 text-warning border-warning/30',
  'freelance': 'bg-primary/20 text-primary border-primary/30',
  'internship': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'contract': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const ExperienceManager = () => {
  const { experiences, addExperience, updateExperience, deleteExperience } = useAdminStore();
  const isMobile = useIsMobile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);
  const [bulletInput, setBulletInput] = useState('');

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
            current: false,
            bullets: [],
            type: 'full-time',
            location: '',
          }
    );
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingExperience) return;

    if (!editingExperience.company || !editingExperience.role) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingExperience.id) {
      updateExperience(editingExperience.id, editingExperience);
      toast.success('Experience updated successfully');
    } else {
      addExperience(editingExperience as Omit<Experience, 'id'>);
      toast.success('Experience added successfully');
    }
    setDialogOpen(false);
    setEditingExperience(null);
  };

  const handleDelete = () => {
    if (experienceToDelete) {
      deleteExperience(experienceToDelete);
      toast.success('Experience deleted');
      setExperienceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulletKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && bulletInput.trim()) {
      e.preventDefault();
      setEditingExperience((prev) => ({
        ...prev,
        bullets: [...(prev?.bullets || []), bulletInput.trim()],
      }));
      setBulletInput('');
    }
  };

  const removeBullet = (index: number) => {
    setEditingExperience((prev) => ({
      ...prev,
      bullets: prev?.bullets?.filter((_, i) => i !== index) || [],
    }));
  };

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Employment Type</Label>
          <Select
            value={editingExperience?.type || 'full-time'}
            onValueChange={(v) =>
              setEditingExperience((prev) => ({ ...prev, type: v as EmploymentType }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  disabled={editingExperience?.current}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editingExperience?.current
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
                checked={editingExperience?.current || false}
                onCheckedChange={(checked) =>
                  setEditingExperience((prev) => ({
                    ...prev,
                    current: !!checked,
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
        <Label>Key Responsibilities (Press Enter to add)</Label>
        <Input
          placeholder="Type a responsibility and press Enter..."
          value={bulletInput}
          onChange={(e) => setBulletInput(e.target.value)}
          onKeyDown={handleBulletKeyDown}
        />
        {editingExperience?.bullets && editingExperience.bullets.length > 0 && (
          <ul className="mt-3 space-y-2">
            {editingExperience.bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded-lg group"
              >
                <span className="text-primary mt-0.5">•</span>
                <span className="flex-1">{bullet}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeBullet(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
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
                {exp.current && (
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
                      <Badge className={cn('w-fit border', typeColors[exp.type])}>
                        {employmentTypes.find((t) => t.value === exp.type)?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground font-medium">{exp.company}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(exp.startDate), 'MMM yyyy')} -{' '}
                        {exp.current ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : ''}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
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

        {/* Edit Dialog/Drawer */}
        {isMobile ? (
          <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader>
                <DrawerTitle>{editingExperience?.id ? 'Edit' : 'Add'} Experience</DrawerTitle>
                <DrawerDescription>
                  {editingExperience?.id ? 'Update your work experience' : 'Add a new work experience to your timeline'}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 overflow-y-auto max-h-[60vh]">
                <FormContent />
              </div>
              <DrawerFooter>
                <Button onClick={handleSave} className="btn-neon">
                  {editingExperience?.id ? 'Save Changes' : 'Add Experience'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
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
        )}

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
