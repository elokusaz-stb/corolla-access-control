# Corolla UI/UX Technical Specification

## Design Philosophy

**"Modern SaaS Workspace"** — Corolla embodies a professional yet friendly aesthetic that balances enterprise functionality with delightful interactions.

### Core Principles

1. **App-within-an-App**: The entire interface lives inside a floating window, creating a contained, focused workspace
2. **Tactile Depth**: Heavy use of borders and deep shadows creates tangible, touchable surfaces
3. **Soft Geometry**: Aggressive border radii throughout create a friendly, approachable feel
4. **Purple Elegance**: A cohesive purple-based palette that feels modern and distinctive

## Color Palette

### Tailwind Configuration

```typescript
colors: {
  corolla: {
    canvas: '#D3A4F1',              // Page background
    surface: '#FDF7FF',             // Floating window background
    primary: '#6750A4',             // Primary actions
    'primary-container': '#EADDFF', // Highlight containers
    'surface-variant': '#F3EDF7',   // Sidebar, secondary surfaces
    outline: '#E7E0EC',             // Borders
    'on-surface': '#1D192B',        // Primary text
    'on-surface-variant': '#49454F',// Secondary text
    'active-nav': '#E8DEF8',        // Active navigation
    'quick-grant-border': '#D0BCFF',// Primary container borders
  }
}
```

### Color Usage Guide

| Element | Color Token | Hex |
|---------|-------------|-----|
| Page background | `corolla-canvas` | #D3A4F1 |
| App surface | `corolla-surface` | #FDF7FF |
| Primary buttons | `corolla-primary` | #6750A4 |
| Cards/highlights | `corolla-primary-container` | #EADDFF |
| Sidebar | `corolla-surface-variant` | #F3EDF7 |
| Borders | `corolla-outline` | #E7E0EC |
| Primary text | `corolla-on-surface` | #1D192B |
| Secondary text | `corolla-on-surface-variant` | #49454F |

## Border Radius Hierarchy

```css
/* Window container */
.rounded-window { border-radius: 2.5rem; }  /* 40px */

/* Modals/Cards */
.rounded-[2rem] { border-radius: 2rem; }    /* 32px */

/* Cards/Containers */
.rounded-2xl { border-radius: 1rem; }       /* 16px */

/* Inputs/Chips */
.rounded-xl { border-radius: 0.75rem; }     /* 12px */

/* Buttons/Pills */
.rounded-full { border-radius: 9999px; }
```

## Shadow Hierarchy

```css
/* Floating window - deepest shadow */
.shadow-window: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Modal overlays */
.shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Cards */
.shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Elevated elements */
.shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Inset elements (Quick Grant card) */
.shadow-quick-grant: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

## Typography

### Font Stack

```css
font-family: var(--font-geist-sans), system-ui, sans-serif;
```

### Text Styles

```css
/* Page titles */
.corolla-page-title {
  @apply text-2xl font-black tracking-tight text-corolla-on-surface;
}

/* Section titles */
.corolla-section-title {
  @apply text-xl font-bold tracking-tight text-corolla-on-surface;
}

/* Labels */
.corolla-label {
  @apply text-xs font-bold uppercase tracking-wider text-corolla-on-surface-variant;
}

/* Body text */
.text-corolla-on-surface /* Primary */
.text-corolla-on-surface-variant /* Secondary/Muted */
```

## Structural Components

### Floating Window Container

The main application lives inside a floating window:

```html
<div class="
  mx-auto max-w-6xl
  bg-corolla-surface
  border-8 border-white/50
  rounded-window
  shadow-window
  overflow-hidden
  h-[85vh]
">
  <!-- App content -->
</div>
```

### Sidebar

```html
<aside class="w-64 bg-corolla-surface-variant flex flex-col">
  <!-- Logo/Brand -->
  <div class="px-4 py-6">
    <h1 class="text-lg font-black text-corolla-on-surface">Corolla</h1>
  </div>
  
  <!-- Navigation -->
  <nav class="flex-1 px-3 space-y-1">
    <!-- Active item -->
    <a class="
      flex items-center gap-2.5 px-4 py-2.5
      bg-corolla-active-nav text-corolla-on-surface
      rounded-full font-bold shadow-sm
    ">
      <Icon /> Dashboard
    </a>
    
    <!-- Inactive item -->
    <a class="
      flex items-center gap-2.5 px-4 py-2.5
      text-corolla-on-surface-variant
      rounded-full
      hover:bg-white/50 hover:text-corolla-on-surface
      transition-all duration-200
    ">
      <Icon /> Systems
    </a>
  </nav>
  
  <!-- User section at bottom -->
</aside>
```

### Topbar

```html
<header class="
  flex items-center justify-between
  px-6 py-4
  border-b border-corolla-outline
  bg-corolla-surface
">
  <h1 class="corolla-page-title">Page Title</h1>
  <button class="corolla-btn-primary">
    Quick Action
  </button>
