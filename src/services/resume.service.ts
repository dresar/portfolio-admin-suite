import { api } from '@/lib/api';
import { Skill, SkillCategory, Experience, Education, Certificate, CertificateCategory } from '@/types';

export const resumeService = {
  // Skills
  getSkills: async (): Promise<Skill[]> => {
    const response = await api.get<Skill[]>('/skills/');
    return response.data;
  },
  createSkill: async (data: Partial<Skill>): Promise<Skill> => {
    const response = await api.post<Skill>('/skills/', data);
    return response.data;
  },
  updateSkill: async (id: number, data: Partial<Skill>): Promise<Skill> => {
    const response = await api.patch<Skill>(`/skills/${id}/`, data);
    return response.data;
  },
  deleteSkill: async (id: number): Promise<void> => {
    await api.delete(`/skills/${id}/`);
  },
  
  // Skill Categories
  getSkillCategories: async (): Promise<SkillCategory[]> => {
      const response = await api.get<SkillCategory[]>('/skill-categories/');
      return response.data;
  },
  createSkillCategory: async (data: Partial<SkillCategory>): Promise<SkillCategory> => {
      const response = await api.post<SkillCategory>('/skill-categories/', data);
      return response.data;
  },

  // Experience
  getExperiences: async (): Promise<Experience[]> => {
    const response = await api.get<Experience[]>('/experience/');
    return response.data;
  },
  createExperience: async (data: Partial<Experience>): Promise<Experience> => {
    const response = await api.post<Experience>('/experience/', data);
    return response.data;
  },
  updateExperience: async (id: number, data: Partial<Experience>): Promise<Experience> => {
    const response = await api.patch<Experience>(`/experience/${id}/`, data);
    return response.data;
  },
  deleteExperience: async (id: number): Promise<void> => {
    await api.delete(`/experience/${id}/`);
  },

  // Education
  getEducations: async (): Promise<Education[]> => {
    const response = await api.get<Education[]>('/education/');
    return response.data;
  },
  createEducation: async (data: Partial<Education>): Promise<Education> => {
    const response = await api.post<Education>('/education/', data);
    return response.data;
  },
  updateEducation: async (id: number, data: Partial<Education>): Promise<Education> => {
    const response = await api.patch<Education>(`/education/${id}/`, data);
    return response.data;
  },
  deleteEducation: async (id: number): Promise<void> => {
    await api.delete(`/education/${id}/`);
  },

  // Certificates
  getCertificates: async (): Promise<Certificate[]> => {
    const response = await api.get<Certificate[]>('/certificates/');
    return response.data;
  },
  createCertificate: async (data: Partial<Certificate>): Promise<Certificate> => {
    const response = await api.post<Certificate>('/certificates/', data);
    return response.data;
  },
  updateCertificate: async (id: number, data: Partial<Certificate>): Promise<Certificate> => {
    const response = await api.patch<Certificate>(`/certificates/${id}/`, data);
    return response.data;
  },
  deleteCertificate: async (id: number): Promise<void> => {
    await api.delete(`/certificates/${id}/`);
  },
  getCertificateCategories: async (): Promise<CertificateCategory[]> => {
      const response = await api.get<CertificateCategory[]>('/certificate-categories/');
      return response.data;
  }
};
