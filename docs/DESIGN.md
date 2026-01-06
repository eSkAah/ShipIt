# ShipIt Design System

## Overview

This document defines the complete design system for ShipIt, a production-ready SaaS boilerplate. The design is inspired by [Creatikk.io](https://www.creatikk.io/)'s premium aesthetic, adapted for light mode with a custom Gold and Purple color scheme.

**Purpose**: Ensure consistent, professional, and accessible UI across all ShipIt applications.

**How to use this document**: Reference this when building new components, updating existing UI, or making design decisions. All values defined here are implemented in Tailwind CSS configuration for easy use.

---

## Color Palette

### Theme-Aware Color Strategy

**Important**: Due to contrast and visibility constraints, accent colors differ by theme:

| Context                  | Light Mode                       | Dark Mode                    |
| ------------------------ | -------------------------------- | ---------------------------- |
| **Links**                | Purple (`text-purple-600`)       | Gold (`text-gold-500`)       |
| **Link Hover**           | Purple (`hover:text-purple-700`) | Gold (`hover:text-gold-400`) |
| **Button Hover Borders** | Purple (`border-purple-500`)     | Gold (`border-gold-500`)     |
| **Input Focus Ring**     | Purple (`ring-purple-500`)       | Gold (`ring-gold-500`)       |
| **Dot Grid Pattern**     | Purple tint                      | White/gray                   |
| **Background Accents**   | Purple + subtle gold             | Purple + gold                |

**Reasoning**: Gold (#FFD700) has poor contrast on white backgrounds (1.4:1 ratio), so we use purple for interactive elements in light mode. Gold works beautifully against dark backgrounds where it provides excellent visibility.

**Tailwind Pattern**:

```tsx
// Conditional colors for links and accents
className = 'text-purple-600 dark:text-gold-500 hover:text-purple-700 dark:hover:text-gold-400';
```

### Primary: Gold

Our signature color, used for primary actions, accents, and brand identity. **Best for dark mode accents.**

| Shade        | Hex           | Usage                                   |
| ------------ | ------------- | --------------------------------------- |
| gold-50      | `#FFFEF0`     | Lightest backgrounds, subtle highlights |
| gold-100     | `#FFFBD6`     | Light backgrounds, hover states         |
| gold-200     | `#FFF7AD`     | Borders, dividers                       |
| gold-300     | `#FFF284`     | Disabled states, subtle accents         |
| gold-400     | `#FFED5B`     | Secondary buttons, badges               |
| **gold-500** | **`#FFD700`** | **Primary brand color** (main usage)    |
| gold-600     | `#E6C200`     | Hover states for primary actions        |
| gold-700     | `#B39700`     | Active states, pressed buttons          |
| gold-800     | `#806C00`     | Text on light backgrounds               |
| gold-900     | `#4D4100`     | High contrast text                      |
| gold-950     | `#332B00`     | Darkest, maximum contrast               |

**Usage Guidelines**:

- Primary buttons: `bg-gold-500`, shadow with `shadow-gold-glow`
- Text accents: `text-gold-700` or `text-gold-800`
- Backgrounds: `bg-gold-50` for subtle emphasis
- Borders: `border-gold-300` or `border-gold-500`

### Secondary: Purple

Complementary color for secondary actions, accents, and visual interest.

| Shade          | Hex           | Usage                     |
| -------------- | ------------- | ------------------------- |
| purple-50      | `#F5F3FF`     | Light backgrounds         |
| purple-100     | `#EDE9FE`     | Subtle highlights         |
| purple-200     | `#DDD6FE`     | Borders, dividers         |
| purple-300     | `#C4B5FD`     | Disabled states           |
| purple-400     | `#A78BFA`     | Badges, pills             |
| **purple-500** | **`#7C3AED`** | **Main purple**           |
| purple-600     | `#6D28D9`     | Hover states              |
| purple-700     | `#5B21B6`     | Active states             |
| purple-800     | `#4C1D95`     | Text on light backgrounds |
| purple-900     | `#3B0764`     | High contrast             |
| purple-950     | `#2E0550`     | Darkest                   |

**Usage Guidelines**:

- Secondary buttons: `bg-purple-500 text-white`
- Accents: `text-purple-600`
- Gradients: Combine with gold for premium effect
- Shadows: `shadow-purple-glow` for secondary elements

### Neutrals: Gray Scale

Foundation colors for backgrounds, text, and UI structure.

| Usage          | Tailwind Class                     | Example               |
| -------------- | ---------------------------------- | --------------------- |
| Primary text   | `text-black`                       | Body copy, headings   |
| Secondary text | `text-black/60` or `text-gray-600` | Supporting text       |
| Tertiary text  | `text-black/40` or `text-gray-400` | Placeholder, disabled |
| Background     | `bg-white`                         | Main canvas           |
| Surface        | `bg-gray-50`                       | Cards, panels         |
| Borders        | `border-gray-200`                  | Dividers, outlines    |
| Borders (dark) | `border-gray-300`                  | Input fields          |

### Semantic Colors

Communicate status and feedback to users.

| Type    | Color | Hex       | Usage                               |
| ------- | ----- | --------- | ----------------------------------- |
| Success | Green | `#10B981` | Success messages, completed states  |
| Error   | Red   | `#EF4444` | Error messages, destructive actions |
| Warning | Amber | `#F59E0B` | Warning messages, caution states    |
| Info    | Blue  | `#3B82F6` | Informational messages, hints       |

**Usage**:

- Text: `text-success`, `text-error`, `text-warning`, `text-info`
- Backgrounds: `bg-success/10`, `bg-error/10` (10% opacity for subtle alerts)
- Borders: `border-success`, `border-error`

---

## Typography

### Font Family

**Manrope** - Modern geometric sans-serif, excellent readability for SaaS interfaces.

```css
font-family: 'Manrope', system-ui, sans-serif;
```

**Available Weights**:

- 400 (Regular) - Body text
- 500 (Medium) - Emphasized body text
- 600 (Semibold) - Subheadings, buttons
- 700 (Bold) - Headings
- 800 (Extrabold) - Hero titles (use sparingly)

**Tailwind Class**: `font-sans` (default)

### Typography Scale

| Element             | Size | Line Height | Weight | Tailwind Classes                         |
| ------------------- | ---- | ----------- | ------ | ---------------------------------------- |
| **Hero (H1)**       | 72px | 84px (1.17) | 700    | `text-hero font-bold leading-hero`       |
| **Section (H2)**    | 52px | 62px (1.19) | 700    | `text-section font-bold leading-section` |
| **Card (H3)**       | 24px | 32px (1.33) | 400    | `text-2xl font-normal leading-8`         |
| **Subheading (H4)** | 20px | 28px (1.4)  | 600    | `text-xl font-semibold leading-7`        |
| **Body Large**      | 18px | 27px (1.5)  | 400    | `text-lg font-normal`                    |
| **Body (default)**  | 16px | 24px (1.5)  | 400    | `text-base font-normal`                  |
| **Body Small**      | 14px | 21px (1.5)  | 400    | `text-sm font-normal`                    |
| **Caption**         | 12px | 16px (1.33) | 400    | `text-xs font-normal`                    |

### Text Styles

**Usage Examples**:

```tsx
// Hero heading
<h1 className="text-hero font-bold leading-hero">
  Ship Faster
</h1>

// Section heading
<h2 className="text-section font-bold leading-section">
  Features
</h2>

// Body text with secondary color
<p className="text-base text-black/60">
  Supporting text goes here
</p>

// Gradient text (gold to purple)
<span className="text-gradient">
  Premium Feature
</span>
```

### Line Height Guidelines

- **Tight** (`leading-tight`, 1.1): Large display text, hero headings
- **Normal** (`leading-normal`, 1.5): Body text, paragraphs
- **Relaxed** (`leading-relaxed`, 1.75): Long-form content, articles

### Text Opacity Utilities

Custom utilities for Creatikk-style text hierarchy:

- **Primary** (`.text-primary`): 100% opacity - main content
- **Secondary** (`.text-secondary`): 60% opacity - supporting text
- **Tertiary** (`.text-tertiary`): 40% opacity - placeholders, disabled

---

## Spacing System

Based on Tailwind's default 4px (0.25rem) scale, with custom values for Creatikk patterns.

### Standard Scale

| Tailwind               | Value     | Usage                                   |
| ---------------------- | --------- | --------------------------------------- |
| `gap-2` / `p-2`        | 8px       | Tight spacing, icon gaps                |
| `gap-4` / `p-4`        | 16px      | Component padding (standard)            |
| `gap-6` / `p-6`        | 24px      | Card padding                            |
| **`gap-8` / `p-8`**    | **32px**  | **Default component gaps**              |
| `gap-12` / `p-12`      | 48px      | Large section gaps                      |
| `gap-16` / `p-16`      | 64px      | Extra large gaps                        |
| **`gap-19` / `py-19`** | **76px**  | **Section padding (Creatikk standard)** |
| `gap-24` / `p-24`      | 96px      | Massive spacing                         |
| **`gap-30` / `p-30`**  | **120px** | **Extra large sections**                |

### Section Padding

Use the `.section-padding` utility class for consistent section spacing:

```tsx
<section className="section-padding">{/* py-19 (76px) + px-4 (16px) */}</section>
```

---

## Shadows & Depth

### Shadow System

| Name                         | Value                                     | Usage                              |
| ---------------------------- | ----------------------------------------- | ---------------------------------- |
| **`shadow-gold-glow`**       | `-7px 0px 20px -4px rgba(255,215,0,0.5)`  | Primary buttons (signature offset) |
| **`shadow-gold-glow-hover`** | `-7px 0px 30px -4px rgba(255,215,0,0.7)`  | Primary button hover state         |
| **`shadow-purple-glow`**     | `-7px 0px 20px -4px rgba(124,58,237,0.5)` | Secondary/accent elements          |
| **`shadow-card`**            | `0 2px 8px rgba(0,0,0,0.04)`              | Cards, subtle elevation            |
| **`shadow-none`**            | None                                      | Flat backgrounds                   |

### Usage Examples

```tsx
// Primary button with signature gold glow
<button className="btn-primary shadow-gold-glow hover:shadow-gold-glow-hover">
  Get Started
</button>

// Card with subtle elevation
<div className="bg-white rounded-premium shadow-card p-6">
  Card content
</div>
```

### Design Philosophy

- **Offset Glow** (-7px left): Creates depth and directional emphasis
- **Minimal Shadows**: Clean, modern aesthetic - use sparingly
- **Gold for Primary**: Primary actions get gold shadow for brand consistency
- **Purple for Secondary**: Accent elements use purple shadow

---

## Border Radius

| Name           | Value  | Usage                            | Tailwind Class    |
| -------------- | ------ | -------------------------------- | ----------------- |
| **Full Round** | 9999px | Buttons, pills, badges           | `rounded-full`    |
| **Premium**    | 22px   | Cards, modals, large components  | `rounded-premium` |
| **Input**      | 12px   | Input fields, selects, textareas | `rounded-input`   |
| **Medium**     | 8px    | Small cards, chips               | `rounded-lg`      |
| **Small**      | 4px    | Subtle rounding                  | `rounded`         |
| **None**       | 0px    | Sharp edges (rare)               | `rounded-none`    |

### Usage Guidelines

- **Buttons**: Always use `rounded-full` for pill shape
- **Cards**: Use `rounded-premium` for premium feel
- **Inputs**: Use `rounded-input` for consistency
- **Never use arbitrary values** - stick to design system tokens

```tsx
// Button
<button className="rounded-full px-6 py-2">
  Click Me
</button>

// Card
<div className="rounded-premium bg-white p-6">
  Card content
</div>

// Input
<input className="rounded-input border px-4 py-2" />
```

---

## Animations & Transitions

### Transition Timing

| Duration     | Value  | Usage                                 | Tailwind Class  |
| ------------ | ------ | ------------------------------------- | --------------- |
| **Standard** | 700ms  | Default transitions, premium feel     | `duration-700`  |
| **Quick**    | 300ms  | Input focus, tooltips                 | `duration-300`  |
| **Slow**     | 1000ms | Page transitions, major state changes | `duration-1000` |

### Timing Function

**Smooth Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

- Use `ease-smooth` for all transitions
- Creates smooth deceleration (starts fast, ends slow)
- Premium feel compared to linear or default ease

**Tailwind Class**: `ease-smooth`

### Properties to Animate

Recommended properties for smooth performance:

- `box-shadow` - Button glows, card elevation
- `opacity` - Fade effects, text reveals
- `transform` - Scale, translate, rotate
- `background-color` - Button hovers (use sparingly)

**Avoid animating**: `width`, `height`, `margin`, `padding` (causes layout thrash)

### Animation Utilities

| Animation          | Effect               | Usage                 |
| ------------------ | -------------------- | --------------------- |
| `animate-fade-in`  | Fade in from bottom  | Page entrance, modals |
| `animate-slide-up` | Slide up from bottom | Cards, sections       |

### Usage Examples

```tsx
// Standard hover transition
<button className="transition-all duration-700 ease-smooth hover:shadow-gold-glow-hover">
  Hover Me
</button>

// Page entrance animation
<div className="animate-fade-in">
  Content fades in
</div>

// Input focus (faster)
<input className="transition-all duration-300 focus:border-gold-500" />
```

### Design Principle

**Never use instant changes** - Always animate state transitions for premium feel.

---

## Background Patterns

Premium background effects inspired by Creatikk.io for both light and dark modes.

### Dot Grid Pattern

A perfectly aligned grid of subtle dots creating depth and premium feel. Theme-aware with different colors.

**Visual Characteristics**:

- **Alignment**: Perfectly regular grid (not random)
- **Size**: 1px dots (very precise)
- **Spacing**: 24px between each dot
- **Mask**: Fades out towards edges using radial gradient mask (ellipse 70% 50%)

**Theme Differences**:
| Theme | Dot Color | Opacity |
|-------|-----------|---------|
| Light | Purple (`rgba(124, 58, 237, 0.08)`) | 8% |
| Dark | White (`rgba(255, 255, 255, 0.12)`) | 12% |

**Implementation** (React component with theme awareness):

```tsx
export function DotGrid({ className = '' }: DotGridProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`
            : `radial-gradient(circle, rgba(124, 58, 237, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 80%)',
        }}
      />
    </div>
  );
}
```

**Usage**:

```tsx
import { DotGrid } from '../components/ui/dot-grid';

// Add to any full-screen container
<div className="relative min-h-screen">
  <DotGrid />
  {/* Content with z-10 */}
</div>;
```

### Gradient Background

Multi-layered radial gradients with purple and gold accents. Different implementations for light and dark modes.

#### Dark Mode Background

**Visual Characteristics**:

- **Base**: Dark gradient (#0B0F19 → #111827 → #0f172a)
- **Purple Accent**: Large ellipse at bottom center (15% opacity)
- **Purple Secondary**: Smaller ellipse on left (10% opacity)
- **Gold Accent**: Subtle ellipse on right (8% opacity)
- **Direction**: Gradients positioned towards bottom of viewport

**Implementation**:

```css
html.dark body {
  background:
    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 20% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 40%),
    radial-gradient(ellipse 50% 30% at 80% 90%, rgba(255, 215, 0, 0.08) 0%, transparent 35%),
    linear-gradient(180deg, #0b0f19 0%, #111827 40%, #0f172a 100%);
  background-attachment: fixed;
}
```

#### Light Mode Background

**Visual Characteristics**:

- **Base**: Subtle gray gradient (#fafafa → #f5f5f7 → #fafafa)
- **Purple Accent**: Large ellipse at bottom center (6% opacity) - more subtle than dark mode
- **Purple Secondary**: Smaller ellipse on left (4% opacity)
- **Gold Accent**: Subtle ellipse on right (5% opacity)
- **Overall Feel**: Clean, minimal, professional

**Implementation**:

```css
html:not(.dark) body {
  background:
    radial-gradient(ellipse 100% 50% at 50% 100%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse 70% 40% at 0% 100%, rgba(124, 58, 237, 0.04) 0%, transparent 40%),
    radial-gradient(ellipse 50% 30% at 100% 100%, rgba(255, 215, 0, 0.05) 0%, transparent 35%),
    linear-gradient(180deg, #fafafa 0%, #f5f5f7 50%, #fafafa 100%);
  background-attachment: fixed;
}
```

### Combined Effect

For premium auth pages and landing sections:

1. **Base Layer**: Dark gradient background (via body styles)
2. **Dot Layer**: DotGrid component with mask
3. **Content Layer**: Glass cards with z-10

```tsx
<div className="min-h-screen relative overflow-hidden">
  {/* Dot grid background */}
  <DotGrid />

  {/* Content on top */}
  <div className="relative z-10">
    <div className="glass-card p-8">{/* Form content */}</div>
  </div>
</div>
```

---

## Glassmorphism Effects

Inspired by Creatikk, adapted for both light and dark modes.

### Backdrop Blur

| Name           | Value | Usage                         | Tailwind Class             |
| -------------- | ----- | ----------------------------- | -------------------------- |
| **Accent**     | 30px  | Cards, modals                 | `backdrop-blur-accent`     |
| **Background** | 100px | Large overlays, hero sections | `backdrop-blur-background` |

### Glass Card Pattern

```tsx
<div className="glass-card p-6">{/* Semi-transparent white with blur and border */}</div>
```

**CSS Implementation**:

```css
.glass-card {
  @apply bg-white/80 backdrop-blur-accent border border-gray-200/50 rounded-premium;
}
```

### Usage Guidelines

- **Light Mode Challenge**: Glass effects work best on dark backgrounds
- **Solution**: Use `white/80` opacity with subtle borders for definition
- **Border Strategy**: `border-gray-200/50` provides necessary contrast
- **Best Use Cases**: Modals, overlays, feature cards on gradient backgrounds

---

## Component Patterns

### Primary Button

Premium button with gold glow (Creatikk signature style).

```tsx
<button className="btn-primary">Get Started</button>
```

**CSS Implementation**:

```css
.btn-primary {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-full px-4
         bg-white text-black font-semibold shadow-gold-glow
         transition-shadow duration-700 ease-smooth
         hover:shadow-gold-glow-hover;
}
```

**Variants**:

- Default: White bg, black text, gold shadow
- Disabled: Add `disabled:opacity-50 disabled:cursor-not-allowed`
- Loading: Add spinner icon with `animate-spin`

### Secondary Button

Outline button with border.

```tsx
<button className="btn-secondary">Learn More</button>
```

**CSS Implementation**:

```css
.btn-secondary {
  @apply inline-flex h-10 items-center justify-center gap-2 rounded-full px-4
         bg-transparent text-black font-semibold border-2 border-gold-500
         transition-all duration-700 ease-smooth
         hover:bg-gold-50;
}
```

### Input Field

Consistent input styling across forms.

```tsx
<input className="input-field" placeholder="Enter email" />
```

**CSS Implementation**:

```css
.input-field {
  @apply w-full rounded-input border border-gray-300 px-4 py-2
         focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
         transition-all duration-300;
}
```

**States**:

- Default: Gray border
- Focus: Gold border with ring
- Error: `border-error focus:ring-error/20`
- Disabled: `disabled:bg-gray-50 disabled:cursor-not-allowed`

### Card

Premium card with subtle shadow.

```tsx
<div className="bg-white rounded-premium shadow-card p-6">
  <h3 className="text-2xl font-normal mb-4">Card Title</h3>
  <p className="text-black/60">Card content goes here</p>
</div>
```

**Glass Variant**:

```tsx
<div className="glass-card p-6">
  <h3 className="text-2xl font-normal mb-4">Glass Card</h3>
  <p className="text-black/60">Semi-transparent with blur</p>
</div>
```

### Badge / Pill

Small accent elements.

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1 text-sm font-medium text-gold-800">
  New
</span>
```

**Variants**:

- Gold: `bg-gold-100 text-gold-800`
- Purple: `bg-purple-100 text-purple-800`
- Success: `bg-green-100 text-green-800`
- Error: `bg-red-100 text-red-800`

### Toast Notifications (Sonner)

All user actions must provide feedback via toast notifications. We use **Sonner** for this purpose.

**Configuration** (in App.tsx):

```tsx
import { Toaster } from 'sonner';

<Toaster
  theme={theme}
  position="top-right"
  toastOptions={{
    duration: 4000,
    classNames: {
      toast: 'font-sans rounded-premium border border-theme shadow-card',
      title: 'text-foreground font-semibold',
      description: 'text-muted',
      success: 'bg-success/10 border-success/30 text-success',
      error: 'bg-error/10 border-error/30 text-error',
      warning: 'bg-warning/10 border-warning/30 text-warning',
      info: 'bg-info/10 border-info/30 text-info',
    },
  }}
/>;
```

**Usage**:

```tsx
import { toast } from 'sonner';

// Success notification
toast.success(t('settings.organization.updateSuccess'));

// Error notification
toast.error(t('settings.organization.updateError'));

// Warning notification
toast.warning('Warning message');

// Info notification
toast.info('Information message');

// Custom toast with description
toast.success('Title', {
  description: 'Additional details here',
});

// Loading toast (for async operations)
toast.promise(asyncOperation(), {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error occurred',
});
```

**When to Use Toasts**:

- ✅ After successful CRUD operations (create, update, delete)
- ✅ After form submissions
- ✅ When API calls fail
- ✅ For important state changes
- ✅ After user actions that need confirmation

**When NOT to Use Toasts**:

- ❌ For navigation feedback (use loading states instead)
- ❌ For inline form validation (use field-level errors)
- ❌ For every micro-interaction
- ❌ For real-time data updates (unless user-initiated)

**Toast Rules**:

1. **Always use translations** - Never hardcode toast messages
2. **Keep messages concise** - Max 2 sentences
3. **Use appropriate type** - success/error/warning/info
4. **Pair with mutations** - Add toasts in onSuccess/onError callbacks
5. **Duration** - 4 seconds default, 6 seconds for errors

---

## Accessibility

### Color Contrast

**WCAG AA Minimum**: 4.5:1 for normal text, 3:1 for large text

**Tested Combinations**:

- ✅ Black text on white bg: 21:1 (excellent)
- ✅ Gold-800 on white: 4.7:1 (pass)
- ✅ Purple-700 on white: 7.3:1 (excellent)
- ✅ White text on purple-500: 5.9:1 (pass)
- ⚠️ Gold-500 on white: 1.4:1 (fail) - use gold-700+ for text

**Guidelines**:

- Primary text: Use `text-black` on white backgrounds
- Link text: Use `text-gold-700` or darker
- Buttons: White bg with black text (21:1) or purple-500 bg with white text (5.9:1)

### Focus Indicators

All interactive elements receive a gold focus ring automatically:

```css
:focus-visible {
  @apply outline-none ring-2 ring-gold-500 ring-offset-2;
}
```

**Do not override** unless providing an alternative with equal or better visibility.

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order should follow visual order
- Provide visible focus indicators (handled by design system)
- Support Enter/Space for buttons and links

### Screen Reader Support

- Use semantic HTML (button, nav, main, etc.)
- Provide alt text for images
- Use aria-label for icon-only buttons
- Announce dynamic content changes with aria-live

---

## Usage Guidelines

### Do's ✅

- ✅ Use design system tokens (gold-500, rounded-premium, etc.)
- ✅ Apply `btn-primary` class for primary buttons
- ✅ Use `section-padding` for section spacing
- ✅ Animate all interactive elements (duration-700 ease-smooth)
- ✅ Use Manrope font (`font-sans`)
- ✅ Apply `shadow-gold-glow` to primary actions
- ✅ Use `glass-card` for semi-transparent cards
- ✅ Test color contrast for accessibility
- ✅ Provide focus indicators for all interactive elements

### Don'ts ❌

- ❌ Don't use arbitrary values (`w-[350px]`) - use Tailwind scale
- ❌ Don't use non-design-system colors (`bg-blue-500`)
- ❌ Don't use other fonts (`font-inter`)
- ❌ Don't skip animations on interactive elements
- ❌ Don't use `rounded-lg` for buttons - use `rounded-full`
- ❌ Don't override focus indicators without providing alternatives
- ❌ Don't use gold-500 for text (fails contrast)
- ❌ Don't create instant state changes - always animate

---

## Examples

### Login Form

```tsx
<div className="glass-card p-8 max-w-md mx-auto">
  <h2 className="text-section font-bold leading-section mb-6">Welcome Back</h2>

  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Email</label>
      <input type="email" className="input-field" placeholder="you@example.com" />
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Password</label>
      <input type="password" className="input-field" placeholder="••••••••" />
    </div>

    <button type="submit" className="btn-primary w-full">
      Sign In
    </button>

    <button type="button" className="btn-secondary w-full">
      Sign Up
    </button>
  </form>
</div>
```

### Feature Card

```tsx
<div className="bg-white rounded-premium shadow-card p-6 hover:shadow-lg transition-shadow duration-700 ease-smooth">
  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-gold-600">...</svg>
  </div>

  <h3 className="text-2xl font-normal mb-2">Fast Deployment</h3>

  <p className="text-black/60">
    Deploy your SaaS in minutes, not weeks. Our boilerplate includes everything you need.
  </p>
</div>
```

### Hero Section

```tsx
<section className="section-padding text-center">
  <h1 className="text-hero font-bold leading-hero mb-6 animate-fade-in">
    Ship Your SaaS <span className="text-gradient">Faster</span>
  </h1>

  <p className="text-lg text-black/60 max-w-2xl mx-auto mb-8 animate-slide-up">
    Production-ready boilerplate with authentication, billing, and multi-tenancy built-in.
  </p>

  <div className="flex gap-4 justify-center">
    <button className="btn-primary">Get Started</button>
    <button className="btn-secondary">View Demo</button>
  </div>
</section>
```

---

## Reference

**Inspired by**: [Creatikk.io](https://www.creatikk.io/)

**Implementation Files**:

- `apps/front/tailwind.config.js` - Theme configuration
- `apps/front/src/styles/globals.css` - Component classes and utilities
- `CLAUDE.md` - Design system rules for Claude Code

**Questions or Feedback**: Update this document as the design evolves. This is a living system.

---

**Last Updated**: January 2026
**Version**: 1.0.0
