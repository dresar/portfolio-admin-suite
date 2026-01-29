import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { ProjectForm } from '@/components/admin/projects/ProjectForm';
import { Loader2 } from 'lucide-react';

export default function EditProject() {
  const { id } = useParams();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getOne(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-96 items-center justify-center text-destructive">
        Failed to load project
      </div>
    );
  }

  return <ProjectForm initialData={project} isEditing />;
}
