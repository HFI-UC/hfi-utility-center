<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# HFI Utility Center

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui
(`radix-nova`, lucide icons, `neutral` base) · next-intl · React Hook Form +
Zod · axios · next-themes · Cloudflare static Workers.

## Commands

```bash
pnpm dev          # Next dev server on :3000  (NOT `vp dev`)
pnpm typecheck    # tsc --noEmit
pnpm lint         # vp lint (oxlint)
pnpm format       # vp fmt
pnpm format:check # vp fmt --check
pnpm build        # next build
pnpm doctor       # react-doctor scan
pnpm preview      # static build + wrangler dev
pnpm deploy:dev   # static build + wrangler deploy --env dev
pnpm deploy       # static build + wrangler deploy
pnpm cf-typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc
```

## Conventions

- `pnpm <script>` for app scripts, `vp <cmd>` for Vite+ built-ins. They differ.
- `preview`, `deploy:dev`, and `deploy` build the static export first.
- Workers Builds inject `NEXT_PUBLIC_API_BASE_URL` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time for each branch.
- A `vp staged` pre-commit hook (`.vite-hooks/pre-commit`) checks staged files.
  CI (`.github/workflows/ci.yml`) runs `vp check`, `vp test run
--passWithNoTests`, and `pnpm build` on every push and pull request;
  `react-doctor.yml` posts an advisory React Doctor report on PRs.
- Imports use `@/*` → `./src/*`.
- Pages orchestrate data; interactive views live in a named feature component
  next to the route.
- Client talks to the backend directly via `NEXT_PUBLIC_API_BASE_URL`
  (default `https://api.hfiuc.org`). Env contract lives in `.env.example`.
- All user-facing strings in `src/messages/{en-US,zh-CN}.json`. Both catalogs
  must stay in sync.

## UI rules

- Reuse `src/components/ui/*`. Add via `pnpm dlx shadcn@latest add <name>`
  rather than hand-rolling; do not edit those files to fit one call site.
- Style with Tailwind tokens (`bg-background`, `text-muted-foreground`,
  `border-border`, `bg-primary`…). No raw hex or new color literals.
- `src/app/globals.css` holds theme tokens, base styles, and the `t-*` motion
  blocks only. Do not add feature layout CSS to it, and do not add colocated
  CSS modules.
- Icons from `lucide-react`, sized 16 by default.

## Layout

`src/app` routes · `src/components` shared UI (`ui/` shadcn primitives,
`layout/` shell pieces) · `src/hooks` shared hooks · `src/lib/api` transport,
types, admin hooks · `src/lib/reservations` pure availability rules ·
`src/messages` translations.
