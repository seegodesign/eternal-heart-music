import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string(),
    date: z.coerce.date(),
    readTime: z.string().optional(),
    coverImage: z.string(),
    gradient: z.enum(['amber', 'sage', 'ocean']).default('amber'),
  }),
});

const releases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/releases' }),
  schema: z.object({
    title: z.string(),
    year: z.string().or(z.number()),
    type: z.string(),
    description: z.string(),
    hue: z.enum(['amber', 'sage', 'ocean']),
    artwork: z.string(),
    bandcamp: z.string().url(),
    spotify: z.string().url(),
    showOnHomepage: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    location: z.string(),
    type: z.string(),
    spots: z.string(),
    isPast: z.boolean().default(false),
    ctaLabel: z.string().default('Reserve'),
    ctaUrl: z.string().default('/contact'),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().default('General'),
    sortOrder: z.number().default(100),
    active: z.boolean().default(true),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    source: z.string().optional(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(100),
  }),
});

const soundTherapy = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/music-therapy' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    category: z.string().optional(),
    audience: z.string().optional(),
    sortOrder: z.number().default(100),
    isFeatured: z.boolean().default(false),
  }),
});

export const collections = {
  journal,
  releases,
  events,
  faq,
  testimonials,
  soundTherapy,
};
