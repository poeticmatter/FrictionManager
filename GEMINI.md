# FrictionManager

## Project Overview
A web application built with React, TypeScript, and Vite, utilizing Tailwind CSS for styling, Zustand for state management, and Supabase as the backend/database.

## Tech Stack
- **Frontend Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v3)
- **State Management:** Zustand
- **Database / Auth:** Supabase (`@supabase/supabase-js`)
- **Routing:** React Router DOM (v7)

## Core Commands
- **Development:** `npm run dev` (Starts Vite dev server)
- **Build:** `npm run build` (Typechecks and builds production bundle)
- **Linting:** `npm run lint` (Runs ESLint)
- **Preview:** `npm run preview` (Previews the production build locally)

## Coding Guidelines & Conventions
- **Component Design:** Use functional components with TypeScript typings for props and hooks.
- **Styling:** Rely on Tailwind utility classes. Prioritize modern, premium aesthetics (rich color palettes, glassmorphism, responsive layout). Avoid plain default colors.
- **State Management:** Keep local component state local; use Zustand stores for global or shared application state.
- **No Placeholders:** Always generate actual media assets or utilize dynamic code structures instead of placeholders.

## Maintenance Rules for AI Agents
- **Update on Structural Changes:** Whenever you add new core dependencies, alter the directory structure, introduce new routes, or modify the database schema, update this `GEMINI.md` file immediately to reflect those architectural shifts.
- **Accuracy:** Keep command definitions and tech stack versions accurate and synchronized with `package.json` changes.
