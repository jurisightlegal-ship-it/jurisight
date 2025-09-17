# Jurisight Design Language & Visual Identity
**Version:** 1.0  
**Last Updated:** September 17, 2025  
**Design Lead:** Creative Director  

---

## **1. Brand Foundation**

### **1.1. Design Philosophy**
Jurisight's design embodies **clarity, authority, and accessibility**. We create interfaces that respect the gravity of legal content while remaining approachable to students and newcomers. Our design language reflects the intersection of traditional legal scholarship and modern digital experiences.

### **1.2. Core Design Principles**
- **Clarity First**: Every design decision prioritizes comprehension and reduces cognitive load
- **Dignified Authority**: Visual elements convey expertise without intimidation  
- **Inclusive Accessibility**: Designed for diverse users, abilities, and devices
- **Systematic Consistency**: Predictable patterns that build user confidence
- **Contextual Hierarchy**: Information architecture that guides users naturally

---

## **2. Visual Identity**

### **2.1. Color Palette**

#### **Primary Brand Colors**
```css
/* Deep Navy Blue - Foundation & Authority */
--jurisight-navy: #0F224A;      /* RGB: 15, 34, 74 - Base of 'J', darkest shadows */
--jurisight-navy-light: #1a3660; /* Lighter variant for hover states */
--jurisight-navy-dark: #081529;  /* Darker emphasis */

/* Royal Blue - Primary Brand */
--jurisight-royal: #005C99;     /* RGB: 0, 92, 153 - Main stem of 'J' */
--jurisight-royal-light: #1a75b3; /* Hover and active states */
--jurisight-royal-dark: #004080; /* Pressed states */

/* Vibrant Teal - Knowledge & Wisdom */
--jurisight-teal: #00A99D;      /* RGB: 0, 169, 157 - Book pages representation */
--jurisight-teal-light: #1abeb2; /* Highlights and accents */
--jurisight-teal-dark: #008b82;  /* Active states */

/* Bright Lime Green - Innovation & Growth */
--jurisight-lime: #8CC63F;      /* RGB: 140, 198, 63 - Top accent of 'J' */
--jurisight-lime-light: #a5d455; /* Success states and highlights */
--jurisight-lime-dark: #73ab2b;  /* Emphasis and CTAs */
```

#### **Secondary Colors**
```css
/* Professional Grays */
--gray-50: #f8fafc;   /* Background tints */
--gray-100: #f1f5f9;  /* Card backgrounds */
--gray-200: #e2e8f0;  /* Borders */
--gray-600: #475569;  /* Secondary text */
--gray-900: #0f172a;  /* Primary text */

/* Semantic Colors */
--success: #10b981;   /* Published articles */
--warning: #f59e0b;   /* In review status */
--error: #ef4444;     /* Errors & rejections */
--info: #3b82f6;      /* Informational content */
```

#### **Content-Specific Colors**
```css
/* Legal Section Colors - Brand-Aligned */
--constitutional: var(--jurisight-royal);    /* Constitutional law - Royal Blue */
--corporate: var(--jurisight-teal);          /* Corporate & commercial - Teal */
--criminal: #dc2626;                         /* Criminal law - Keep red for urgency */
--civil: var(--jurisight-navy);              /* Civil procedures - Navy Blue */
--academic: var(--jurisight-lime);           /* Academic content - Lime Green */
--policy: var(--jurisight-royal-light);      /* Policy & regulatory - Light Royal */
```

### **2.2. Typography**

#### **Font Stack**
```css
/* Primary Typeface - Inter (Sans-serif) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Secondary Typeface - Crimson Text (Serif for long-form) */
--font-secondary: 'Crimson Text', Georgia, 'Times New Roman', serif;

/* Monospace - JetBrains Mono (Code & citations) */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### **Type Scale**
```css
/* Headlines & Titles */
--text-5xl: 3rem;      /* 48px - Main headlines */
--text-4xl: 2.25rem;   /* 36px - Section titles */
--text-3xl: 1.875rem;  /* 30px - Article titles */
--text-2xl: 1.5rem;    /* 24px - Subsection heads */
--text-xl: 1.25rem;    /* 20px - Card titles */

