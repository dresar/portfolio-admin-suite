import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initialize dark mode
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: 'published' | 'draft';
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  liveUrl?: string;
  githubUrl?: string;
  order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: 'technical' | 'soft' | 'tools';
  icon?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  image?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  image?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface Activity {
  id: string;
  type: 'message' | 'project' | 'subscriber' | 'system';
  title: string;
  description: string;
  timestamp: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  metaKeywords: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroRoles: string[];
  heroImage: string;
  aboutBio: string;
  cvUrl: string;
  maintenanceMode: boolean;
  defaultTheme: 'dark' | 'light' | 'system';
  accentColor: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Stats {
  totalViews: number;
  totalMessages: number;
  totalProjects: number;
  totalSubscribers: number;
  viewsChange: number;
  messagesChange: number;
  projectsChange: number;
  subscribersChange: number;
  weeklyVisitors: { day: string; visitors: number; pageViews: number }[];
  monthlyVisitors: { month: string; visitors: number; pageViews: number }[];
  deviceStats: { name: string; value: number; color: string }[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

interface AdminState {
  // Data
  projects: Project[];
  messages: Message[];
  subscribers: Subscriber[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  certificates: Certificate[];
  socialLinks: SocialLink[];
  activities: Activity[];
  settings: SiteSettings;
  profile: AdminProfile;
  stats: Stats;
  notifications: Notification[];
  
  // Theme
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  
  // Actions - Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  deleteProjects: (ids: string[]) => void;
  toggleProjectStatus: (id: string) => void;
  toggleProjectFeatured: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  
  // Actions - Messages
  markMessageRead: (id: string) => void;
  markMessageUnread: (id: string) => void;
  archiveMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  deleteMessages: (ids: string[]) => void;
  
  // Actions - Subscribers
  addSubscriber: (email: string) => void;
  deleteSubscriber: (id: string) => void;
  exportSubscribers: () => string;
  
  // Actions - Skills
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  
  // Actions - Experience
  addExperience: (exp: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  
  // Actions - Education
  addEducation: (edu: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  
  // Actions - Certificates
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, data: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  
  // Actions - Social Links
  addSocialLink: (link: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (id: string, data: Partial<SocialLink>) => void;
  deleteSocialLink: (id: string) => void;
  
  // Actions - Settings
  updateSettings: (data: Partial<SiteSettings>) => void;
  updateProfile: (data: Partial<AdminProfile>) => void;
  
  // Actions - Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  
  // Actions - Activity
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  
  // Actions - UI
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Export
  exportAllData: () => string;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial mock data
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform with React, Node.js, and MongoDB. Features include user authentication, product management, cart functionality, and payment integration.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    status: 'published',
    featured: true,
    views: 1247,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    order: 1,
  },
  {
    id: '2',
    title: 'AI Dashboard Analytics',
    description: 'Real-time analytics dashboard powered by machine learning. Visualize data trends, predictions, and insights with interactive charts.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['Python', 'TensorFlow', 'React', 'D3.js'],
    status: 'published',
    featured: true,
    views: 892,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
    liveUrl: 'https://example.com',
    order: 2,
  },
  {
    id: '3',
    title: 'Mobile Fitness App',
    description: 'Cross-platform fitness tracking app with workout plans, progress tracking, and social features.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    tags: ['React Native', 'Firebase', 'Redux'],
    status: 'draft',
    featured: false,
    views: 456,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-18T16:00:00Z',
    order: 3,
  },
  {
    id: '4',
    title: 'Smart Home IoT System',
    description: 'IoT-based smart home automation system with voice control and mobile app integration.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    tags: ['Arduino', 'Raspberry Pi', 'Python', 'MQTT'],
    status: 'published',
    featured: false,
    views: 678,
    createdAt: '2024-03-01T07:00:00Z',
    updatedAt: '2024-03-05T13:00:00Z',
    order: 4,
  },
  {
    id: '5',
    title: 'Blockchain Voting System',
    description: 'Decentralized voting platform ensuring transparent and tamper-proof elections using blockchain technology.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    tags: ['Solidity', 'Ethereum', 'Web3.js', 'React'],
    status: 'draft',
    featured: false,
    views: 234,
    createdAt: '2024-03-10T06:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z',
    order: 5,
  },
];

const initialMessages: Message[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    subject: 'Project Collaboration Inquiry',
    message: 'Hi! I came across your portfolio and was really impressed with your work. I would love to discuss a potential collaboration on an exciting new project. Would you be available for a call this week?',
    read: false,
    archived: false,
    createdAt: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    subject: 'Job Opportunity - Senior Developer',
    message: 'We are looking for a talented developer to join our team. Your skills and experience match what we are looking for. Please let me know if you would be interested in learning more about this opportunity.',
    read: false,
    archived: false,
    createdAt: '2024-01-19T15:45:00Z',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@startup.io',
    subject: 'Freelance Project Offer',
    message: 'Hello! We need help building a new web application for our startup. Based on your portfolio, you seem like the perfect fit. Budget is flexible for the right candidate.',
    read: true,
    archived: false,
    createdAt: '2024-01-18T09:00:00Z',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@design.co',
    subject: 'Design Partnership',
    message: 'I love your development work and think we could create amazing things together. Would you be open to a design-development partnership?',
    read: true,
    archived: true,
    createdAt: '2024-01-15T14:20:00Z',
  },
];

const initialSubscribers: Subscriber[] = [
  { id: '1', email: 'subscriber1@email.com', subscribedAt: '2024-01-10T08:00:00Z', status: 'active' },
  { id: '2', email: 'subscriber2@email.com', subscribedAt: '2024-01-12T10:30:00Z', status: 'active' },
  { id: '3', email: 'subscriber3@email.com', subscribedAt: '2024-01-14T14:15:00Z', status: 'active' },
  { id: '4', email: 'subscriber4@email.com', subscribedAt: '2024-01-16T09:45:00Z', status: 'unsubscribed' },
  { id: '5', email: 'subscriber5@email.com', subscribedAt: '2024-01-18T11:20:00Z', status: 'active' },
];

const initialSkills: Skill[] = [
  { id: '1', name: 'React', level: 95, category: 'technical', icon: 'code' },
  { id: '2', name: 'TypeScript', level: 90, category: 'technical', icon: 'code' },
  { id: '3', name: 'Node.js', level: 85, category: 'technical', icon: 'server' },
  { id: '4', name: 'Python', level: 80, category: 'technical', icon: 'code' },
  { id: '5', name: 'Communication', level: 90, category: 'soft', icon: 'message-circle' },
  { id: '6', name: 'Problem Solving', level: 95, category: 'soft', icon: 'lightbulb' },
  { id: '7', name: 'Figma', level: 75, category: 'tools', icon: 'pen-tool' },
  { id: '8', name: 'Git', level: 90, category: 'tools', icon: 'git-branch' },
];

const initialExperiences: Experience[] = [
  {
    id: '1',
    company: 'Tech Corp',
    role: 'Senior Frontend Developer',
    description: 'Leading the frontend development team and architecting scalable web applications.',
    startDate: '2022-06-01',
    endDate: null,
    current: true,
    bullets: [
      'Led a team of 5 developers in building a React-based dashboard',
      'Improved application performance by 40%',
      'Implemented CI/CD pipelines for automated testing',
    ],
  },
  {
    id: '2',
    company: 'StartupXYZ',
    role: 'Full Stack Developer',
    description: 'Built and maintained multiple web applications from scratch.',
    startDate: '2020-03-01',
    endDate: '2022-05-31',
    current: false,
    bullets: [
      'Developed RESTful APIs using Node.js and Express',
      'Created responsive UIs with React and Tailwind CSS',
      'Managed databases with PostgreSQL and MongoDB',
    ],
  },
];

const initialEducation: Education[] = [
  {
    id: '1',
    institution: 'University of Technology',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: '2016-09-01',
    endDate: '2020-06-30',
    gpa: '3.8',
  },
];

const initialCertificates: Certificate[] = [
  {
    id: '1',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: '2023-06-15',
    expiryDate: '2026-06-15',
    credentialUrl: 'https://aws.amazon.com/certification',
  },
  {
    id: '2',
    name: 'Google Cloud Professional',
    issuer: 'Google',
    issueDate: '2023-03-20',
    credentialUrl: 'https://cloud.google.com/certification',
  },
];

const initialSocialLinks: SocialLink[] = [
  { id: '1', platform: 'GitHub', url: 'https://github.com', icon: 'github' },
  { id: '2', platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
  { id: '3', platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
  { id: '4', platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
];

const initialActivities: Activity[] = [
  { id: '1', type: 'message', title: 'New Message', description: 'John Smith sent you a message', timestamp: '2024-01-20T10:30:00Z' },
  { id: '2', type: 'project', title: 'Project Updated', description: 'E-Commerce Platform was updated', timestamp: '2024-01-20T14:30:00Z' },
  { id: '3', type: 'subscriber', title: 'New Subscriber', description: 'subscriber5@email.com joined your newsletter', timestamp: '2024-01-18T11:20:00Z' },
  { id: '4', type: 'system', title: 'Backup Complete', description: 'System backup completed successfully', timestamp: '2024-01-17T02:00:00Z' },
];

const initialSettings: SiteSettings = {
  siteName: 'Portfolio',
  siteDescription: 'Full-Stack Developer Portfolio showcasing innovative projects and technical expertise.',
  metaKeywords: ['developer', 'portfolio', 'react', 'typescript', 'web development'],
  heroTitle: "Hi, I'm Alex",
  heroSubtitle: 'Building digital experiences that matter',
  heroRoles: ['Full-Stack Developer', 'UI/UX Designer', 'Problem Solver'],
  heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  aboutBio: 'I am a passionate developer with 5+ years of experience building web applications. I love turning ideas into reality through code.',
  cvUrl: '/cv.pdf',
  maintenanceMode: false,
  defaultTheme: 'dark',
  accentColor: '#06b6d4',
};

const initialProfile: AdminProfile = {
  name: 'Alex Developer',
  email: 'alex@portfolio.dev',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  role: 'Administrator',
};

const initialStats: Stats = {
  totalViews: 24580,
  totalMessages: 127,
  totalProjects: 5,
  totalSubscribers: 892,
  viewsChange: 12.5,
  messagesChange: 8.2,
  projectsChange: 0,
  subscribersChange: 15.3,
  weeklyVisitors: [
    { day: 'Mon', visitors: 420, pageViews: 1250 },
    { day: 'Tue', visitors: 380, pageViews: 1100 },
    { day: 'Wed', visitors: 520, pageViews: 1600 },
    { day: 'Thu', visitors: 490, pageViews: 1450 },
    { day: 'Fri', visitors: 610, pageViews: 1800 },
    { day: 'Sat', visitors: 340, pageViews: 980 },
    { day: 'Sun', visitors: 290, pageViews: 820 },
  ],
  monthlyVisitors: [
    { month: 'Jan', visitors: 12000, pageViews: 36000 },
    { month: 'Feb', visitors: 15000, pageViews: 45000 },
    { month: 'Mar', visitors: 18000, pageViews: 54000 },
    { month: 'Apr', visitors: 16500, pageViews: 49500 },
    { month: 'May', visitors: 21000, pageViews: 63000 },
    { month: 'Jun', visitors: 24580, pageViews: 73740 },
  ],
  deviceStats: [
    { name: 'Desktop', value: 58, color: '#06b6d4' },
    { name: 'Mobile', value: 35, color: '#8b5cf6' },
    { name: 'Tablet', value: 7, color: '#10b981' },
  ],
};

const initialNotifications: Notification[] = [
  { id: '1', title: 'New Message', message: 'You received a new message from John Smith', type: 'info', read: false, timestamp: '2024-01-20T10:30:00Z' },
  { id: '2', title: 'Project Published', message: 'E-Commerce Platform is now live', type: 'success', read: false, timestamp: '2024-01-19T15:00:00Z' },
  { id: '3', title: 'System Update', message: 'System maintenance scheduled for tonight', type: 'warning', read: true, timestamp: '2024-01-18T09:00:00Z' },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial State
      projects: initialProjects,
      messages: initialMessages,
      subscribers: initialSubscribers,
      skills: initialSkills,
      experiences: initialExperiences,
      education: initialEducation,
      certificates: initialCertificates,
      socialLinks: initialSocialLinks,
      activities: initialActivities,
      settings: initialSettings,
      profile: initialProfile,
      stats: initialStats,
      notifications: initialNotifications,
      theme: 'dark',
      sidebarCollapsed: false,

      // Project Actions
      addProject: (project) => set((state) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: state.projects.length + 1,
        };
        return {
          projects: [...state.projects, newProject],
          stats: { ...state.stats, totalProjects: state.stats.totalProjects + 1 },
        };
      }),

      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        ),
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        stats: { ...state.stats, totalProjects: state.stats.totalProjects - 1 },
      })),

      deleteProjects: (ids) => set((state) => ({
        projects: state.projects.filter((p) => !ids.includes(p.id)),
        stats: { ...state.stats, totalProjects: state.stats.totalProjects - ids.length },
      })),

      toggleProjectStatus: (id) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() } : p
        ),
      })),

      toggleProjectFeatured: (id) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, featured: !p.featured, updatedAt: new Date().toISOString() } : p
        ),
      })),

      reorderProjects: (projects) => set({ projects }),

      // Message Actions
      markMessageRead: (id) => set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
      })),

      markMessageUnread: (id) => set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, read: false } : m)),
      })),

      archiveMessage: (id) => set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, archived: true } : m)),
      })),

      deleteMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
      })),

      deleteMessages: (ids) => set((state) => ({
        messages: state.messages.filter((m) => !ids.includes(m.id)),
      })),

      // Subscriber Actions
      addSubscriber: (email) => set((state) => ({
        subscribers: [
          ...state.subscribers,
          { id: generateId(), email, subscribedAt: new Date().toISOString(), status: 'active' },
        ],
        stats: { ...state.stats, totalSubscribers: state.stats.totalSubscribers + 1 },
      })),

      deleteSubscriber: (id) => set((state) => ({
        subscribers: state.subscribers.filter((s) => s.id !== id),
        stats: { ...state.stats, totalSubscribers: state.stats.totalSubscribers - 1 },
      })),

      exportSubscribers: () => {
        const { subscribers } = get();
        const csv = ['Email,Subscribed At,Status', ...subscribers.map((s) => `${s.email},${s.subscribedAt},${s.status}`)].join('\n');
        return csv;
      },

      // Skill Actions
      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, { ...skill, id: generateId() }],
      })),

      updateSkill: (id, data) => set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? { ...s, ...data } : s)),
      })),

      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter((s) => s.id !== id),
      })),

      // Experience Actions
      addExperience: (exp) => set((state) => ({
        experiences: [...state.experiences, { ...exp, id: generateId() }],
      })),

      updateExperience: (id, data) => set((state) => ({
        experiences: state.experiences.map((e) => (e.id === id ? { ...e, ...data } : e)),
      })),

      deleteExperience: (id) => set((state) => ({
        experiences: state.experiences.filter((e) => e.id !== id),
      })),

      // Education Actions
      addEducation: (edu) => set((state) => ({
        education: [...state.education, { ...edu, id: generateId() }],
      })),

      updateEducation: (id, data) => set((state) => ({
        education: state.education.map((e) => (e.id === id ? { ...e, ...data } : e)),
      })),

      deleteEducation: (id) => set((state) => ({
        education: state.education.filter((e) => e.id !== id),
      })),

      // Certificate Actions
      addCertificate: (cert) => set((state) => ({
        certificates: [...state.certificates, { ...cert, id: generateId() }],
      })),

      updateCertificate: (id, data) => set((state) => ({
        certificates: state.certificates.map((c) => (c.id === id ? { ...c, ...data } : c)),
      })),

      deleteCertificate: (id) => set((state) => ({
        certificates: state.certificates.filter((c) => c.id !== id),
      })),

      // Social Link Actions
      addSocialLink: (link) => set((state) => ({
        socialLinks: [...state.socialLinks, { ...link, id: generateId() }],
      })),

      updateSocialLink: (id, data) => set((state) => ({
        socialLinks: state.socialLinks.map((l) => (l.id === id ? { ...l, ...data } : l)),
      })),

      deleteSocialLink: (id) => set((state) => ({
        socialLinks: state.socialLinks.filter((l) => l.id !== id),
      })),

      // Settings Actions
      updateSettings: (data) => set((state) => ({
        settings: { ...state.settings, ...data },
      })),

      updateProfile: (data) => set((state) => ({
        profile: { ...state.profile, ...data },
      })),

      // Notification Actions
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),

      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [
          { ...notification, id: generateId(), timestamp: new Date().toISOString(), read: false },
          ...state.notifications,
        ],
      })),

      // Activity Actions
      addActivity: (activity) => set((state) => ({
        activities: [
          { ...activity, id: generateId(), timestamp: new Date().toISOString() },
          ...state.activities.slice(0, 19),
        ],
      })),

      // UI Actions
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
        return { theme: newTheme };
      }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Export
      exportAllData: () => {
        const state = get();
        return JSON.stringify({
          projects: state.projects,
          messages: state.messages,
          subscribers: state.subscribers,
          skills: state.skills,
          experiences: state.experiences,
          education: state.education,
          certificates: state.certificates,
          socialLinks: state.socialLinks,
          settings: state.settings,
          profile: state.profile,
        }, null, 2);
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        projects: state.projects,
        messages: state.messages,
        subscribers: state.subscribers,
        skills: state.skills,
        experiences: state.experiences,
        education: state.education,
        certificates: state.certificates,
        socialLinks: state.socialLinks,
        settings: state.settings,
        profile: state.profile,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
