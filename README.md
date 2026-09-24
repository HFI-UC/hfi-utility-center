# HFI Utility Center

HFI Utility Center is a bilingual campus facility reservation and administration
application. It uses Next.js App Router, React, TypeScript, Astryx Design
System, Tailwind CSS, next-intl, React Hook Form, and Zod.

## Development

```bash
npm install
npm run dev
```

The development server uses `http://localhost:3000` by default.

Environment variables:

- `NEXT_PUBLIC_API_BASE_URL` selects the Rust backend used by the browser and
  defaults to `https://api.hfiuc.org`.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` enables the real Cloudflare Turnstile
  widget. Password login on localhost requires that site key to allow the
  `localhost` hostname; there is no development verification bypass.

Copy `.env.example` to `.env.local` and replace the example values when a real
backend or Turnstile widget is required.

## Architecture

- `app/` contains routes and feature-specific UI. Route pages coordinate data;
  large interactive views are split into named feature components.
- `app/styles/` contains ordered global style layers grouped by feature. Small,
  route-specific styles continue to use colocated CSS modules.
- `lib/api/` contains the backend transport, endpoint functions, API types, and
  focused administrator resource/mutation hooks.
- `lib/reservations/` contains pure reservation availability rules.
- `components/astryx.tsx` contains the Astryx-based design primitives used by
  public and administrator views.
- `messages/` contains the English and Simplified Chinese translation catalogs.

The browser calls the configured Rust backend directly. The API client targets
the Rust response and payload contracts, including the occupied-interval
availability response.

## Quality Checks

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
```

Use `npm run format` to format TypeScript and JavaScript configuration files.
