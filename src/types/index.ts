export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  last_login?: string | null;
}

export interface SiteSettings {
  id: number;
  theme: string;
  seoTitle: string;
  seoDesc: string;
  cdn_url: string | null;
  maintenanceMode: boolean;
  maintenance_end_time: string | null;
  ai_provider: 'gemini' | 'groq';
}

export interface HomeContent {
  id: number;
  greeting_id: string;
  greeting_en: string;
  roles_id: string; // JSON string
  roles_en: string; // JSON string
  heroImage: string | null;
  heroImageFile?: File | null;
}

export interface AboutContent {
  id: number;
  short_description_id: string;
  short_description_en: string;
  long_description_id: string;
  long_description_en: string;
  aboutImage: string | null;
  aboutImageFile?: File | null;
}

export interface Profile {
  id: number;
  fullName: string;
  greeting: string;
  role: string; // JSON string or simple string depending on usage
  bio: string;
  heroImage: string | null;
  heroImageFile?: File | null;
  aboutImage: string | null;
  aboutImageFile?: File | null;
  resumeUrl: string | null;
  resumeFile?: File | null;
  location: string;
  email: string;
  phone: string;
  stats_project_count: string | null;
  stats_exp_years: string | null;
  map_embed_url: string | null;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string | null;
}

export interface SkillCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Skill {
  id: number;
  name: string;
  category: number | null;
  category_details?: SkillCategory; // If nested serializer used
  percentage: number;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string | null;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa: string | null;
  logo: string | null;
  description: string | null;
  attachments: any[]; // JSONField
  gallery: any[]; // JSONField
}

export interface CertificateCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
  image: string | null;
  verified: boolean;
  credentialId: string | null;
  category: number | null;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProjectImage {
  id: number;
  image: string | null;
  image_url: string | null;
  caption: string;
  order: number;
}

export interface ProjectSummary {
  id: number;
  content: string;
  version: number;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_image: string | null;
  cover_image_url: string | null;
  video_file: string | null;
  video_embed_url: string | null;
  tech: string[]; // JSONField
  category: number | null;
  demo_urls: string[]; // JSONField - List of URLs
  repo_urls: string[]; // JSONField - List of URLs
  video_urls: string[]; // JSONField - List of URLs
  featured_links: { label: string; url: string }[]; // JSONField
  seo_title: string;
  seo_description: string;
  seo_keywords: string[]; // JSONField
  order: number;
  createdAt: string;
  updatedAt: string;
  is_published: boolean;
  publish_at: string | null;
  images?: ProjectImage[];
  summaries?: ProjectSummary[];
  views_count?: number; // Optional as backend doesn't seem to have it, but Projects.tsx uses it. We might mock it or remove usage.
}

export interface Message {
  id: number;
  senderName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
}

export interface WATemplate {
  id: number;
  template_name: string;
  template_content: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockEntry {
  id: number;
  type: 'ip' | 'domain';
  value: string;
  reason: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface BlogPost {
  id: number;
  category: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverImageFile?: File | null;
  tags: string[];
  is_published: boolean;
  publish_at: string | null;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface AIKey {
  id: number;
  provider: 'gemini' | 'groq';
  key: string;
  is_active: boolean;
  created_at: string;
  last_used: string | null;
  error_count: number;
}
