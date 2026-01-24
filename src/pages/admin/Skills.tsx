import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Code2, Brain, Wrench } from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useAdminStore, type Skill } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryIcons = { technical: Code2, soft: Brain, tools: Wrench };
const categoryColors = { technical: 'bg-primary/20 text-primary', soft: 'bg-accent/20 text-accent', tools: 'bg-success/20 text-success' };

const Skills = () => {
  const { skills, addSkill, updateSkill, deleteSkill } = useAdminStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const groupedSkills = skills.reduce((acc, skill) => {
    acc[skill.category] = [...(acc[skill.category] || []), skill];
    return acc;
  }, {} as Record<string, Skill[]>);

  const handleSave = () => {
    if (!editingSkill?.name) return toast.error('Please enter a skill name');
    if (editingSkill.id) {
      updateSkill(editingSkill.id, editingSkill);
      toast.success('Skill updated');
    } else {
      addSkill({ name: editingSkill.name, level: editingSkill.level || 50, category: editingSkill.category || 'technical' });
      toast.success('Skill added');
    }
    setEditDialogOpen(false);
    setEditingSkill(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skills</h1>
            <p className="text-muted-foreground mt-1">Manage your skills and expertise</p>
          </div>
          <Button onClick={() => { setEditingSkill({ category: 'technical', level: 50 }); setEditDialogOpen(true); }} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />Add Skill
          </Button>
        </motion.div>

        {skills.length === 0 ? (
          <EmptyState icon="file" title="No skills" description="Add your first skill" action={{ label: 'Add Skill', onClick: () => { setEditingSkill({ category: 'technical', level: 50 }); setEditDialogOpen(true); } }} />
        ) : (
          <div className="grid gap-6">
            {(['technical', 'soft', 'tools'] as const).map((category) => {
              const Icon = categoryIcons[category];
              const items = groupedSkills[category] || [];
              if (items.length === 0) return null;
              return (
                <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={cn('p-2 rounded-lg', categoryColors[category])}><Icon className="h-5 w-5" /></div>
                    <h3 className="font-semibold capitalize">{category} Skills</h3>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {items.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-4">
                        <span className="w-32 font-medium truncate">{skill.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{skill.level}%</span>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingSkill(skill); setEditDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(skill.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSkill?.id ? 'Edit Skill' : 'Add Skill'}</DialogTitle></DialogHeader>
          {editingSkill && (
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editingSkill.name || ''} onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })} placeholder="React, Python..." /></div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={editingSkill.category} onValueChange={(v) => setEditingSkill({ ...editingSkill, category: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="technical">Technical</SelectItem><SelectItem value="soft">Soft Skills</SelectItem><SelectItem value="tools">Tools</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Proficiency: {editingSkill.level}%</Label><Slider value={[editingSkill.level || 50]} onValueChange={([v]) => setEditingSkill({ ...editingSkill, level: v })} max={100} step={5} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="btn-neon">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Skill" description="Are you sure?" onConfirm={() => { deleteSkill(deleteId!); setDeleteId(null); toast.success('Deleted'); }} confirmText="Delete" variant="destructive" />
    </DashboardLayout>
  );
};

export default Skills;
