# PROJECT SRC ARCHITECTURE MAP

## 1. Executive Summary
This project is a real estate / property listing application built using Next.js 15 (App Router). It utilizes React 19, Tailwind CSS for styling, and relies on static JSON files (stored in `public/data/`) for property data, which are managed globally via a React Context (`PropertyContext`). It includes multiple routes for public-facing pages (home, blogs, contact, properties) and authentication flows (signin, signup, forgot-password).

## 2. Project Root Overview
| File / Directory | Purpose |
|------------------|---------|
| `package.json`   | Defines dependencies (Next.js 15, React 19, Tailwind, Axios, etc.) and npm scripts. |
| `next.config.mjs`| Next.js config exporting a static build (`output: 'export'`) with a base path for production. |
| `tailwind.config.ts` | Tailwind CSS configuration, pointing to `extendedConfig.ts`. |
| `tsconfig.json`  | TypeScript configuration. |
| `.env`           | Environment variables (contains Google/Github OAuth keys, NextAuth secrets). |
| `src/`           | Application source code. |
| `public/`        | Static assets (images, data JSONs). |

## 3. Next.js Routing Map
| Route Path | Source File | Purpose | Auth/Public |
|------------|-------------|---------|-------------|
| `/`        | `src/app/page.tsx` | Main Landing/Home Page | Public |
| `/signin`  | `src/app/(site)/(auth)/signin/page.tsx` (Assumed) | User Login | Auth |
| `/signup`  | `src/app/(site)/(auth)/signup/page.tsx` (Assumed) | User Registration | Auth |
| `/forgot-password` | `src/app/(site)/(auth)/forgot-password/page.tsx` (Assumed) | Password Recovery | Auth |
| `/blogs`   | `src/app/(site)/blogs/page.tsx` | Blog Listing Page | Public |
| `/blogs/[slug]` | `src/app/(site)/blogs/[slug]/page.tsx` (Assumed) | Single Blog Post | Public |
| `/contact` | `src/app/(site)/contact/page.tsx` | Contact Us Page | Public |
| `/documentation` | `src/app/(site)/documentation/page.tsx` | Docs/Help | Public |
| `/properties-list` | `src/app/(site)/properties/properties-list/page.tsx` | Property Listing | Public |
| `/properties-list/[slug]` | `src/app/(site)/properties/properties-list/[slug]/page.tsx` (Assumed) | Single Property Details | Public |

## 4. src/app Structure
```text
src/app/
├── (site)/                  # Route groups for main site pages
│   ├── (auth)/              # Auth routes (signin, signup, forgot-password)
│   ├── blogs/               # Blog routes
│   ├── contact/             # Contact page
│   ├── documentation/       # Documentation page
│   └── properties/          # Property listing and details
├── components/              # UI components grouped by feature/page
├── globals.css              # Global Tailwind styles
├── layout.tsx               # Root layout wrapper (Providers, Header, Footer)
├── not-found.tsx            # Custom 404 page
├── page.tsx                 # Home page
├── style/                   # Additional style assets
└── types/                   # TypeScript interfaces
```

## 5. Page-by-Page Analysis

### Home Page
- **Route:** `/`
- **File path:** `src/app/page.tsx`
- **Purpose:** Main entry point showcasing features, properties, and testimonials.
- **Main imports:** `Hero`, `Calculator`, `History`, `Features`, `CompanyInfo`, `BlogSmall`, `DiscoverProperties`, `Testimonials`.
- **Data/API dependency:** None directly on page, relies on components.
- **Landing Page relevance:** HIGH (Primary candidate for refactoring into a focused landing page).

### Root Layout
- **Route:** Global Layout
- **File path:** `src/app/layout.tsx`
- **Purpose:** Wraps the app in Context, ThemeProvider, Header, and Footer.
- **Main imports:** `AppContextProvider`, `ThemeProvider`, `Header`, `Footer`, `ScrollToTop`.
- **Data/API dependency:** None.
- **Landing Page relevance:** HIGH (Will be reused as the main layout wrapper).

## 6. Component Inventory
| Component Folder | Main UI Responsibility | Landing Page Reuse Potential |
|------------------|------------------------|------------------------------|
| `components/home/hero` | Hero section | HIGH |
| `components/home/calculator` | Mortgage/Pricing calculator | MEDIUM |
| `components/home/history` | About/History section | MEDIUM |
| `components/home/info` | Company stats/info | HIGH |
| `components/home/property-option` | Featured properties or categories | HIGH |
| `components/home/testimonial` | Social proof / Testimonials | HIGH |
| `components/layout/header` | Navigation bar | HIGH |
| `components/layout/footer` | Footer section | HIGH |
| `components/shared/features` | Core features/services | HIGH |
| `components/shared/blog` | Recent news/blogs | LOW |

