---
page: Leaderboard
---
A competitive Leaderboard page for BroApp, showing a list of top users by health score streaks and ranking.

**DESIGN SYSTEM (REQUIRED):**
- Dark Mode Native: The app exists entirely in dark mode. No light mode toggles.
- Neon Accents: Bright, saturated colors cut through the darkness. Primarily "Bro Green" (`#00ff88`).
- Backgrounds: Variable `--bro-black` (deep gray/black, `#0a0a0a`), slightly lighter overlays like `#1a1a1a`.
- Primary Accent: Variable `--bro-green` (`#00ff88`). Used for primary buttons, highlights, good health scores.
- Text: High contrast white (`#ffffff`) for main headings, light gray (`#aaaaaa`) for secondary text.
- Glass Panels (`.glass-panel`): Background `rgba(20, 20, 20, 0.7)`, border `1px solid rgba(255, 255, 255, 0.1)`, backdrop filter `blur(10px)`, border radius `15px`.
- Buttons (`.bro-btn-primary`): Background `#00ff88`, Color `#000000`, Font Weight `bold`, Border Radius `8px`, no border, padding `15px 20px`.
- Background of the main container MUST be `#0a0a0a`.
- Use `lucide-react` for any standard icons like 'Trophy', 'Medal', 'Star'.

**Page Structure:**
1. A top header containing a "Back" button (arrow-left icon) and the title "LEADERBOARD".
2. A large central element showing the current user's rank.
3. A list of 5 dummy users (e.g., "Chad123", "ProteinKing") showing their rank (1-5), their avatar/icon, their name, and their total score.
4. The #1 rank should have special visual styling, such as a subtle neon green glow or a gold color.
5. A glass panel at the bottom explaining how scores are calculated.
