import api from '../lib/api';
import { 
  SiteSettings, 
  Profile, 
  SocialLink, 
  HomeContent, 
  AboutContent 
} from '../types';

// Site Settings
export const getSiteSettings = async () => {
  const response = await api.get<SiteSettings>('/settings/');
  return response.data;
};

export const updateSiteSettings = async (data: Partial<SiteSettings>) => {
  const response = await api.post<SiteSettings>('/settings/', data);
  return response.data;
};

// Profile
export const getProfile = async () => {
  const response = await api.get<Profile>('/profile/');
  return response.data;
};

export const updateProfile = async (data: Partial<Profile> & { 
  heroImageFile?: File; 
  aboutImageFile?: File; 
  resumeFile?: File; 
}) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key as keyof typeof data];
    if (value !== undefined && value !== null) {
      if (key === 'role' || key === 'stats') {
        // If it's an object/array, stringify it if the backend expects a JSON string or if it's a file
        // Backend 'role' is TextField but used as JSON in frontend?
        // Model says: role = models.TextField(blank=True, default='[]')
        // So we should send it as a string if it's an array, or just string.
        if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
        } else {
             formData.append(key, value as string);
        }
      } else {
        formData.append(key, value as string | Blob);
      }
    }
  });

  // Backend create/update logic handles partial updates on existing singleton
  const response = await api.post<Profile>('/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Social Links
export const getSocialLinks = async () => {
  const response = await api.get<SocialLink[]>('/social-links/');
  return response.data;
};

export const createSocialLink = async (data: Omit<SocialLink, 'id'>) => {
  const response = await api.post<SocialLink>('/social-links/', data);
  return response.data;
};

export const updateSocialLink = async (id: number, data: Partial<SocialLink>) => {
  const response = await api.patch<SocialLink>(`/social-links/${id}/`, data);
  return response.data;
};

export const deleteSocialLink = async (id: number) => {
  await api.delete(`/social-links/${id}/`);
};

// Home Content
export const getHomeContent = async () => {
  const response = await api.get<HomeContent>('/home-content/');
  return response.data;
};

export const updateHomeContent = async (data: Partial<HomeContent> & { heroImageFile?: File }) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    const value = data[key as keyof typeof data];
    if (value !== undefined && value !== null) {
       formData.append(key, value as string | Blob);
    }
  });
  
  const response = await api.post<HomeContent>('/home-content/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// About Content
export const getAboutContent = async () => {
  const response = await api.get<AboutContent>('/about-content/');
  return response.data;
};

export const updateAboutContent = async (data: Partial<AboutContent> & { aboutImageFile?: File }) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    const value = data[key as keyof typeof data];
    if (value !== undefined && value !== null) {
       formData.append(key, value as string | Blob);
    }
  });

  const response = await api.post<AboutContent>('/about-content/', formData, {
     headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
