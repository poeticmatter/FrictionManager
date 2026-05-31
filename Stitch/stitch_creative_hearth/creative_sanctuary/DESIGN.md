---
name: Creative Sanctuary
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f0eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#53433e'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0ea'
  outline: '#86736d'
  outline-variant: '#d8c2ba'
  surface-tint: '#8d4d34'
  primary: '#8a4b32'
  on-primary: '#ffffff'
  primary-container: '#a86248'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#51634e'
  on-secondary: '#ffffff'
  secondary-container: '#d1e6cb'
  on-secondary-container: '#556752'
  tertiary: '#785253'
  on-tertiary: '#ffffff'
  tertiary-container: '#936a6a'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#70361f'
  secondary-fixed: '#d4e8cd'
  secondary-fixed-dim: '#b8ccb2'
  on-secondary-fixed: '#0f1f0f'
  on-secondary-fixed-variant: '#3a4b37'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ecbbba'
  on-tertiary-fixed: '#2f1314'
  on-tertiary-fixed-variant: '#603d3e'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  canvas-margin-desktop: 64px
  canvas-margin-mobile: 24px
  gutter: 24px
  card-padding: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built to reduce cognitive load and foster a state of "flow" for creative thinkers. The brand personality is quiet, nurturing, and intentional—a digital equivalent of a clean physical studio with natural light. 

The aesthetic is a blend of **Soft Minimalism** and **Tactile Editorial**. It eschews the cold, precision-engineered look of typical productivity tools in favor of a "human-made" feel. The interface should feel like an extension of a paper journal or a well-organized desk. Every interaction is designed to be gentle, replacing frantic urgency with a sense of calm "Resting" and focused "Wake up" states. High whitespace ratios and a total absence of aggressive visual signals ensure the user's content remains the sole focus.

## Colors

The palette is anchored in a warm, low-contrast spectrum that mimics natural pigments. 

- **Primary (Terracotta):** Used for key actions and meaningful highlights. It provides warmth without the "alert" energy of pure red.
- **Secondary (Sage Green):** Representing "Resting" states and passive information. It suggests growth and stability.
- **Tertiary (Dusty Rose):** Used for supplementary accents and soft categorizations.
- **Neutral (Warm Cream):** This is the canvas. We avoid pure white (#FFFFFF) to reduce eye strain and maintain the "paper" feel.
- **Accent (Soft Amber):** Reserved for "Wake up" notifications or subtle attention-grabbing elements that require a gentle nudge.

Color application must be flat. Gradients, glows, and harsh dark panels are strictly forbidden. Transitions between colors should feel like ink soaking into paper.

## Typography

The typography strategy prioritizes an editorial feel over a technical one. 

**Literata** is used for headlines to provide a literary, scholarly character. Its varied stroke weights and organic terminals evoke the warmth of a published book.

**Plus Jakarta Sans** is used for body copy and UI labels. Its modern, soft-rounded geometry complements the editorial headlines while ensuring maximum legibility for functional tasks. 

Line heights are intentionally generous to provide "breathing room" between thoughts. All text should be rendered with a slight softening of the color—avoiding pure black (#000000) in favor of a very deep, warm charcoal to maintain the soft visual hierarchy.

## Layout & Spacing

The layout follows a **Fixed Center Canvas** philosophy. Rather than filling every pixel of a wide screen, content is contained within a focused central column (max-width: 1040px) to prevent the user's eyes from wandering.

- **Grid:** A simple 12-column system is used within the central canvas for complex views, but the default should be a single-stack flow.
- **Margins:** Desktop views require at least 64px of outer margin to create a "sanctuary" effect.
- **Rhythm:** We use an 8px base unit. Vertical spacing is oversized—when in doubt, add more space. 
- **Reflow:** On mobile, margins shrink to 24px, and all multi-column cards reflow into a single, vertical scroll to maintain the focus on one "thought" at a time.

## Elevation & Depth

This design system avoids traditional drop shadows that imply a light source from above. Instead, depth is conveyed through **Tonal Layers** and "Paper Stacking."

- **Base Layer:** The Warm Cream background.
- **Surface Layer (Cards):** These sit "on top" of the background. They are defined by a very subtle, slightly darker cream fill or a 1px solid border in a muted tone (e.g., Dusty Rose at 20% opacity).
- **Shadows:** When a shadow is necessary for a "Wake up" state (active focus), use an extremely diffused, low-opacity amber or terracotta-tinted shadow. It should look like a soft glow of light behind a piece of paper, not a harsh shadow.
- **Interaction:** Elements do not "lift" on hover; instead, they might subtly shift color or show a soft internal stroke.

## Shapes

The shape language is defined by the total absence of sharp corners. Everything is soft to the touch.

- **Standard Elements:** Buttons, input fields, and small containers use a 0.5rem (8px) radius.
- **Large Containers/Cards:** Use a 1rem (16px) radius to emphasize their role as the primary "tactile" objects in the space.
- **Pill Shapes:** Used exclusively for chips and status indicators (e.g., "Resting") to differentiate them from actionable buttons.

To achieve the "slightly imperfect" index card feel, card borders may have a very slight 0.5-degree rotation or a non-uniform border-radius in decorative contexts, though this should be used sparingly to avoid visual clutter.

## Components

### Cards
Cards are the core of this design system. They should mimic index cards or high-quality stationery. Use a 1px border in a muted secondary color. Padding must be generous (32px) to ensure content never feels crowded.

### Buttons
Buttons are never "loud." The primary button uses the Terracotta color with white or cream text. Secondary buttons use a Sage outline. There are no hover "pops"—only a gentle deepening of the background color.

### Inputs
Text fields are simple horizontal lines or soft-rounded boxes with a Warm Cream fill that is 2% darker than the background. The focus state is a soft Amber underline.

### Chips & Tags
Used for "Resting" and "Wake up" states. These are pill-shaped with low-contrast fills. 
- **Resting:** Sage fill with deep green text.
- **Wake up:** Amber fill with deep terracotta text.

### Icons
Icons must be "Soft & Rounded." Use a consistent 2px stroke width with rounded caps and joins. Avoid sharp geometric shapes; prefer organic, hand-drawn-adjacent silhouettes.

### Lists
Lists are separated by whitespace and subtle "ink-bleed" dividers—1px lines that do not span the full width of the container, fading out at the edges.