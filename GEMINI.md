# The FIRE Blueprint

## App Overview
**The FIRE Blueprint** is a high-converting, lead-generation funnel designed to introduce users to the FIRE (Financial Independence, Retire Early) movement. It matches users with a specific FIRE strategy (Lean, Traditional, Fat, Coast, or Barista) based on an interactive quiz, dynamically calculates their personalized "FIRE Number" and timeline, and visually demonstrates the devastating long-term impact of standard financial advisor fees (1.5%) compared to low-cost index funds (0.05%).

The ultimate goal of the funnel is to provide a free, ad-supported AI-generated personalized strategy guide.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Charting:** Recharts
- **Database/Backend (Prepared for):** Supabase
- **Deployment Target:** Netlify

## Design & Aesthetics
- **Vibe:** "Zero pretentious branding", highly professional but rebellious, and strictly rejecting the luxury brand aesthetic. 
- **Color Palette:** Off-white/warm gray backgrounds (`#f5f4f0`), near-black charcoal text (`#1a1a1a`), and sage green accents (`#16a34a` for primary actions, success states, and index fund charts). Red (`#ef4444`) is used strictly for negative financial impacts (e.g., advisor fees).
- **UX:** Highly dynamic and interactive. Micro-animations are heavily used on buttons, quiz tiles, and page transitions to make the app feel alive and premium.

## Features Implemented So Far
1. **Interactive Quiz (`/quiz`)**
   - 10 carefully crafted questions using non-formal, everyday language.
   - Support for both multiple-choice tiles and "exact number" custom inputs (for income, spending, age, savings, retirement timeline, and number of children).
   - Custom values override bracket midpoints for highly accurate downstream calculations.
   
2. **Strategy Matching Engine (`src/lib/quiz-scoring.ts`)**
   - Maps user answers to one of 5 FIRE strategies using a weighted scoring system.
   
3. **Results Page (`/results`)**
   - Displays the top 3 best-fit strategies with match percentages.
   - Expandable "deep-dive" sections explaining the math, the lifestyle, and pros/cons.
   - Includes a toggle to "View all other strategies" if the user wants to see their 4th and 5th ranked options.
   
4. **Interactive Calculator & Fee Reveal (`/calculate`)**
   - **Live Sliders:** Users can adjust monthly savings, current savings, expected market returns, and child costs. The "Years to FIRE" dynamically updates in real-time.
   - **Child Costs:** Integrates regional average child costs, allowing users to factor in the expense of current or planned children.
   - **The Math Reveal:** A `recharts` area chart visually comparing the 30-year compounding difference between a 0.05% index fund and a 1.5% financial advisor fee.
   - **Refined Terminology:** Removed confusing "AUM" or "Financial Industry" jargon in favor of plain English ("financial advisor fees").

5. **Infrastructure Fixes**
   - Added `suppressHydrationWarning` to the `<body>` tag in `layout.tsx` to prevent Next.js hydration errors caused by browser extensions.

## Instructions for Future AI Models
If you are picking up this project, adhere to the following rules:

1. **Maintain the Aesthetic:** Do not introduce generic blues or plain primary colors. Stick to the off-white, charcoal, and sage green palette. Keep borders rounded (`rounded-xl` or `rounded-2xl`) and maintain the premium, modern feel.
2. **Component Modularity:** The FIRE math is centralized in `src/lib/fire-engine.ts`. If adding new variables (e.g., taxes, inflation adjustments), update the core engine rather than writing one-off math in the React components.
3. **Avoid Next.js Hydration Errors:** When rendering user inputs or `localStorage` data, rely on the `hydrated` state flag (already implemented in `useQuizState`) to ensure the server and client render match initially.
4. **Next Steps (Roadmap):**
   - **AI Guide Generation:** Connect to an LLM endpoint to generate the personalized free PDF/dashboard guide based on the user's exact inputs and selected strategy.
   - **Supabase Integration:** Save quiz leads (emails + numeric inputs) into the Supabase database before redirecting to the checkout page. 
5. **Tone of Voice:** Keep the copy punchy, slightly rebellious against traditional finance, but deeply empathetic to the user's burnout or desire for freedom. Avoid dense financial jargon.
