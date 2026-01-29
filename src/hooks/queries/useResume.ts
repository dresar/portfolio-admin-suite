import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '@/services/resume.service';
import { Skill, SkillCategory, Experience, Education, Certificate } from '@/types';

// Skills
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: resumeService.getSkills,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Skill> }) =>
      resumeService.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

// Skill Categories
export const useSkillCategories = () => {
    return useQuery({
        queryKey: ['skill-categories'],
        queryFn: resumeService.getSkillCategories,
    });
};

// Experience
export const useExperiences = () => {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: resumeService.getExperiences,
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Experience> }) =>
      resumeService.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
};

// Education
export const useEducations = () => {
  return useQuery({
    queryKey: ['educations'],
    queryFn: resumeService.getEducations,
  });
};

export const useCreateEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Education> }) =>
      resumeService.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations'] });
    },
  });
};

// Certificates
export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: resumeService.getCertificates,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.createCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Certificate> }) =>
      resumeService.updateCertificate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeService.deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useCertificateCategories = () => {
    return useQuery({
        queryKey: ['certificate-categories'],
        queryFn: resumeService.getCertificateCategories,
    });
};
