# Video Speed Reader

Build a Saas landiing page + authenticated app shell for Video speed Reader, a product that turns any video into an accurate transcript in three minutes, targeted at content creators, educators, engineers who record long-form video and need a fast, clean transcript to repurpose into blog posts, course notes, or searchable archives.

The site must include:

1. A public landing page (`/`) with:

   - Hero section: product name "Video Speed Reader" prominently displayed, value prop "上傳影片，三分鐘內拿到逐字稿。" (English subtitle: "Upload your video, get a clean transcript in three minutes."), and a primary CTA button labeled "Sign in / 登入" in the top-right header

   - Features section with exactly 3 feature cards:

     * Card 1: "高準確度逐字稿 (High-accuracy transcripts)" — powered by OpenAI Whisper, supports Chinese and English

     * Card 2: "三分鐘交付 (Three-minute turnaround)" — processed in the background, you get an email when it's ready

     * Card 3: "可商用授權 (Commercial-use ready)" — you own the output, use it however you like

   - Footer with copyright "© 2026 Video Speed Reader"

2. Authentication using Supabase auth (email + password), backed by the project's own Supabase instance:

   - Sign Up page with email + password

   - Sign In page with email + password

   - Sign Out functionality

   - Email confirmation can be disabled for simplicity in this v1

3. An authenticated app shell at `/app` that the user lands on after signing in:

   - Greets the signed-in user by email: "Hi {user.email}"

   - A placeholder message: "Your dashboard is coming soon. Upload functionality will be added in the next milestone."

   - A Sign Out button in the header

Design requirements:

- Modern, professional dark theme (Navy blue/brown accent on a beige background)

- Use Inter or a bold slab style font

- Mobile responsive

- Tasteful subtle animations (fade-in on scroll is fine; don't overdo it)

Out of scope for this v1: video upload widget, transcript display, payment, custom database tables (do NOT create a `profiles` or `videos` table — only use Supabase's default `auth.users`). Those come in later milestones. Stick to landing page + auth + placeholder dashboard.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Architecture & deployment

This is a plain **Vite + React single-page app** with client-side routing via
[React Router](https://reactrouter.com). There is no server-side rendering.

- Routes: `/` (landing), `/signin`, `/signup` (`/sign-in` and `/sign-up` redirect to them), `/app` (requires sign-in).
- `npm run build` (or `bun run build`) emits a static site to `dist/`.
- `vercel.json` rewrites every path to `index.html`, so deep links like `/app` load the SPA and resolve client-side.
- Supabase config comes from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (the browser-safe
  `sb_publishable_*` key, formerly called the anon key), read via `import.meta.env` and inlined at build time.
  Set both in `.env` locally and in Vercel → Project Settings → Environment Variables for every environment.
