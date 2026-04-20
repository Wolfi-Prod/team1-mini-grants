# Team1 Grants — Design System Plan

> **Purpose:** Hand this document to any design AI (Figma AI, v0, Claude, etc.) to generate a complete, production-ready UI kit + page designs for the Team1 Grants platform.
>
> **Current state:** 62-page frontend scaffold in pure black-and-white (B&W brutalist prototype). Every page, every button, every form field is functional — but unstyled beyond monochrome. This plan defines what the real design system should look like.
>
> **Tech stack:** Next.js 15 App Router + Tailwind CSS v4 + TypeScript. Components live in `app/_components/ui/`. No Radix, no shadcn — everything is custom.

---

## 1. Brand Identity

### 1.1 What Team1 Grants is

A **multi-org grant platform** where:
- **Organizations** publish grants, hackathons, and challenges with custom questions and funding pools
- **Applicants** create projects, apply to grants, join hackathon teams, and track their applications
- **Reviewers** score applications with decisions + feedback + numeric score (1-10)
- **Platform admins** oversee everything — user management, org management, reviewer audit with COI detection, audit log

### 1.2 Brand personality

| Trait | Expression |
|---|---|
| **Professional** | This handles real money (grant disbursements). It must feel trustworthy, not playful. |
| **Dense but clear** | Org admins manage 50+ applications per grant. Information density matters more than whitespace. |
| **Accessible** | WCAG 2.2 AA minimum. The platform is used by applicants worldwide — diverse devices, screen sizes, assistive tech. |
| **Fast** | Server-rendered. No loading spinners for initial paint. Data tables must feel instant. |
| **Neutral** | Each org brings their own brand. The platform itself should be a clean canvas — not opinionated about color. |

### 1.3 Design direction

Choose ONE of these directions (or blend):

