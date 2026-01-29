import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Code2, Brain, Wrench, Layers } from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSkills, useSkillCategories, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/hooks/queries/useResume';
import { Skill } from '@/types';

const Skills = () => {
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: categories = [], isLoading: categoriesLoading } = useSkillCategories();
  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();
  const deleteSkillMutation = useDeleteSkill();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const groupedSkills = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    // Initialize with known categories if any, or just empty
    categories.forEach(c => grouped[c.name] = []);
    
    skills.forEach(skill => {
        const catName = skill.category_details?.name || 'Uncategorized';
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(skill);
    });
    return grouped;
  }, [skills, categories]);

  const handleSave = async () => {
    if (!editingSkill?.name) return toast.error('Please enter a skill name');
    
    try {
        if (editingSkill.id) {
            await updateSkillMutation.mutateAsync({ id: editingSkill.id, data: editingSkill });
            toast.success('Skill updated');
        } else {
            await createSkillMutation.mutateAsync({
                ...editingSkill,
                percentage: editingSkill.percentage || 50,
                order: 0,
                icon: editingSkill.icon || 'code'
            });
            toast.success('Skill added');
        }
        setEditDialogOpen(false);
        setEditingSkill(null);
    } catch (error) {
        console.error(error);
        toast.error('Failed to save skill');
    }
  };

  const handleDelete = async () => {
      if (deleteId) {
          await deleteSkillMutation.mutateAsync(deleteId);
          setDeleteId(null);
          toast.success('Deleted');
      }
  };

  const isLoading = skillsLoading || categoriesLoading;

  if (isLoading) {
      return <DashboardLayout><div className="flex justify-center p-8">Loading skills...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skills</h1>
            <p className="text-muted-foreground mt-1">Manage your skills and expertise</p>
          </div>
          <Button onClick={() => { 
              setEditingSkill({ 
                  percentage: 50, 
                  category: categories.length > 0 ? categories[0].id : null 
              }); 
              setEditDialogOpen(true); 
          }} className="btn-neon">
            <Plus className="h-4 w-4 mr-2" />Add Skill
          </Button>
        </motion.div>

        {skills.length === 0 ? (
          <EmptyState icon="file" title="No skills" description="Add your first skill" action={{ label: 'Add Skill', onClick: () => { setEditingSkill({ percentage: 50 }); setEditDialogOpen(true); } }} />
        ) : (
          <div className="grid gap-6">
            {Object.entries(groupedSkills).map(([categoryName, items], index) => {
              if (items.length === 0 && categoryName === 'Uncategorized') return null;
              
              // Find category object for icon (optional, simple mapping for now)
              // In real app, category should have icon field from backend
              const categoryObj = categories.find(c => c.name === categoryName);
              
              return (
                <motion.div key={categoryName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <Layers className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold capitalize">{categoryName} Skills</h3>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {items.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-4">
                        <span className="w-32 font-medium truncate">{skill.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${skill.percentage}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{skill.percentage}%</span>
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
                <Select 
                    value={editingSkill.category?.toString()} 
                    onValueChange={(v) => setEditingSkill({ ...editingSkill, category: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                      {categories.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Proficiency: {editingSkill.percentage}%</Label><Slider value={[editingSkill.percentage || 50]} onValueChange={([v]) => setEditingSkill({ ...editingSkill, percentage: v })} max={100} step={5} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} className="btn-neon">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Skill" description="Are you sure?" onConfirm={handleDelete} confirmText="Delete" variant="destructive" />
    </DashboardLayout>
  );
};

export default Skills;
