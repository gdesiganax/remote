# Samurai Portfolio

A React + TypeScript portfolio with a **samurai / ninja game-inspired** aesthetic.

## Features

- **Cinematic loading screen** – Katana animation, progress bar, Japanese status messages, and a final slash exit effect
- **Ninja-style navigation transitions** – Quick crimson blade slash + ink flash when jumping between sections
- **Dark theme** – Deep blacks, crimson red, gold accents, parchment text
- **Japanese touches** – Kanji, dual English/JP labels, serif display fonts (Cinzel + Shippori Mincho)
- **Sections** – Hero, About, Skills (progress bars + “weapons”), Projects (missions), Contact form
- **Responsive** – Mobile hamburger menu and fluid layouts

## Getting Started

```bash
cd portfolio-samurai
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Customize

1. **Personal info** – Edit text in `src/components/Hero.tsx`, `About.tsx`, `Contact.tsx`, and project data in `Projects.tsx`.
2. **Skills** – Update the `skills` and `weapons` arrays in `Skills.tsx`.
3. **Colors** – CSS variables live in `src/index.css` (`--crimson`, `--gold`, etc.).
4. **Contact form** – Currently shows a success state only. Hook it to Formspree, EmailJS, or your own API.

## Tech

- Vite + React 19 + TypeScript
- Pure CSS (no extra UI libraries)
- Google Fonts: Cinzel, Noto Sans JP, Shippori Mincho

## Structure

```
src/
  components/
    LoadingScreen.tsx   # Initial load with katana + progress
    Navbar.tsx          # Fixed nav with JP labels + mobile menu
    Hero.tsx
    About.tsx
    Skills.tsx
    Projects.tsx
    Contact.tsx
  App.tsx               # Loading state + slash transition logic
  index.css             # Theme tokens + base styles
```

Built with discipline. 侍