## 7. Context/API/Utils Map

### Context Providers
- **Provider:** `AppContextProvider` (`src/context-api/PropertyContext.tsx`)
- **State Exposed:** `properties`, `filters`.
- **Actions Exposed:** `setProperties`, `setFilters`, `updateFilter`.
- **Usage:** Fetches `propertydata.json` on mount, filters locally, and provides data to property listing components.

### Utility Functions
- **Location:** `src/utils/`
- **Functions:** `aos.tsx` (Animation wrapper), `extendedConfig.ts` (Tailwind extended config), `markdown.ts` / `markdownToHtml.ts` (Markdown parser), `pathUtils.ts` (Path resolving), `validateEmail.ts`.

### API/Service Logic
- No dedicated backend API structure in `src/`.
- Data is primarily static (`fetch('/data/propertydata.json')`).
- `package.json` contains `axios`, suggesting external API calls might exist in deeper components (possibly for auth or contact forms).

## 8. Styling & Design System Audit
- **Approach:** Tailwind CSS (configured in `tailwind.config.ts`).
- **Global CSS:** `src/app/globals.css`.
- **Theme:** Uses `next-themes` for dark/light mode toggle.
- **Fonts:** Uses `DM_Sans` from `next/font/google`.
- **Animations:** Uses `aos` (Animate On Scroll).
- **Risks for Landing Page:** The design seems coupled with dark mode and global states. We need to ensure the new Landing Page sections adhere strictly to the existing Tailwind configuration without breaking current styles.
- **Recommendation:** Keep current Tailwind setup.

## 9. Public Assets Inventory
| Folder | Asset Type | Likely Usage | Reusable for LP? |
|--------|------------|--------------|------------------|
| `data/` | JSON files | Mock data (`propertydata.json`, etc.) | Yes (if listing properties) |
| `images/` | Images (svg, png) | Logos, icons, hero backgrounds | Yes |
| `favicon.ico` | Icon | Site favicon | Yes |

## 10. Landing Page Reuse Matrix
- **KEEP:** `layout.tsx`, `globals.css`, `context-api/`, `utils/`, `tailwind.config.ts`, `next.config.mjs`, `Header`, `Footer`.
- **REUSE / ADAPT:** `components/home/hero`, `components/shared/features`, `components/home/testimonial`, `components/home/info`, `components/home/history`.
- **REFACTOR:** `src/app/page.tsx` to streamline it specifically into a high-conversion landing page structure.
- **REMOVE LATER:** Extraneous pages like `blogs`, `documentation`, `contact` (if we want a pure single-page landing site, otherwise keep them).
- **UNKNOWN:** Authentication components (depends if the landing page requires user login).

## 11. Suggested Future Landing Page Architecture
```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    landing/
      Header.tsx         (Reused)
      Hero.tsx           (Adapted)
      ProblemSection.tsx (New)
      SolutionSection.tsx (New)
      FeatureSection.tsx (Adapted)
      ProcessSection.tsx (New)
      Testimonials.tsx   (Adapted)
      PricingSection.tsx (New/Adapted from calculator)
      FAQSection.tsx     (New)
      FinalCTA.tsx       (New)
      Footer.tsx         (Reused)
```

## 12. Risks Before Redesign
- **Static Export:** The project is configured with `output: 'export'` in Next.js, meaning it relies heavily on static generation and client-side data fetching. We must ensure new components don't require server-side rendering (SSR) features unless we remove this config.
- **Context Dependency:** Some UI components might break if disconnected from `PropertyContext`.
- **NextAuth:** `.env` has NextAuth secrets, but it's unclear if `next-auth` is fully integrated since it's missing from `package.json` (might be manually implemented or removed).

## 13. Recommended Next Prompt
```text
Prompt 02 — Landing Page Information Architecture and Design Direction

Based on the PROJECT_SRC_ARCHITECTURE_MAP, we will now define the content strategy and section-by-section structure for the new Landing Page.

Goal:
1. Propose a specific, high-conversion landing page outline (Hero, Problem, Solution, Features, Proof, CTA).
2. Map existing components from `src/app/components` to these sections.
3. Identify exactly which new components need to be created.
4. Define the design aesthetic (color palette, typography) leveraging the existing `tailwind.config.ts`.
5. Output a `markdown/PROMPT_02_LP_DESIGN_PLAN.md` with the blueprint. Do NOT write component code yet.
```
