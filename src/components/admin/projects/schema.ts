import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  categoryId: z.string().optional(), // We'll convert to number on submit
  tech: z.array(z.string()).default([]),
  demo_urls: z.array(z.string()).default([]),
  repo_urls: z.array(z.string()).default([]),
  video_urls: z.array(z.string()).default([]),
  featured_links: z.array(z.object({
    label: z.string(),
    url: z.string().url('Invalid URL'),
  })).default([]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  publish_at: z.string().optional(),
  video_embed_url: z.string().optional(),
  cover_image_url: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
