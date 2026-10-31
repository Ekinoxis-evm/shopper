# Design System Specification: High-End Dark Mode Editorial

## 1. Overview & Creative North Star
### Creative North Star: "The Obsidian Curator"
This design system is not a standard utility; it is a premium digital environment designed to showcase products with the same intentionality as a high-end editorial magazine or a luxury boutique. We move away from the "boxy" nature of standard apps by embracing **Soft Minimalism**. 

The "Obsidian Curator" philosophy relies on high-contrast typography, immense negative space, and deep tonal layering. By rejecting traditional structural lines and borders, we create an interface that feels infinite, fluid, and expensive. The design breaks the grid through intentional asymmetry—placing display text off-center or overlapping images over subtle surface shifts—ensuring the experience feels "hand-crafted" rather than templated.

---

## 2. Colors & Surface Architecture
The color palette is rooted in deep charcoals and blacks to provide a canvas where the primary accent can truly vibrate.

### The Palette
- **Core Background (`surface`):** `#131313` - The foundation.
- **Primary Accent (`primary_container`):** `#22C55E` - The vibrant green reserved exclusively for action and momentum.
- **Typography (`on_background`):** `#e2e2e2` - A softened white to prevent retinal fatigue while maintaining high contrast.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To separate content, designers must use background color shifts. For instance, a main content area using `surface` (`#131313`) may transition into a footer or side-rail using `surface_container_low` (`#1b1b1b`). This creates a seamless, "liquid" transition between sections.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
1. **Base Layer:** `surface` (#131313)
2. **Elevated Sections:** `surface_container` (#1f1f1f)
3. **Nesting Depth:** Place a `surface_container_highest` (#353535) card inside a `surface_container_low` (#1b1b1b) section to create natural focus without a single pixel of stroke.

### The "Glass & Gradient" Rule
To add "soul" to the digital interface:
- **Glassmorphism:** For floating navigation or modals, use `surface_variant` at 60% opacity with a `24px` backdrop-blur. 
- **Signature Textures:** Main CTAs should not be flat. Use a subtle linear gradient from `primary` (`#4be277`) to `primary_container` (`#22c55e`) at a 135-degree angle to provide a tactile, premium sheen.

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** for authority and **Manrope** for clarity.

*   **Display (Plus Jakarta Sans):** Used for "Hero" moments. Large scale (`display-lg`: 3.5rem) with tight letter-spacing (-0.02em) conveys a modern, editorial confidence.
*   **Headlines (Plus Jakarta Sans):** Used for section titles. These should feel bold and structural.
*   **Body (Manrope):** The workhorse. Manrope’s geometric nature ensures high legibility at small scales (`body-md`: 0.875rem) against dark backgrounds.
*   **Labels (Manrope):** All-caps with increased letter-spacing (+0.05em) for category tags or micro-copy to create a "curated" feel.

---

## 4. Elevation & Depth
In this design system, light does not come from above; it emerges from the layering of tones.

### The Layering Principle
Hierarchy is achieved by "stacking" tones. A `surface_container_lowest` (#0e0e0e) card placed on a `surface` (#131313) background creates a "sunken" aesthetic, while `surface_container_high` (#2a2a2a) creates a "lifted" aesthetic.

### Ambient Shadows
Shadows must be felt, not seen. 
- **Style:** Use a 40px - 60px blur radius.
- **Opacity:** 4% to 8%.
- **Color:** Instead of black, use a tinted shadow derived from `primary_fixed_variant` (#005321) at extremely low opacity to mimic the "glow" of the green accent against the charcoal.

### The "Ghost Border" Fallback
If a container sits on a background of the same tone (e.g., for accessibility), use a **Ghost Border**: `outline_variant` (#3d4a3d) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). Roundedness: `DEFAULT` (8px). Text: `on_primary_fixed` (#002109), Bold.
- **Secondary:** Surface-only. Background: `surface_container_highest`. No border.
- **Tertiary:** Ghost style. Text only in `primary`.

### Cards & Lists
- **Rule:** Absolute prohibition of divider lines.
- **Separation:** Use `80px` to `120px` of vertical white space to separate list items or use alternating tonal shifts (`surface` to `surface_container_low`).
- **Interaction:** On hover, a card should shift from `surface_container` to `surface_container_high` with a subtle `4px` Y-axis lift.

### Input Fields
- **Default State:** `surface_container_low` background with an `8px` corner radius.
- **Focus State:** A "Ghost Border" of `primary` at 40% opacity and a subtle inner glow.
- **Labeling:** Use `label-md` floating above the field in `on_surface_variant`.

### Signature Component: The "Curator Glass" Modal
A full-screen overlay using a heavy backdrop-blur (30px) and `surface_container_lowest` at 70% opacity. This creates a focused, immersive environment for checkout or product details.

---

## 6. Do's and Don'ts

### Do
*   **DO** use generous negative space. If a section feels crowded, double the padding.
*   **DO** use `surface_bright` sparingly for "pop-out" elements like tooltips.
*   **DO** lean into asymmetry. Align a headline to the left and a CTA to the far right with significant "dead air" in between.

### Don'ts
*   **DON'T** use #000000 for text. It creates "vibration" against the dark background. Use `on_surface` (#e2e2e2).
*   **DON'T** use 1px solid dividers. If you need a line, use a 4px wide, 20% opacity `outline` color as a "design accent" rather than a structural divider.
*   **DON'T** use standard drop shadows. Always use the Ambient Shadow specification for a diffused, high-end look.