# Jurisight - Legal Knowledge Platform

> **Democratizing access to legal information and empowering the legal community in India**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🏛️ Overview

Jurisight is a comprehensive legal knowledge platform designed specifically for the Indian legal community. It provides a modern, accessible platform for legal professionals, students, and enthusiasts to share insights, access legal analysis, and stay updated with the latest developments in Indian law.

### Key Features

- **📚 Content Management System**: Create, edit, and manage legal articles with rich text editing
- **👥 Multi-Role User System**: Contributors, Editors, and Admins with role-based permissions
- **🔍 Advanced Search**: Search across articles, legal sections, and case citations
- **📊 Analytics Dashboard**: Track article performance, user engagement, and platform statistics
- **🏷️ Legal Categorization**: Organize content by legal sections (Constitutional, Corporate, Criminal, Civil, Academic, Policy)
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **🔐 Secure Authentication**: NextAuth.js with Supabase integration
- **📈 Real-time Updates**: Live data synchronization and user management

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0 with custom design system
- **UI Components**: shadcn/ui with Radix UI primitives
- **Rich Text Editor**: Tiptap with extensions for legal content
- **Animations**: Framer Motion and custom shader animations

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Supabase Auth
- **ORM**: Drizzle ORM (configured for Supabase)
- **File Storage**: Supabase Storage for media uploads
- **API**: Next.js API Routes with TypeScript

### Development & Deployment
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Build Tool**: Turbopack (Next.js 15)
- **Deployment**: Vercel-ready with environment configuration

## 📁 Project Structure

```
jurisight-blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── articles/      # Article management APIs
│   │   │   ├── auth/          # Authentication APIs
│   │   │   ├── dashboard/     # Dashboard APIs
│   │   │   ├── media/         # Media upload APIs
│   │   │   ├── sections/      # Legal sections APIs
│   │   │   └── tags/          # Tags management APIs
│   │   ├── articles/          # Public article pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Admin/Editor dashboard
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── providers/        # Context providers
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── supabase.ts       # Supabase client
│   │   ├── supabase-db.ts    # Database operations
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── supabase/                 # Supabase configuration
└── migration-safe.sql        # Database schema
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

### Core Tables
- **`users`**: User accounts with roles (CONTRIBUTOR, EDITOR, ADMIN)
- **`articles`**: Legal articles with status tracking (DRAFT, IN_REVIEW, PUBLISHED)
- **`legal_sections`**: Legal practice areas (Constitutional, Corporate, Criminal, etc.)
- **`tags`**: Content tagging system
- **`article_tags`**: Many-to-many relationship between articles and tags

### Supporting Tables
- **`case_citations`**: Legal case references
- **`source_links`**: Reference links and sources
- **`editorial_comments`**: Internal editorial notes
- **`accounts`**, **`sessions`**, **`verificationTokens`**: NextAuth.js tables

## 🎨 Design System

Jurisight features a comprehensive design language with:

### Color Palette
- **Primary**: Deep Navy (#0F224A), Royal Blue (#005C99)
- **Accent**: Vibrant Teal (#00A99D), Bright Lime (#8CC63F)
- **Semantic**: Success, Warning, Error, Info colors
- **Legal Sections**: Each section has a unique brand-aligned color

### Typography
- **Primary**: Inter (sans-serif) for UI elements
- **Secondary**: Crimson Text (serif) for long-form content
- **Monospace**: JetBrains Mono for legal citations

### Components
- Modern card-based layouts
- Responsive grid system
- Accessible form elements
- Interactive status indicators

## 🔐 Authentication & Authorization

### User Roles
1. **CONTRIBUTOR**: Create and manage their own articles
2. **EDITOR**: Review and manage articles from contributors
3. **ADMIN**: Full platform management including user administration

### Authentication Methods
- Email/Password authentication via Supabase Auth
- Magic link authentication
- Session management with NextAuth.js
- Role-based access control

## 📊 Key Features

### Content Management
- **Rich Text Editor**: Tiptap-based editor with legal content extensions
- **Media Upload**: Supabase Storage integration for images and documents
- **Article Status Workflow**: Draft → In Review → Published
- **Version Control**: Track article changes and updates
- **SEO Optimization**: Custom slugs, meta descriptions, and structured data

### Dashboard Analytics
- **Article Statistics**: Total, published, in-review, and draft counts
- **User Management**: Track active users, roles, and engagement
- **Performance Metrics**: View counts, reading time, and engagement
- **Real-time Updates**: Live data synchronization across sessions

### Legal Content Organization
- **Legal Sections**: Constitutional, Corporate, Criminal, Civil, Academic, Policy
- **Tagging System**: Flexible content categorization
- **Case Citations**: Structured legal reference management
- **Source Links**: External reference tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jurisight-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_supabase_database_url
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Set up the database**
   ```bash
   # Run the migration script in your Supabase SQL editor
   # The migration-safe.sql file contains the complete schema
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (if using Drizzle)
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🌐 API Endpoints

### Public APIs
- `GET /api/articles` - Fetch published articles
- `GET /api/articles/[slug]` - Get single article by slug
- `GET /api/sections` - Get legal sections
- `GET /api/tags` - Get available tags

### Dashboard APIs (Authenticated)
- `GET /api/dashboard/stats` - Platform statistics
- `GET /api/dashboard/articles` - Article management
- `GET /api/dashboard/users` - User management (Admin/Editor)
- `POST /api/articles` - Create new article
- `PUT /api/dashboard/articles/[id]` - Update article

### Media APIs
- `POST /api/media/upload` - Upload media files
- `DELETE /api/media/upload` - Delete media files

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration script (`migration-safe.sql`)
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for media uploads

### NextAuth Configuration
The authentication is configured in `src/lib/auth.ts` with:
- Supabase credentials provider
- JWT session strategy
- Role-based session management
- Magic link support

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: 4-column grid, collapsible navigation
- **Tablet**: 8-column grid, optimized layouts
- **Desktop**: 12-column grid, full feature set

## 🎯 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_production_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for database setup
- Review the [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment guidance

## 🗺️ Roadmap

- [ ] Advanced search with filters
- [ ] Comment system for articles
- [ ] Newsletter integration
- [ ] Mobile app development
- [ ] AI-powered content suggestions
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Design system inspired by modern legal platforms

---

**Jurisight** - Empowering the legal community through accessible knowledge sharing. ⚖️