</header>
```

## Button Styles

### Primary Button

```css
.corolla-btn-primary {
  @apply inline-flex items-center justify-center gap-2;
  @apply bg-corolla-primary text-white;
  @apply rounded-full px-5 py-2.5;
  @apply font-semibold text-sm;
  @apply shadow-lg shadow-corolla-primary/25;
  @apply transition-all duration-200;
  @apply hover:brightness-110 hover:shadow-xl;
  @apply active:scale-95;
  @apply focus:ring-2 focus:ring-corolla-primary focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

### Secondary Button

```css
.corolla-btn-secondary {
  @apply inline-flex items-center justify-center gap-2;
  @apply bg-white text-corolla-on-surface;
  @apply rounded-full px-4 py-2;
  @apply font-medium text-sm;
  @apply border border-corolla-outline;
  @apply transition-all duration-200;
  @apply hover:bg-corolla-surface-variant hover:shadow-md;
  @apply active:scale-95;
}
```

### Ghost Button

```css
.corolla-btn-ghost {
  @apply inline-flex items-center justify-center gap-2;
  @apply bg-transparent text-corolla-on-surface-variant;
  @apply rounded-full px-4 py-2;
  @apply transition-all duration-200;
  @apply hover:bg-white/50 hover:text-corolla-on-surface;
  @apply active:scale-95;
}
```

## Form Elements

### Input Fields

```css
.corolla-input {
  @apply w-full bg-white border-0 rounded-xl p-3;
  @apply text-corolla-on-surface;
  @apply shadow-sm;
  @apply transition-all duration-200;
  @apply hover:shadow-md;
  @apply focus:ring-2 focus:ring-corolla-primary focus:ring-offset-0;
  @apply placeholder:text-corolla-on-surface-variant/60;
}
```

### Labels

```css
.corolla-field-label {
  @apply block text-xs font-bold uppercase tracking-wider;
  @apply text-corolla-on-surface-variant mb-2;
}
```

### Textarea

```css
.corolla-textarea {
  @apply w-full bg-white border-2 border-transparent rounded-xl p-3;
  @apply text-corolla-on-surface;
  @apply shadow-sm resize-none;
  @apply focus:ring-2 focus:ring-corolla-primary focus:border-corolla-quick-grant-border;
}
```

## Cards & Containers

### Standard Card

```css
.corolla-card {
  @apply bg-white rounded-2xl border border-corolla-outline;
  @apply overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:shadow-lg hover:-translate-y-0.5;
}
```

### Quick Grant Card (Highlighted)

```css
.corolla-quick-grant {
  @apply bg-corolla-primary-container;
  @apply border-2 border-corolla-quick-grant-border;
  @apply shadow-quick-grant;
  @apply rounded-2xl p-6;
  @apply animate-slide-in-from-top;
}
```

### List Container

```css
.corolla-list {
  @apply bg-corolla-surface rounded-[2rem];
  @apply border border-corolla-outline;
  @apply shadow-lg;
  @apply overflow-hidden;
}
```

## Status Badges

```css
/* Active */
.corolla-badge--active {
  @apply bg-green-100 text-green-700 border-green-200;
}

/* Removed */
.corolla-badge--removed {
  @apply bg-gray-100 text-gray-500 border-gray-200 line-through;
}

/* Pending (Phase 2) */
.corolla-badge--pending {
  @apply bg-amber-100 text-amber-700 border-amber-200;
}

/* Info */
.corolla-badge--info {
  @apply bg-corolla-primary-container text-corolla-primary border-corolla-quick-grant-border;
}
```

## Avatars

```css
.corolla-avatar {
  @apply rounded-full overflow-hidden;
  @apply bg-corolla-primary-container;
  @apply flex items-center justify-center;
  @apply text-corolla-primary font-bold;
  @apply transition-transform duration-200;
  @apply hover:scale-105;
}
```

## Animations

### Entry Animations

```css
/* Slide down */
.animate-slide-in-from-top {
  animation: slide-in-from-top 0.3s ease-out;
}

/* Fade in */
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

/* Zoom in */
.animate-zoom-in {
  animation: zoom-in 0.2s ease-out;
}

/* Staggered list items */
.animate-stagger-fade-in {
  animation: stagger-fade-in 0.3s ease-out forwards;
}
```

### Interaction Animations

```css
/* Button press */
.active:scale-95

/* Card hover lift */
.hover:-translate-y-0.5

/* Avatar scale */
.hover:scale-105

/* Success pop */
.animate-success-pop {
  animation: success-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Stagger Delays

```css
.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 200ms; }
.stagger-5 { animation-delay: 250ms; }
```

## Drawer/Modal

### Drawer (Right Side)

```css
.corolla-drawer {
  @apply fixed inset-y-0 right-0 z-50;
  @apply w-full max-w-xl;
  @apply bg-corolla-surface;
  @apply border-l-4 border-white/50;
  @apply shadow-2xl;
  @apply animate-slide-in-from-right;
}
```

### Modal (Centered)

```css
.corolla-modal {
  @apply w-full max-w-lg;
  @apply bg-corolla-surface;
  @apply rounded-[2rem];
  @apply border-4 border-white/50;
  @apply shadow-2xl;
  @apply animate-zoom-in;
}
```

### Backdrop

```css
.corolla-backdrop {
  @apply fixed inset-0 z-40;
  @apply bg-corolla-on-surface/20 backdrop-blur-sm;
  @apply animate-fade-in;
}
```

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```css
:focus {
  @apply outline-none;
  @apply ring-2 ring-corolla-primary ring-offset-2;
}
```

### ARIA Requirements

- Icon buttons: `aria-label="Action description"`
- Navigation: `role="navigation"`
- Dialogs: `role="dialog" aria-modal="true"`
- Status updates: `role="status" aria-live="polite"`

### Color Contrast

All text meets WCAG AA contrast requirements:
- Primary text (#1D192B) on surface (#FDF7FF): 14.5:1 ✓
- Secondary text (#49454F) on surface (#FDF7FF): 7.8:1 ✓

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Adaptations

- Floating window becomes full-screen on mobile
- Sidebar collapses to hamburger menu
- Grid columns stack vertically
- Touch targets minimum 44×44px

## Icons

Use Lucide React icons consistently:

```tsx
import { Settings, Shield, Layers, Plus, Trash2, Check } from 'lucide-react';

// Standard icon sizing
<Icon className="h-4 w-4" /> // In buttons
<Icon className="h-5 w-5" /> // Standalone
<Icon className="h-6 w-6" /> // Large/feature icons
```

