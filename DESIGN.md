# BroApp Design System

## 1. Core Principles
- **Dark Mode Native:** The app exists entirely in dark mode. No light mode toggles.
- **Neon Accents:** Bright, saturated colors cut through the darkness. Primarily "Bro Green" (`#00ff88`).
- **Glassmorphism:** Elements float on top of the black background using semi-transparent dark panels with subtle borders.

## 2. Color Palette
- **Backgrounds:** Variable `--bro-black` (deep gray/black, `#0a0a0a`), slightly lighter overlays like `#1a1a1a`.
- **Primary Accent:** Variable `--bro-green` (`#00ff88`). Used for primary buttons, highlights, good health scores.
- **Secondary/Warnings:** Deep reds or neon oranges for warnings/bad health scores (e.g., `#ff3366`).
- **Text:** High contrast white (`#ffffff`) for main headings, light gray (`#aaaaaa`) for secondary text.

## 3. Typography
- **Font Family:** 'Inter', '-apple-system', 'BlinkMacSystemFont', sans-serif.
- **Headings:** Bold, uppercase, tightly spaced.
- **Body:** Legible, modern sans-serif with comfortable line height.

## 4. Components & Utilities
- **Glass Panels (`.glass-panel`):**
  - Background: `rgba(20, 20, 20, 0.7)`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`
  - Backdrop Filter: `blur(10px)`
  - Border Radius: `15px`
- **Buttons (`.bro-btn-primary`):**
  - Background: `var(--bro-green)`
  - Text Color: `#000000`
  - Font Weight: `bold`
  - Border Radius: `8px`
  - Hover: Add Box Shadow `0 0 15px var(--bro-green)`
- **Secondary Buttons (`.bro-btn-secondary`):**
  - Background: `transparent`
  - Border: `1px solid var(--bro-green)`
  - Text: `var(--bro-green)`

## 6. Design System Notes for Stitch Generation
When generating screens for BroApp, YOU MUST follow these rules exactly:
- Use inline styles matching the exact values above.
- Background of the main container MUST be `#0a0a0a`.
- Containers within the page MUST use the glassmorphism approach: `background: rgba(20, 20, 20, 0.7)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `borderRadius: 15px`, `padding: 20px`.
- Primary actions MUST be standard BroApp buttons: background `#00ff88`, color black, font bold, padding `15px 20px`, border radius `8px`, `border: none`.
- Use `lucide-react` for any standard icons.
- Ensure text contrasts are extremely high.
- DO NOT invent new random button styles or color palettes. Stick exclusively to black, dark grays, white, and neon green (`#00ff88`).
