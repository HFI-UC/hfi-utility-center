# HFI Utility Center

HFI Utility Center is a bilingual campus facility reservation and administration
application. It uses Next.js App Router, React, TypeScript, shadcn/ui, Tailwind
CSS, next-intl, React Hook Form, and Zod.

## Development

```bash
npm install
npm run dev
```

The development server uses `http://localhost:3000` by default.

Environment variables:

- `BACKEND_URL` selects the backend used by the local same-origin API proxy.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` enables the real Cloudflare Turnstile
  widget. Password login on localhost requires that site key to allow the
  `localhost` hostname; there is no development verification bypass.

Copy `.env.example` to `.env.local` and replace the example values when a real
backend or Turnstile widget is required.

## Architecture

- `app/` contains routes and feature-specific UI. Route pages coordinate data;
  large interactive views are split into named feature components.
- `features/` contains focused stateful workflows shared within a feature, such
  as administrator resource and mutation handling.
- `lib/api/` contains the backend transport, endpoint functions, and API types.
- `lib/reservations/` contains pure reservation availability rules.
- `components/ui/` contains shadcn primitives and should remain domain-agnostic.
- `messages/` contains the English and Simplified Chinese translation catalogs.

The browser calls `/api/backend/*`. The Next.js route handler forwards those
requests to the legacy backend while preserving the existing URL and payload
contracts.

## Quality Checks

```bash
npm run format:check
npm run test
npm run typecheck
npm run lint
npm run build
```

Use `npm run format` to format TypeScript and JavaScript configuration files.
Vitest covers pure reservation, date, search-query, pagination, and API response
behavior.
