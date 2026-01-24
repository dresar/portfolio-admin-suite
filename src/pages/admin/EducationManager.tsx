import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  GraduationCap,
  Edit,
  Trash2,
  Calendar,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ImagePreview } from '@/components/admin/ImagePreview';
import { useAdminStore, type Education } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const EducationManager = () => {
  const { education, addEducation, updateEducation, deleteEducation } = useAdminStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);
  const [editingEducation, setEditingEducation] = useState<Partial<Education> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);

  const openEditDialog = (edu?: Education) => {
    setEditingEducation(
      edu
        ? { ...edu }
        : {
            institution: '',
            degree: '',
            field: '',
            startDate: `${currentYear}-09-01`,
            endDate: `${currentYear}-06-30`,
            gpa: '',
            logo: '',
            attachments: [],
            gallery: [],
          }
    );
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingEducation) return;

    if (!editingEducation.institution || !editingEducation.degree) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingEducation.id) {
      updateEducation(editingEducation.id, editingEducation);
      toast.success('Education updated successfully');
    } else {
      addEducation(editingEducation as Omit<Education, 'id'>);
      toast.success('Education added successfully');
    }
    setDialogOpen(false);
    setEditingEducation(null);
  };

  const handleDelete = () => {
    if (educationToDelete) {
      deleteEducation(educationToDelete);
      toast.success('Education deleted');
      setEducationToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'attachments' | 'gallery' | 'logo') => {
      e.preventDefault();
      setIsDragging(false);
      setIsGalleryDragging(false);

      // Simulate file upload with placeholder images
      const mockUrls = [
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      ];

      const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];

      if (type === 'logo') {
        setEditingEducation((prev) => ({ ...prev, logo: randomUrl }));
        toast.success('Logo uploaded (simulated)');
      } else {
        setEditingEducation((prev) => ({
          ...prev,
          [type]: [...(prev?.[type] || []), randomUrl],
        }));
        toast.success(`File added to ${type} (simulated)`);
      }
    },
    []
  );

  const removeFromArray = (type: 'attachments' | 'gallery', index: number) => {
    setEditingEducation((prev) => ({
      ...prev,
      [type]: prev?.[type]?.filter((_, i) => i !== index) || [],
    }));
  };

  const sortedEducation = [...education].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  );

  const FormContent = () => (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Institution Logo</Label>
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => handleDrop(e, 'logo')}
        >
          {editingEducation?.logo ? (
            <div className="flex items-center justify-center gap-4">
              <img
                src={editingEducation.logo}
                alt="Logo"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingEducation((prev) => ({ ...prev, logo: '' }))}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="py-4">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop logo here, or click to browse
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="institution">Institution Name *</Label>
          <Input
            id="institution"
            placeholder="e.g., University of Technology"
            value={editingEducation?.institution || ''}
            onChange={(e) =>
              setEditingEducation((prev) => ({ ...prev, institution: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="degree">Degree *</Label>
          <Input
            id="degree"
            placeholder="e.g., Bachelor of Science"
            value={editingEducation?.degree || ''}
            onChange={(e) =>
              setEditingEducation((prev) => ({ ...prev, degree: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="field">Field of Study</Label>
          <Input
            id="field"
            placeholder="e.g., Computer Science"
            value={editingEducation?.field || ''}
            onChange={(e) =>
              setEditingEducation((prev) => ({ ...prev, field: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA / Score</Label>
          <Input
            id="gpa"
            placeholder="e.g., 3.8"
            value={editingEducation?.gpa || ''}
            onChange={(e) =>
              setEditingEducation((prev) => ({ ...prev, gpa: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Year</Label>
          <Select
            value={editingEducation?.startDate?.split('-')[0] || ''}
            onValueChange={(v) =>
              setEditingEducation((prev) => ({ ...prev, startDate: `${v}-09-01` }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Graduation Year</Label>
          <Select
            value={editingEducation?.endDate?.split('-')[0] || ''}
            onValueChange={(v) =>
              setEditingEducation((prev) => ({ ...prev, endDate: `${v}-06-30` }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attachments (Ijazah/Transcript) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Attachments (Ijazah / Transcript)
        </Label>
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center transition-colors',
            'border-border hover:border-primary/50'
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'attachments')}
        >
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop documents here
          </p>
        </div>
        {editingEducation?.attachments && editingEducation.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {editingEducation.attachments.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromArray('attachments', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Campus Gallery
        </Label>
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center transition-colors',
            isGalleryDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsGalleryDragging(true);
          }}
          onDragLeave={() => setIsGalleryDragging(false)}
          onDrop={(e) => handleDrop(e, 'gallery')}
        >
          <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop campus photos here
          </p>
        </div>
        {editingEducation?.gallery && editingEducation.gallery.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {editingEducation.gallery.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromArray('gallery', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Education</h1>
            <p className="text-muted-foreground mt-1">Manage your educational background</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </motion.div>

        {/* Education Cards */}
        {sortedEducation.length === 0 ? (
          <EmptyState
            icon="graduation-cap"
            title="No education added"
            description="Add your educational background to showcase your qualifications"
            action={{ label: 'Add Education', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedEducation.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden card-hover group"
              >
                {/* Gallery Preview or Placeholder */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
                  {edu.gallery && edu.gallery.length > 0 ? (
                    <img
                      src={edu.gallery[0]}
                      alt="Campus"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <GraduationCap className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  
                  {/* Logo */}
                  {edu.logo && (
                    <div className="absolute bottom-0 left-4 translate-y-1/2">
                      <img
                        src={edu.logo}
                        alt={edu.institution}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-background shadow-lg"
                      />
                    </div>
                  )}
                </div>

                <div className={cn('p-4', edu.logo && 'pt-8')}>
                  <h3 className="font-semibold text-lg">{edu.institution}</h3>
                  <p className="text-primary font-medium">{edu.degree}</p>
                  {edu.field && (
                    <p className="text-sm text-muted-foreground">{edu.field}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {edu.startDate.split('-')[0]} - {edu.endDate.split('-')[0]}
                    </Badge>
                    {edu.gpa && (
                      <Badge variant="outline">GPA: {edu.gpa}</Badge>
                    )}
                  </div>

                  {/* Attachments indicator */}
                  {edu.attachments && edu.attachments.length > 0 && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {edu.attachments.length} attachment(s)
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(edu)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setEducationToDelete(edu.id);
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
                <DrawerTitle>{editingEducation?.id ? 'Edit' : 'Add'} Education</DrawerTitle>
                <DrawerDescription>
                  {editingEducation?.id ? 'Update your education details' : 'Add a new education entry'}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 overflow-y-auto max-h-[60vh]">
                <FormContent />
              </div>
              <DrawerFooter>
                <Button onClick={handleSave} className="btn-neon">
                  {editingEducation?.id ? 'Save Changes' : 'Add Education'}
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
                <DialogTitle>{editingEducation?.id ? 'Edit' : 'Add'} Education</DialogTitle>
                <DialogDescription>
                  {editingEducation?.id ? 'Update your education details' : 'Add a new education entry'}
                </DialogDescription>
              </DialogHeader>
              <FormContent />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                  {editingEducation?.id ? 'Save Changes' : 'Add Education'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Education"
          description="Are you sure you want to delete this education entry? This action cannot be undone."
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default EducationManager;
