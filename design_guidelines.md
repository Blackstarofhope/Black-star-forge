# THE BLACK STAR FORGE - Design Guidelines

## Design Approach
**Reference-Based:** Drawing from cyberpunk interfaces (Cyberpunk 2077 UI, Hackers terminals, Blade Runner aesthetics) combined with modern code editor patterns (VS Code, Linear's clean data-density, GitHub's developer-first layouts).

**Core Aesthetic:** Cyberpunk technical precision - high-contrast, data-dense, terminal-inspired with futuristic accents.

---

## Typography System

**Primary Font:** JetBrains Mono (via Google Fonts) - monospace for technical authenticity
**UI Font:** Inter (via Google Fonts) - for labels, buttons, non-code text

**Hierarchy:**
- Code Editor: `font-mono text-sm` (14px)
- Section Headers: `font-sans text-xs uppercase tracking-widest font-semibold` (10px, letter-spacing: 2px)
- Button Text: `font-sans text-sm font-medium` (14px)
- Body Labels: `font-sans text-xs` (12px)
- File Names: `font-mono text-xs` (12px)

---

## Layout System

**Spacing Scale:** Use Tailwind units of **1, 2, 3, 4, 6, 8** for consistent rhythm
- Component padding: `p-3` or `p-4`
- Section gaps: `gap-4` or `gap-6`
- Panel spacing: `space-y-2` or `space-y-3`
- Border radius: `rounded` (4px) or `rounded-lg` (8px) for panels

**Grid Structure:**
```
[Sidebar: 280px fixed] [Editor: flex-1] [Preview: 480px fixed]
```

**Sidebar Width:** `w-70` (280px)
**Preview Pane:** `w-[480px]` resizable
**Panel Headers:** `h-10` (40px) fixed height
**Tab Heights:** `h-8` (32px)

---

## Component Library

### Navigation & Panels
**File Explorer:**
- Nested tree structure with indent `pl-4` per level
- File icons from Heroicons (DocumentIcon, FolderIcon)
- Hover state: subtle background shift
- Active file: border-left accent bar `border-l-2`

**Tab System:**
- Horizontal tabs `h-8` with `px-3` padding
- Active tab: underline indicator `border-b-2`
- Close icons: small X with hover state

**God View Panel:**
- Full-height canvas for react-flow graph
- Minimap in bottom-right corner
- Node cards with subtle glow effects
- Connection lines with animated flow direction

### Editor Zone
**Monaco Integration:**
- Full-height minus header
- Custom "Black Star" theme (configured via Monaco API)
- Line numbers visible
- Minimap enabled on right side

### Controls & Inputs
**Buttons:**
- Primary CTAs: `px-4 py-2` with backdrop-blur
- Icon buttons: `w-8 h-8` square
- Deployment button: Larger `px-6 py-3` with animated pulse on "Deploy Live"

**Input Fields:**
- Height: `h-9` (36px)
- Padding: `px-3`
- Border: `border` with focus ring
- URL bar in preview: `w-full` with refresh icon button inline

**Dropdowns:**
- Model selector: `h-9` with chevron icon
- Hover menu: `w-48` with `p-2` item padding

### Knowledge Base Panel
**Scraper Input:**
- Large text area: `min-h-[120px]`
- Submit button below input
- Results display in expandable cards `p-4`

**Hive Toggle:**
- Switch component: `w-11 h-6` toggle
- Label adjacent with `gap-2`

### Chat Interface (Nazahary)
**Layout:**
- Fixed bottom panel or right sidebar option
- Message bubbles: `max-w-[80%]` with `p-3`
- Input bar: `h-12` with mic icon button
- User messages: right-aligned
- AI responses: left-aligned with avatar icon

### Deployment Modal
**Failover UI:**
- Modal overlay with `max-w-lg` card
- Progress steps visualization (Vercel → Netlify)
- Success state: URL display with copy button
- Error state: retry option visible

---

## Animations
**Minimal & Purposeful:**
- Tab switching: fade `transition-opacity duration-150`
- Panel resize: smooth drag with `transition-width duration-200`
- Deployment button pulse during active deploy (CSS keyframe animation)
- God View node hover: scale `scale-105 transition-transform duration-200`

---

## Icons
**Heroicons (outline):** DocumentIcon, FolderIcon, CodeBracketIcon, RocketLaunchIcon, ShareIcon, MicrophoneIcon, ChevronDownIcon, XMarkIcon, ArrowPathIcon

---

## Images
**No hero images.** This is a technical application, not a marketing site. The interface itself IS the visual showcase.

**Backgrounds:**
- Subtle grid pattern or terminal-style scanlines as CSS overlays
- No photographic imagery
- Optional: Abstract geometric patterns in panel backgrounds (very subtle, low opacity)

---

## Accessibility
- All interactive elements keyboard navigable
- Focus rings on all inputs/buttons
- ARIA labels for icon-only buttons
- Code editor uses Monaco's built-in a11y features
- Sufficient contrast ratios (4.5:1 minimum for text)

---

## Key Visual Principles
1. **Data Density:** Pack information efficiently - no wasted space
2. **Technical Precision:** Monospace fonts, exact alignments, grid-based layouts
3. **Depth Through Layering:** Panels, modals, overlays create dimensional hierarchy
4. **Functional Aesthetics:** Every glow, border, shadow serves to guide attention
5. **Terminal Heritage:** Embrace code-first design language throughout