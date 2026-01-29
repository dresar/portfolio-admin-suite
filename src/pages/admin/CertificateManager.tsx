import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Award,
  Edit,
  Trash2,
  Calendar,
  Upload,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ImagePreview } from '@/components/admin/ImagePreview';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCertificates, useCreateCertificate, useUpdateCertificate, useDeleteCertificate } from '@/hooks/queries/useResume';
import { Certificate } from '@/types';

const CertificateManager = () => {
  const { data: certificates = [], isLoading } = useCertificates();
  const createMutation = useCreateCertificate();
  const updateMutation = useUpdateCertificate();
  const deleteMutation = useDeleteCertificate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<number | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Partial<Certificate> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTestingLink, setIsTestingLink] = useState(false);

  const openEditDialog = (cert?: Certificate) => {
    setEditingCertificate(
      cert
        ? { ...cert }
        : {
            name: '',
            issuer: '',
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: null,
            credentialUrl: '',
            image: '',
            verified: false,
            credentialId: '',
          }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCertificate) return;

    if (!editingCertificate.name || !editingCertificate.issuer) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
        if (editingCertificate.id) {
            await updateMutation.mutateAsync({ id: editingCertificate.id, data: editingCertificate });
            toast.success('Certificate updated successfully');
        } else {
            await createMutation.mutateAsync(editingCertificate);
            toast.success('Certificate added successfully');
        }
        setDialogOpen(false);
        setEditingCertificate(null);
    } catch (error) {
        toast.error('Failed to save certificate');
    }
  };

  const handleDelete = async () => {
    if (certificateToDelete) {
      await deleteMutation.mutateAsync(certificateToDelete);
      toast.success('Certificate deleted');
      setCertificateToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Prompt for URL as simulation
    const url = prompt("Enter Image URL");
    if (url) {
        setEditingCertificate((prev) => ({ ...prev, image: url }));
    }
  }, []);

  const testCredentialLink = async () => {
    if (!editingCertificate?.credentialUrl) {
      toast.error('Please enter a credential URL first');
      return;
    }

    setIsTestingLink(true);
    
    // Simulate link verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock verification result
    const isValid = editingCertificate.credentialUrl.startsWith('https://');
    
    setEditingCertificate((prev) => ({ ...prev, verified: isValid }));
    
    if (isValid) {
      toast.success('Credential link verified successfully!');
    } else {
      toast.error('Could not verify credential link. Make sure it uses HTTPS.');
    }
    
    setIsTestingLink(false);
  };

  const isExpired = (expiryDate?: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const sortedCertificates = [...certificates].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  if (isLoading) {
      return <DashboardLayout><div className="flex justify-center p-8">Loading...</div></DashboardLayout>;
  }

  const FormContent = () => (
    <div className="space-y-6">
      {/* Certificate Image Upload */}
      <div className="space-y-2">
        <Label>Certificate Image (URL)</Label>
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
          {editingCertificate?.image ? (
            <div className="relative">
              <img
                src={editingCertificate.image}
                alt="Certificate"
                className="w-full h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setEditingCertificate((prev) => ({ ...prev, image: '' }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center" onClick={() => {
                const url = prompt("Enter Image URL");
                if (url) setEditingCertificate(prev => ({...prev, image: url}));
            }}>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Click to add Image URL
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Certificate Name *</Label>
          <Input
            id="name"
            placeholder="e.g., AWS Solutions Architect"
            value={editingCertificate?.name || ''}
            onChange={(e) =>
              setEditingCertificate((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuer">Issuing Organization *</Label>
          <Input
            id="issuer"
            placeholder="e.g., Amazon Web Services"
            value={editingCertificate?.issuer || ''}
            onChange={(e) =>
              setEditingCertificate((prev) => ({ ...prev, issuer: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Issue Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {editingCertificate?.issueDate
                  ? format(new Date(editingCertificate.issueDate), 'MMM dd, yyyy')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={editingCertificate?.issueDate ? new Date(editingCertificate.issueDate) : undefined}
                onSelect={(date) =>
                  setEditingCertificate((prev) => ({
                    ...prev,
                    issueDate: date?.toISOString().split('T')[0] || '',
                  }))
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Expiry Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {editingCertificate?.expiryDate
                  ? format(new Date(editingCertificate.expiryDate), 'MMM dd, yyyy')
                  : 'No expiry'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={editingCertificate?.expiryDate ? new Date(editingCertificate.expiryDate) : undefined}
                onSelect={(date) =>
                  setEditingCertificate((prev) => ({
                    ...prev,
                    expiryDate: date?.toISOString().split('T')[0],
                  }))
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {editingCertificate?.expiryDate && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setEditingCertificate((prev) => ({ ...prev, expiryDate: null }))}
            >
              Clear expiry date
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="credentialUrl">Credential URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="credentialUrl"
              placeholder="https://www.credly.com/badges/..."
              className="pl-10"
              value={editingCertificate?.credentialUrl || ''}
              onChange={(e) =>
                setEditingCertificate((prev) => ({ 
                  ...prev, 
                  credentialUrl: e.target.value,
                  verified: false,
                }))
              }
            />
          </div>
          <Button
            variant="outline"
            onClick={testCredentialLink}
            disabled={isTestingLink}
          >
            {isTestingLink ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                />
                Testing...
              </span>
            ) : (
              'Test Link'
            )}
          </Button>
        </div>
        {editingCertificate?.verified && (
          <div className="flex items-center gap-1 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Credential verified
          </div>
        )}
      </div>
      
      <div className="space-y-2">
          <Label htmlFor="credentialId">Credential ID</Label>
          <Input
            id="credentialId"
            placeholder="ID-12345"
            value={editingCertificate?.credentialId || ''}
            onChange={(e) =>
              setEditingCertificate((prev) => ({ ...prev, credentialId: e.target.value }))
            }
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
            <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            <p className="text-muted-foreground mt-1">Manage your professional certifications</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
        </motion.div>

        {/* Certificate Grid */}
        {sortedCertificates.length === 0 ? (
          <EmptyState
            icon="award"
            title="No certificates added"
            description="Add your certifications to showcase your expertise"
            action={{ label: 'Add Certificate', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden card-hover group"
              >
                {/* Certificate Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ImagePreview
                    src={cert.image}
                    alt={cert.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {cert.verified && (
                      <Badge className="bg-success/90 text-success-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {isExpired(cert.expiryDate) && (
                      <Badge className="bg-destructive/90 text-destructive-foreground">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => openEditDialog(cert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {cert.credentialUrl && (
                      <Button
                        variant="secondary"
                        size="icon"
                        asChild
                      >
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setCertificateToDelete(cert.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cert.issuer}</p>
                  
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Issued {format(new Date(cert.issueDate), 'MMM yyyy')}</span>
                  </div>
                  
                  {cert.expiryDate && (
                    <div className={cn(
                      'flex items-center gap-2 mt-1 text-xs',
                      isExpired(cert.expiryDate) ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        {isExpired(cert.expiryDate) ? 'Expired' : 'Expires'}{' '}
                        {format(new Date(cert.expiryDate), 'MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>{editingCertificate?.id ? 'Edit' : 'Add'} Certificate</DialogTitle>
                <DialogDescription>
                    {editingCertificate?.id ? 'Update your certification' : 'Add a new certification'}
                </DialogDescription>
                </DialogHeader>
                <FormContent />
                <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                    {editingCertificate?.id ? 'Save Changes' : 'Add Certificate'}
                </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Certificate"
          description="Are you sure you want to delete this certificate? This action cannot be undone."
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default CertificateManager;
