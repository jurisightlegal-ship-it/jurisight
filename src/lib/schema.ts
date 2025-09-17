import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  boolean,
  integer,
  pgEnum,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';

// Enums
export const statusEnum = pgEnum('status', [
  'DRAFT', 
  'IN_REVIEW', 
  'NEEDS_REVISIONS', 
  'APPROVED', 
  'PUBLISHED'
]);

export const roleEnum = pgEnum('role', [
  'CONTRIBUTOR',
  'EDITOR', 
  'ADMIN'
]);

export const legalSectionEnum = pgEnum('legal_section', [
  'CONSTITUTIONAL',
  'CORPORATE', 
  'CRIMINAL',
  'CIVIL',
  'ACADEMIC',
  'POLICY'
]);

// NextAuth.js required tables
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: varchar('image', { length: 255 }),
  // Jurisight specific fields
  role: roleEnum('role').default('CONTRIBUTOR').notNull(),
  bio: text('bio'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  userId: varchar('userId', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationTokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Legal sections table
export const legalSections = pgTable('legal_sections', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }).notNull(), // Hex color
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Articles table
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  dek: text('dek'), // Summary/subtitle
  body: text('body').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  status: statusEnum('status').default('DRAFT').notNull(),
  authorId: varchar('author_id', { length: 255 }).references(() => users.id).notNull(),
  sectionId: integer('section_id').references(() => legalSections.id).notNull(),
  readingTime: integer('reading_time'), // in minutes
  views: integer('views').default(0).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Article tags junction table
export const articleTags = pgTable('article_tags', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  tagId: integer('tag_id').references(() => tags.id).notNull(),
});

// Case citations table
export const caseCitations = pgTable('case_citations', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  court: varchar('court', { length: 255 }),
  citation: varchar('citation', { length: 255 }),
  year: integer('year'),
  url: varchar('url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Source links table
export const sourceLinks = pgTable('source_links', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Editorial comments table
export const editorialComments = pgTable('editorial_comments', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  editorId: varchar('editor_id', { length: 255 }).references(() => users.id).notNull(),
  comment: text('comment').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(), // internal vs for contributor
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  editorialComments: many(editorialComments),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  section: one(legalSections, {
    fields: [articles.sectionId],
    references: [legalSections.id],
  }),
  tags: many(articleTags),
  caseCitations: many(caseCitations),
  sourceLinks: many(sourceLinks),
  editorialComments: many(editorialComments),
}));

export const legalSectionsRelations = relations(legalSections, ({ many }) => ({
  articles: many(articles),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const caseCitationsRelations = relations(caseCitations, ({ one }) => ({
  article: one(articles, {
    fields: [caseCitations.articleId],
    references: [articles.id],
  }),
}));

export const sourceLinksRelations = relations(sourceLinks, ({ one }) => ({
  article: one(articles, {
    fields: [sourceLinks.articleId],
    references: [articles.id],
  }),
}));

export const editorialCommentsRelations = relations(editorialComments, ({ one }) => ({
  article: one(articles, {
    fields: [editorialComments.articleId],
    references: [articles.id],
  }),
  editor: one(users, {
    fields: [editorialComments.editorId],
    references: [users.id],
  }),
}));
