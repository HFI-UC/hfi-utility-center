# HFI Utility Center

## By MAKERs'

HFI Utility Center is a bilingual campus facility reservation and administration
application. It uses Next.js App Router, React, TypeScript, shadcn/ui (Radix primitives), Tailwind CSS, next-intl, React Hook Form, and Zod.

## Development

```bash
pnpm install
pnpm dev
```

The development server uses `http://localhost:3000` by default.
pnpm 12.6+ is expected (`devEngines` in `package.json`; CI resolves the exact
version from it).

Environment variables:

- `NEXT_PUBLIC_API_BASE_URL` selects the backend used by the browser and
  defaults to `https://api.hfiuc.org`.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` enables the real Cloudflare Turnstile
  widget. Password login on localhost requires that site key to allow the
  `localhost` hostname; there is no development verification bypass.

Copy `.env.example` to `.env.local` and replace the example values when a real
backend or Turnstile widget is required.

## Architecture

- `src/app/` contains routes and feature-specific UI. Route pages coordinate
  data; large interactive views are split into named feature components.
- `src/app/globals.css` holds all global CSS: theme tokens, base element
  styles, and the `t-*` motion/transition blocks. Prefer Tailwind utilities at
  the usage site; keep a rule here for state selectors, pseudo-elements, media
  queries, and animation blocks. There are no colocated CSS modules.
- `src/lib/api/` contains the backend transport, endpoint functions, API types,
  and focused administrator resource/mutation hooks.
- `src/lib/locale.tsx` holds the shared locale context, imported by both routes
  and components.
- `src/lib/reservations/` contains pure reservation availability rules.
- `src/components/ui/` contains the shadcn/ui components used by
  public and administrator views.
- `src/components/layout/` contains the shared shell pieces: app header/footer,
  page header, section cards, status badges, and data-state views.
- `src/hooks/` contains shared React hooks (mobile detection, error shake).
- `src/messages/` contains the English and Simplified Chinese translation
  catalogs.

All application source lives under `src/`. Imports use the `@/*` alias, which
maps to `./src/*`.

The browser calls the configured backend directly. The API client targets
the existing response and payload contracts, including the occupied-interval
availability response.

## Quality Checks

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
```

Use `pnpm format` to format TypeScript and JavaScript configuration files.

CI (`.github/workflows/ci.yml`) runs `pnpm exec vp check`, `pnpm exec vp test
run --passWithNoTests`, and `pnpm build` on every push and pull request.
`.github/workflows/react-doctor.yml` posts an advisory React Doctor report on
pull requests.

## Deployment

The app exports static assets into `out/` and deploys them to Cloudflare Workers.
Cloudflare Workers Builds injects `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
`NEXT_PUBLIC_API_BASE_URL` at **build time**. The production Worker builds
`main` against `https://api.hfiuc.org`; the isolated dev Worker builds `dev`
against `https://preview-api.hfiuc.org`. Changing a build variable requires
a new build and deployment; setting a runtime Worker variable will not change
the JavaScript already exported by Next.js.

```bash
pnpm build       # static export to out/
pnpm preview     # build, then wrangler dev
pnpm deploy:dev  # build, then deploy to dev.hfiuc.org
pnpm deploy      # build, then deploy to hfiuc.org
```

`pnpm cf-typegen` regenerates `cloudflare-env.d.ts` from the Wrangler
configuration after the bindings change.
