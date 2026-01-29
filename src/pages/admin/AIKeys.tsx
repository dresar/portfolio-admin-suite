import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { useAIKeys } from '@/hooks/queries/useAI';
import { AIKey } from '@/types';

const AIKeys = () => {
  const { keys, isLoading, createAIKey, updateAIKey, deleteAIKey } = useAIKeys();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<number | null>(null);
  const [editingKey, setEditingKey] = useState<Partial<AIKey> | null>(null);

  const openEditDialog = (key?: AIKey) => {
    setEditingKey(
      key
        ? { ...key }
        : {
            provider: 'gemini',
            key: '',
            is_active: true,
          }
    );
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingKey) return;

    if (!editingKey.provider || !editingKey.key) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
        if (editingKey.id) {
            await updateAIKey({ id: editingKey.id, data: editingKey });
            toast.success('API Key updated successfully');
        } else {
            await createAIKey(editingKey as Omit<AIKey, 'id' | 'created_at' | 'last_used' | 'error_count'>);
            toast.success('API Key added successfully');
        }
        setDialogOpen(false);
        setEditingKey(null);
    } catch (error) {
        toast.error('Failed to save API Key');
    }
  };

  const handleDelete = async () => {
    if (keyToDelete) {
      try {
        await deleteAIKey(keyToDelete);
        toast.success('API Key deleted');
        setKeyToDelete(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast.error('Failed to delete API Key');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

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
            <h1 className="text-3xl font-bold tracking-tight">AI Keys</h1>
            <p className="text-muted-foreground mt-1">Manage API keys for AI providers (Gemini, Groq)</p>
          </div>
          <Button onClick={() => openEditDialog()} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
        </motion.div>

        {(!keys || keys.length === 0) ? (
          <EmptyState
            icon="key"
            title="No API Keys found"
            description="Add API keys to enable AI features like auto-translation and chat."
            action={{ label: 'Add API Key', onClick: () => openEditDialog() }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 card-hover group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(key)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        setKeyToDelete(key.id);
                        setDeleteDialogOpen(true);
                    }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Key className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{key.provider}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">
                            {key.key ? `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}` : 'Invalid Key'}
                        </span>
                        <button onClick={() => key.key && copyToClipboard(key.key)} className="hover:text-primary" disabled={!key.key}>
                            <Copy className="h-3 w-3" />
                        </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Errors</span>
                        <span className={key.error_count > 0 ? "text-destructive" : "text-muted-foreground"}>
                            {key.error_count}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Used</span>
                        <span>{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</span>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingKey?.id ? 'Edit' : 'Add'} API Key</DialogTitle>
                <DialogDescription>
                  Enter the API key details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                        value={editingKey?.provider || 'gemini'}
                        onValueChange={(v: 'gemini' | 'groq') => setEditingKey(prev => ({ ...prev, provider: v }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                        value={editingKey?.key || ''}
                        onChange={(e) => setEditingKey(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="Enter API Key"
                        type="password"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                        checked={editingKey?.is_active || false}
                        onCheckedChange={(c) => setEditingKey(prev => ({ ...prev, is_active: c }))}
                    />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-neon">
                  {editingKey?.id ? 'Save Changes' : 'Add Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete API Key"
          description="Are you sure you want to delete this API Key?"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
};

export default AIKeys;