/* Body Text */
--text-lg: 1.125rem;   /* 18px - Article body */
--text-base: 1rem;     /* 16px - UI text */
--text-sm: 0.875rem;   /* 14px - Captions */
--text-xs: 0.75rem;    /* 12px - Labels */
```

#### **Font Weights & Usage**
- **Extra Bold (800)**: Main brand headlines, hero sections
- **Bold (700)**: Section headers, important UI elements  
- **Semibold (600)**: Article titles, card headers
- **Medium (500)**: Navigation, buttons, emphasis
- **Regular (400)**: Body text, descriptions
- **Light (300)**: Supporting text, metadata

---

## **3. Layout & Spacing**

### **3.1. Grid System**
- **Desktop**: 12-column grid with 24px gutters
- **Tablet**: 8-column grid with 20px gutters  
- **Mobile**: 4-column grid with 16px gutters

### **3.2. Spacing Scale (Tailwind-aligned)**
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### **3.3. Container Widths**
- **Max Content Width**: 1200px (articles and main content)
- **Reading Width**: 65ch (optimal reading experience)
- **Dashboard Width**: 100% with 24px padding

---

## **4. Component Design Standards**

### **4.1. Navigation**
- **Header Height**: 72px on desktop, 64px on mobile
- **Logo Placement**: Left-aligned with 24px margin
- **Navigation**: Horizontal on desktop, collapsible hamburger on mobile
- **User Actions**: Right-aligned (Login, Profile, Search)

### **4.2. Article Cards**
```css
/* Standard Article Card */
.article-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  background: white;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### **4.3. Buttons**
#### **Primary Button**
- Background: `var(--jurisight-royal)`
- Text: White, semibold
- Padding: 12px 24px
- Border radius: 8px
- Hover: `var(--jurisight-royal-light)`

#### **Secondary Button**  
- Background: Transparent
- Border: 2px solid `var(--jurisight-navy)`
- Text: `var(--jurisight-navy)`, semibold
- Hover: Background `var(--jurisight-navy)`, text white

#### **Success/CTA Button**
- Background: `var(--jurisight-lime)`
- Text: `var(--jurisight-navy)`, semibold
- Used for CTAs, publish actions, and success states
- Hover: `var(--jurisight-lime-dark)`

#### **Teal Accent Button**
- Background: `var(--jurisight-teal)`
- Text: White, semibold
- Used for knowledge-related actions (learn more, explore)
- Hover: `var(--jurisight-teal-dark)`

### **4.4. Form Elements**
- **Input Height**: 44px (touch-friendly)
- **Border**: 1px solid `var(--gray-200)`
- **Focus State**: 2px border in `var(--jurisight-teal)`
- **Border Radius**: 8px
- **Label Style**: Semibold, 14px, `var(--gray-600)`
- **Error State**: Border in `var(--error)` with red text
- **Success State**: Border in `var(--jurisight-lime)` with green text

---

## **5. Content Presentation**

### **5.1. Article Layout**
#### **Article Header**
- Title: `text-3xl`, `font-secondary`, `font-bold`
- Deck/Summary: `text-lg`, `var(--gray-600)`, max 2 lines
- Metadata: Author, date, reading time, section
- Featured image: 16:9 aspect ratio, max 1200px width

#### **Article Body**
- Font: `font-secondary` for readability
- Size: `text-lg` (18px) for comfortable reading
- Line height: 1.7 for optimal readability
- Paragraph spacing: 24px between paragraphs
- Max width: 65ch for optimal reading line length