- **A. Minimal corporate** — Think Linear, Vercel dashboard, Stripe. Clean sans-serif, generous whitespace on marketing pages, dense tables on admin pages. Subtle shadows, rounded-sm corners, muted accents.
- **B. Elevated brutalist** — Keep the current B&W bones but add: 1 accent color, subtle gradients on cards, micro-interactions on buttons (scale on hover), and typography hierarchy via weight+size (not color).
- **C. Warm professional** — Think Notion, Loom, Gusto. Warm gray backgrounds (#FAFAF9), rounded corners, soft shadows, a warm accent (amber / teal / indigo), friendly but not childish.

---

## 2. Color System

### 2.1 Palette definition needed

Define the following color roles. Each must have: hex, Tailwind class name, light mode value, and optional dark mode value.

| Role | What it colors | Current (B&W) |
|---|---|---|
| **background** | Page background, card backgrounds | `#FFFFFF` |
| **background-muted** | Secondary surfaces (sidebar, code blocks, hover states) | `#FAFAFA` |
| **foreground** | Primary text | `#000000` |
| **foreground-muted** | Secondary text, descriptions, hints | `#737373` |
| **foreground-subtle** | Tertiary text, timestamps, placeholders | `#A3A3A3` |
| **border** | Card borders, dividers, input borders | `#000000` |
| **border-muted** | Secondary borders (table rows, sidebar groups) | `#E5E5E5` |
| **primary** | CTAs, active states, primary buttons | `#000000` |
| **primary-foreground** | Text on primary backgrounds | `#FFFFFF` |
| **accent** | Status highlights, notification dots, progress bars | _undefined — pick one_ |
| **success** | Accepted status, completed states, positive badges | _undefined_ |
| **warning** | Deadlines soon, pending states, caution badges | _undefined_ |
| **danger** | Rejected status, destructive actions, error states | _undefined_ |
| **info** | In-review status, informational badges | _undefined_ |

### 2.2 Status colors (critical for this product)

The platform has these statuses that need distinct, scannable colors:

**Application status:** DRAFT · SUBMITTED · IN_REVIEW · ACCEPTED · REJECTED · WITHDRAWN
**Grant status:** DRAFT · OPEN · CLOSED · ARCHIVED
**Competition status:** DRAFT · UPCOMING · OPEN · JUDGING · ANNOUNCED · CLOSED
**Disbursement status:** PENDING · COMPLETED · FAILED · CANCELLED
**Review decision:** APPROVE · REJECT · REQUEST_CHANGES

### 2.3 Dark mode

Optional for v1 but the CSS variable structure should support it. Define light + dark values for every token above if including dark mode.

---

## 3. Typography

### 3.1 Font stack

**Current:** System UI (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`)

**Decision needed:**
- Keep system font (fastest, zero FOIT, universal) — OR
- Pick a web font: Inter, Geist, DM Sans, Satoshi, Plus Jakarta Sans — specify weights to load (400, 500, 600, 700)
- Monospace: keep system mono or pick: JetBrains Mono, Fira Code, Berkeley Mono

### 3.2 Type scale

Define each level. Used across every page.

| Level | Current | Used for | Suggested range |
|---|---|---|---|
| **display** | `text-2xl` (24px) | Page titles (h1) | 28-36px |
| **heading** | `text-sm` (14px) uppercase | Card titles (h2), sidebar sections | 14-18px |
| **subheading** | `text-xs` (12px) uppercase tracking-wide | Form labels, table headers | 11-13px |
| **body** | `text-sm` (14px) | Regular text, descriptions, form inputs | 14-16px |
| **caption** | `text-xs` (12px) | Hints, timestamps, secondary info | 11-12px |
| **overline** | `text-[10px]` (10px) uppercase tracking-widest | Badges, metadata, group labels | 10-11px |
| **mono** | System mono | Code snippets, IDs, API keys, secrets | 12-13px |

### 3.3 Text treatment

**Current:** Heavy use of `uppercase` + `tracking-wide/widest` on all labels and headings.

**Decision needed:**
- Keep the all-caps treatment (brutalist, dense, scannable) — OR
- Move to sentence case for headings, keep uppercase only for overlines/badges (softer, more readable)
- Font weight hierarchy: which levels get `font-bold` vs `font-semibold` vs `font-medium`?

---

## 4. Spacing & Layout

### 4.1 Spacing scale

**Current:** Tailwind default (4px base: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px).

Define a consistent spacing rhythm:

| Token | px | Used for |
|---|---|---|
| `space-1` | 4px | Tight: badge padding, inline gaps |
| `space-2` | 8px | Default: button icon gap, card header padding |
| `space-3` | 12px | Medium: input padding, card content gaps |
| `space-4` | 16px | Large: section gaps, card body padding |
| `space-6` | 24px | XL: page section padding, card spacing |
| `space-8` | 32px | XXL: page header padding |
| `space-12` | 48px | Hero: empty states, landing sections |

### 4.2 Layout grid

| Surface | Max width | Columns |
|---|---|---|
| Marketing pages (landing, discover, FAQ) | `max-w-6xl` (1152px) | Full-bleed hero, 2-3 col grid for cards |
| Dashboard pages | `max-w-6xl` with 240px sidebar | 1-2 col main content |
| Form pages (settings, new project, apply) | `max-w-2xl` (672px) or `max-w-3xl` (768px) | Single column |
| Admin tables | `max-w-5xl` (1024px) | Full-width tables |

### 4.3 Breakpoints

| Name | Width | What changes |
|---|---|---|
| `sm` | 640px | — |
| `md` | 768px | Navbar collapses → hamburger; sidebar hides; forms stack |
| `lg` | 1024px | — |
| `xl` | 1280px | — |

### 4.4 Border radius

**Current:** `rounded-none` everywhere (0px). No rounded corners.

**Decision needed:**
- `rounded-none` (keep brutalist)
- `rounded-sm` (2px — barely perceptible, modern minimal)
- `rounded-md` (6px — standard SaaS)
- `rounded-lg` (8px — friendly, Notion-like)
- Mix: cards get rounding, buttons get rounding, tables stay sharp?

---

## 5. Component Specification

### 5.1 Existing primitives (11 components — redesign all)

Each component below needs a visual design for every variant + state.

#### Button
| Property | Options |
|---|---|
| Variants | `primary` · `secondary` · `ghost` · `danger` |
| Sizes | `sm` (h-8) · `md` (h-10) · `lg` (h-12) |
| States | default · hover · active · focus · disabled · loading |
| Icons | leftIcon · rightIcon · icon-only (with aria-label) |

**Design decisions:**
- Hover treatment: color swap (current) vs scale + shadow vs subtle darken?
- Loading state: spinner inside button vs shimmer vs disabled+text change?

#### Card
| Property | Options |
|---|---|
| Parts | Header (title + description + actions) · Body · Footer |
| Variants | Default · Highlighted (accent border-left?) · Danger zone (red tint?) |
| States | default · hover (if clickable) |

#### Badge
| Property | Options |
|---|---|
| Variants | `default` · `inverted` · `outline` + NEW status-specific variants |
| Sizes | Current: one size. Need: `sm` (for inline) · `md` (for cards/tables)? |

**Must support:** Every status in §2.2 (application status, grant status, etc.) with a distinct color per status.

#### Input / Textarea / Select
| Property | Options |
|---|---|
| Parts | Label · Input field · Hint · Error · Leading icon/addon |
| States | default · focus · error · disabled · readonly |

**Design decisions:**
- Border treatment on focus: thicker border? accent-colored ring? glow?
- Error state: red border? red text? red background tint? shake animation?

#### Table
| Property | Options |
|---|---|
| Props | `dense` · `sticky` · `numeric` columns |
| Parts | Header row · Body rows · Empty state |
| States | Row hover · Row selected (future) · Sortable header (future) |

**Design decisions:**
- Header background: solid dark? subtle gray? transparent?
- Zebra striping: yes/no?
- Row hover: background change vs left-accent bar?

#### Modal + ConfirmDialog
| Property | Options |
|---|---|
| Parts | Header (title + description + close) · Body · Footer (actions) |
| Animations | Fade + scale-up? Slide-up? None? |
| Sizes | `sm` (max-w-sm) · `md` (max-w-lg) · `lg` (max-w-2xl) |
| Backdrop | Black overlay (current) · Blur? · Click to dismiss? |

#### Tabs
| Property | Options |
|---|---|
| Style | Underline (border-b) · Boxed (bg toggle) · Pill |
| States | active · inactive · hover · focus · disabled |

#### EmptyState
| Property | Options |
|---|---|
| Parts | Icon (optional) · Title · Description · Action CTA |
| Illustrations | None (current) · Simple line art? · Icon-based? |

### 5.2 New components needed

| Component | Purpose | Where used |
|---|---|---|
| **Avatar** | User profile images, team member icons | Navbar, profile, team lists, reviewer rows |
| **Tooltip** | Hover explanation on disabled buttons, icon-only buttons | Throughout |
| **ProgressBar** | Application pipeline funnel, funding progress | Grant dashboard, analytics |
| **StatsCard** | The 4-up stat blocks on dashboards | Admin, org dashboard, grant dashboard, reviewer dashboard |
| **Breadcrumb** | Navigation hierarchy | Currently ad-hoc Link + "←" text; formalize |
| **Skeleton** | Loading placeholders for async data | Replace loading.tsx spinner |
| **DatePicker** | Better than native `<input type="date">` | Grant deadlines, disbursement dates, digest settings |
| **Toggle/Switch** | Boolean settings (public/private, flagship, email on/off) | Settings pages, grant config |
| **Dropdown** | Role selector, filter menus | Member role change, audit log filters |
| **Pagination** | Page through large datasets | Admin users, audit log, applications list |
| **Timeline** | Application status progression | Application detail |
| **Chart** | Funnel, bar, pie for analytics | Grant analytics, org analytics, reviewer dashboard |

### 5.3 Dev components (keep separate)

| Component | Purpose |
|---|---|
| **RoleSwitcher** | Dev-only role toggle widget (top-right corner) |
| **MockApiBadge** | Shows which API endpoints a page would call |

These stay unstyled / in dev-only mode. Don't include in the design system.

---

## 6. Page Templates

### 6.1 Template types (design one of each, pages clone from them)

| Template | Pages using it | Key elements |
|---|---|---|
| **Marketing / Public** | Home, Discover, Showcase, FAQ, Hackathons, Challenges | Hero area, card grid, search/filter bar, CTA sections |
| **Detail (public)** | Grant detail, Project detail, Hackathon detail, Challenge detail, User profile | Banner + header info, tabbed content sections, sidebar with actions |
| **Dashboard shell** | Every `/dashboard/[orgSlug]/*` + `/admin/*` route | Left sidebar nav, top action bar, main content area |
| **Form page** | New project, Edit project, Edit grant, Apply to grant, Settings pages | Breadcrumb, centered narrow card(s) with form fields, sticky submit bar |
| **List page** | My projects, My applications, Grants list, Applications list, Members, Webhooks, API keys | PageHeader with filter/search bar, Table or card list, pagination |
| **Auth page** | Login, Onboarding, Invite accept | Centered card, minimal chrome, single CTA |

### 6.2 Responsive behavior

Every template needs:
- **Mobile (< 768px):** Single column, hamburger nav, sidebar drawer, stacked cards, horizontal-scrolling tables
- **Tablet (768-1024px):** Sidebar visible, 2-col grids where applicable
- **Desktop (> 1024px):** Full layout, 3-col grids on marketing pages, comfortable table widths

---

## 7. Interaction & Motion

### 7.1 Principles

- **Minimal motion.** This is a data-heavy admin tool, not a marketing site. Avoid gratuitous animation.
- **Purpose-driven.** Motion for: (1) state changes (modal open/close), (2) feedback (button press, toast appear), (3) orientation (page transition).
- **Duration:** 150ms for micro-interactions, 200ms for overlays, 300ms for page transitions.
- **Easing:** `ease-out` for entrances, `ease-in` for exits.

### 7.2 Specific interactions to design

| Interaction | Suggested treatment |
|---|---|
| Button hover | Subtle scale(1.01) + shadow-sm OR color darken |
| Button press | scale(0.98) for 100ms |
| Modal open | Fade-in backdrop (200ms) + scale panel from 0.95 → 1.0 |
| Modal close | Reverse of open |
| Toast appear | Slide-in from right + fade (200ms) |
| Toast dismiss | Fade-out right (150ms) |
| Sidebar expand (mobile) | Slide-in from left (200ms) |
| Tab switch | No transition (instant swap) — OR — subtle crossfade |
| Table row hover | Instant background change (no transition) |
| Badge status change | No animation (data-driven, not user-triggered) |
| Form error appear | Subtle red fade + shake? OR instant appearance |

---

## 8. Iconography

### 8.1 Current

Using **Lucide React** icons throughout (X, Menu, ChevronDown, ChevronUp).

### 8.2 Decision needed

- Keep Lucide (clean, consistent, MIT license, 1000+ icons)
- Switch to Phosphor Icons (more variants per icon — thin/light/regular/bold/fill/duotone)
- Switch to Heroicons (designed for Tailwind)
- Custom icon set (expensive, delay)

### 8.3 Icon usage rules

| Context | Size | Stroke |
|---|---|---|
| Inline text / badges | 14-16px | 1.5px |
| Buttons (with text) | 16-18px | 1.5px |
| Buttons (icon-only) | 18-20px | 2px |
| Navigation | 20px | 1.5px |
| Empty states | 32-48px | 1.5px |

---

## 9. Data the Designer Needs

### 9.1 Entity field reference (for realistic designs)

**User profile card fields:** Name, Handle (@handle), Email, Bio, Telegram, Country, State, Wallet address, Profile picture, Platform admin badge, Active/Deleted/Onboarding badges.

**Grant card fields:** Title, Org name, Org logo, Status (OPEN/CLOSED/DRAFT/ARCHIVED), Funding pool + currency, Deadline (date or "Rolling"), Application count, isPublic flag, isFlagship flag, Description (truncated).

**Application row fields:** Project name, Grant title, Status (6 states), Submitted date, Funding requested, Funding received, Reviewer count, Decision.

**Project card fields:** Name, Logo, Banner, Categories (pills), Visibility (PUBLIC/PRIVATE/CUSTOM), Hidden section count, Description, Website URL, Archive status.

**Competition card fields:** Title, Format (HACKATHON/CHALLENGE), Partner name + logo, Status (6 states), Team count, Pool + currency, Date range (hackathon) or deadline (challenge), Track count.

### 9.2 Realistic mock content

The codebase has mock data in `lib/mock/` with real-looking data:
- 2 organizations (Avalanche Foundation, Subnet Labs)
- 7 grants across both orgs
- 6 projects owned by Alice
- 4 applications in various statuses
- 2 hackathons, 2 challenges
- 4 competition teams
- 8 users across all roles
- 12 audit log entries
- 5 invitations in every state

Use this data to populate designs so they look real, not lorem-ipsum.

---

## 10. Deliverables Expected

When giving this to a design AI or designer, ask for:

1. **Color palette** — Complete token set (light + optional dark mode)
2. **Typography scale** — Every level with font, size, weight, line-height, letter-spacing
3. **Component library** — Every component from §5.1 + §5.2 in every variant + state
4. **6 page templates** — One from each category in §6.1, mobile + desktop
5. **12 key page designs** — Home, Discover, Grant detail, Project detail, My Projects, Apply form, Org Dashboard, Grant Dashboard, Admin Users, Settings Profile, Hackathon detail, Search
6. **Interaction spec** — Motion values for each interaction in §7.2
7. **Icon guidelines** — Size + stroke rules + 20 most-used icons rendered
8. **Spacing + grid spec** — Figma/CSS grid definitions for each template type

---

## 11. Implementation Path

Once designs are approved:

1. **Update `globals.css`** — Replace B&W `@theme` block with the new color tokens as CSS custom properties
2. **Update primitives** — Apply new colors + radii + shadows to the 11 existing components in `app/_components/ui/`
3. **Build new components** — Avatar, Tooltip, ProgressBar, etc. from §5.2
4. **Apply page templates** — Update each of the 62 pages to use the new component variants
5. **Add motion** — Wire Framer Motion or CSS transitions per §7.2
6. **Test** — Visual regression via Playwright screenshots + a11y re-audit

Estimated effort: 2-3 weeks for a single developer, or 1 week with a designer + developer pair.

---

## 12. What NOT to Change

- **Page structure / routes** — All 62 pages stay as-is. Only the visual layer changes.
- **Data flow** — Mock data layer is unchanged. Real backend wiring is a separate track.
- **Component API** — Props interfaces stay the same. Only the rendering (classes, styles) changes.
- **Accessibility** — All ARIA attributes, focus traps, keyboard nav, role attributes must survive the redesign.
- **B&W as fallback** — If a color token fails to load, the page should still be readable in pure B&W.
