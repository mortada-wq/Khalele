# Khalele Design Bible

**Sharp rules. No exceptions.**

---

## 1. Language: Arabic-First UI and Chat

- **UI:** All interface text (buttons, labels, menus, placeholders, errors) must be in Arabic only.
- **Chat:** Responses are in Arabic by default. Use English only when the user explicitly asks for English (e.g., "explain in English", "translate to English").
- **Override:** This rule can change only if the admin/designer explicitly requests an Arabic/English toggle in the UI.

---

## 2. Typography: Only 4 Arabic Google Fonts

**Allowed fonts (no others):**

| Font | Role | Usage |
|------|------|--------|
| **Aref Ruqaa** | Titles & highlights | `font-size: clamp(24px, 5vw, 42px)`. Use only weight 400 or 700. No faux italics. |
| **Amiri** | Body paragraphs | `line-height: 1.8`, `font-size` never below 18px, `text-align: right` (no justify). |
| **Noto Naskh Arabic** | App UI & buttons | All functional text: settings, labels, timestamps, buttons. `width: auto; padding-inline: 20px`. |
| **Noto Nastaliq Urdu** | Poetry & special lines | `line-height: 3.0`, `padding-bottom: 20px`. Must be center-aligned and on its own line. |

**Content-specific styling:**
- **Quotes in paragraphs:** Amiri Bold or Aref Ruqaa, with `background: rgba(212, 175, 55, 0.1); border-radius: 4px`.
- **Quranic verses:** Aref Ruqaa, wrapped in `inline-block` to avoid clipping.
- **Poetry:** Noto Nastaliq Urdu, new line, center-aligned, `margin-block: 2rem`.

**Global RTL rules:**
- Use logical properties only: `inline-start` / `inline-end`, never `left` / `right`.
- Numbers (phone, OTP, prices): `direction: ltr; unicode-bidi: embed;`.
- Arabic fonts: `letter-spacing: 0`.
- Do not mirror icons (play, clock, checkmark).
- Use `font-display: swap` for font loading.
- Containers: `min-height` + `height: auto`, never fixed `height` only.

**Strict rule:** No font outside these four may appear anywhere in the app (user-facing, admin, or any other screen).

---

## 3. Design & Engineering Manifesto: Colors, Shapes, and Layout

**Color palette (only these):**
- **Gold:** `#C68E17`
- **Earth/Coffee:** `#8B7355`
- **Black:** `#000000`
- **Gray:** Use only gray tones from the design system

**Shapes and strokes:**
- **Fills:** Solid colors or 135° linear gradients (darker shade → base color).
- **Strokes:** Optional. If used: 1px–2px, 10% darker than the fill.
- **Corners:** `border-radius` between 24px and 32px. No sharp squares or perfect circles.
- **Tile radius:** Use `--tile-radius: 28px` for UI tiles/cards.

**Enforcement:** Rules 1, 2, and 3 apply immediately to all new and existing UI.

---

## 4. ChatGPT-Standard Layout (Default When No Design Is Provided)

**When to use:** If there is no specific UI design for a feature, do not invent a new layout. Use the ChatGPT (OpenAI) layout, behavior, and responsiveness, adapted for Arabic (RTL) and the Khalele brand.

**Layout:** Sidebar navigation, centered message thread, bottom-aligned input bar. Use ChatGPT's breakpoints for mobile, tablet, and desktop. RTL mirroring: sidebar on the right; chat flow right-to-left.

**Implementation summary:** If it looks like ChatGPT, uses the Gold/Earth palette, 28px rounded corners, and the 4 Arabic fonts in RTL, it is correct.

---

## 5. Icons, Symbols, and Visual Hierarchy

**No emojis:** Do not use system emojis anywhere in the UI.

**Icon library:** Use only **Google Material Icons / Material Symbols** for UI actions, navigation, and section markers. Use icons as "signboards" next to section titles in the sidebar and menus.

**RTL placement:** In menu items and section headers, the icon is the anchor on the **right**, with text on the **left**.

**Engineering:** Mirror directional icons (arrows, progress) for Arabic readers. Render icons as flat vectors using only brand HEX codes—no default colored variants.

---

## 6. [Pending]

---

## 7. [Pending]

---

*Rules 6 and 7 to be added by the admin/designer.*