### **5.2. Legal Citations**
```css
.citation {
  background: var(--gray-50);
  border-left: 4px solid var(--jurisight-teal);
  padding: 16px 20px;
  margin: 24px 0;
  font-family: var(--font-mono);
  font-size: 14px;
  border-radius: 0 8px 8px 0;
}

.citation-primary {
  border-left-color: var(--jurisight-royal);
  background: rgba(0, 92, 153, 0.05);
}

.citation-highlight {
  border-left-color: var(--jurisight-lime);
  background: rgba(140, 198, 63, 0.05);
}
```

### **5.3. Section Indicators**
Each legal section has a unique brand-aligned color and icon:
- **Constitutional Law**: Royal Blue (`--jurisight-royal`) - Authority & foundational law
- **Corporate Law**: Vibrant Teal (`--jurisight-teal`) - Knowledge & business wisdom  
- **Criminal Law**: Red (`#dc2626`) - Urgency & critical legal matters
- **Civil Law**: Deep Navy (`--jurisight-navy`) - Stability & procedural law
- **Academic**: Bright Lime (`--jurisight-lime`) - Growth & learning
- **Policy & Regulatory**: Light Royal (`--jurisight-royal-light`) - Governance

---

## **6. Status & State Indicators**

### **6.1. Article Status Badges**
```css
/* Draft */
.status-draft { 
  background: var(--gray-100); 
  color: var(--gray-600); 
}

/* In Review */
.status-review { 
  background: #fef3c7; 
  color: #92400e; 
}

/* Published */
.status-published { 
  background: #d1fae5; 
  color: #065f46; 
}

/* Needs Revision */
.status-revision { 
  background: #fee2e2; 
  color: #991b1b; 
}
```

### **6.2. Interactive States**
- **Hover**: Subtle elevation with shadow
- **Focus**: Golden outline for accessibility
- **Active**: Slightly darkened background
- **Disabled**: 50% opacity with cursor not-allowed

---

## **7. Accessibility Standards**

### **7.1. Color Contrast**
- **Text on white**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear focus indicators

### **7.2. Typography Accessibility**
- **Minimum font size**: 16px for body text
- **Line height**: Minimum 1.5 for readability
- **Font choices**: High legibility, dyslexia-friendly

### **7.3. Interaction Standards**
- **Touch targets**: Minimum 44px × 44px
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Proper ARIA labels and semantic HTML

---

## **8. Content Guidelines**

### **8.1. Editorial Voice**
- **Tone**: Professional yet approachable, authoritative but not intimidating
- **Language**: Clear, jargon-explained, inclusive
- **Structure**: Logical hierarchy with clear headings

### **8.2. Visual Content**
- **Images**: High quality, contextually relevant
- **Infographics**: Clean, informative, brand-aligned
- **Charts/Graphs**: Accessible color schemes, clear labels

### **8.3. Legal Content Standards**
- **Citations**: Consistent formatting using Indian legal citation standards
- **Sources**: Always linked and verified
- **Updates**: Clear versioning for legal updates
- **Disclaimers**: Prominent legal disclaimers where required

---

## **9. Mobile-First Considerations**

### **9.1. Responsive Breakpoints**
```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### **9.2. Mobile Optimizations**
- **Touch-friendly**: 44px minimum touch targets
- **Readable text**: 16px minimum font size
- **Simplified navigation**: Collapsible menus
- **Fast loading**: Optimized images and fonts

---

## **10. Implementation Notes**

### **10.1. Technology Integration**
- **shadcn/ui**: Customize components to match brand colors
- **Tailwind CSS**: Extend theme with custom color variables
- **Next.js**: Implement proper font loading and optimization

### **10.2. Design Tokens**
All design values should be implemented as CSS custom properties or Tailwind config extensions for consistency across the application.

### **10.3. Design System Evolution**
This design language is a living document that should evolve based on:
- User feedback and usability testing
- Legal content requirements
- Accessibility audits
- Technical constraints and opportunities

---

**Next Steps:**
1. Create component library in Figma/Storybook
2. Implement design tokens in Tailwind config
3. Build out shadcn/ui component customizations
4. Conduct accessibility audit
5. Test with target users (law students, practitioners)
