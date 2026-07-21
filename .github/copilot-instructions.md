# Copilot Instructions for HFI Utility Center

## Project Overview
Vue 3 + TypeScript full-stack application for facility and reservation management. Uses PrimeVue components with Tailwind CSS styling, deployed on Vercel. Backend authentication via CSRF tokens.

## Architecture

### Tech Stack
- **Frontend**: Vue 3 (Composition API + `<script setup>` SFCs), TypeScript, Vite
- **UI Framework**: PrimeVue 4 + PrimeUIX themes (Sky preset)
- **Styling**: Tailwind CSS 4 + `tailwindcss-primeui` integration
- **Build**: Vite with component auto-import via `unplugin-vue-components`
- **i18n**: vue-i18n with en-US, zh-CN, zh-MS locales (in `src/assets/i18n/`)
- **State**: Event bus pattern with `eventBus.ts` (login & loading states)
- **HTTP**: Axios with CSRF protection, global baseURL from `BACKEND_URL` env var
- **Analytics**: Vercel Web Analytics + Speed Insights

### Key Directories
- `src/views/` - Page components (lazy-loaded in router)
  - `reservation/` - Create, search, analytics views
  - `admin/` - User, facility, reservation management
  - `ads/` - Ad creation system
  - `user/` - Login/register
- `src/components/` - Shared components (Navbar, LoadingMask, FileUploader, UserLogin)
- `src/api/` - HTTP client setup + TypeScript interfaces (560 lines of API definitions)
- `src/router/` - Vue Router config with meta flags (hideNavbar on raw analytics views)

## Developer Workflows

### Build & Dev
```bash
npm run dev           # Start Vite dev server (HMR enabled)
npm run build         # TypeScript check + Vite production build
npm run preview       # Preview production build locally
```

### Deployment
- **Platform**: Vercel (see `vercel.json`)
- **Environment**: Set `BACKEND_URL` (axios baseURL) and `CLOUDFLARE_KEY` as secrets

### Code Generation
- PrimeVue components auto-imported via resolver
- Path alias: `@` → `src/`

## Key Patterns & Conventions

### Vue Components
- **SFC Format**: Use `<script setup lang="ts">` exclusively
- **Type Imports**: Import types with `type` keyword
- **Forms**: Use `@primevue/forms` with Zod validators via `zodResolver` (see ReservationCreateView)
  - Validation messages sourced from i18n: `t("key.path")`
- **Icons**: Lucide Vue Next (e.g., `Check`, `Home`, `LogOut`) + custom Rive animations (`.riv` files in assets)
- **Modals/Overlays**: Built with PrimeVue (Dialog, Sidebar, Tooltip)
- **Tables**: PrimeVue DataTable with pagination, filtering

### Global State & Events
- **Login State**: Reactive ref in `eventBus.ts` → trigger `useLoginEvent()` on logout, components watch to refresh data
- **Loading State**: Global `isPageLoading` ref managed via `eventBus.ts` → LoadingMask component displays overlay
- **Event Pattern**: Components call `triggerLoginUpdate()` → navbar watches & calls `refreshLoginData()`

### API Layer (`src/api/index.ts`)
- **HTTP Defaults**: Credentials enabled, CSRF token auto-fetch on POST/PUT/DELETE/PATCH, `validateStatus: () => true`
- **Type Definitions**: Export interfaces like `ReservationRequestInfo`, `Reservation`, `RoomPolicy`, `Class`, `Campus`
- **COS SDK**: Integrated for cloud storage via `cos-js-sdk-v5` (credentials handling)

### Styling
- **Theme**: Sky preset from PrimeUIX (blue/cyan colors), light/dark modes controlled by `.p-dark` class on body
- **Tailwind**: Custom palette uses PrimeVue design tokens
- **Component Classes**: PrimeVue exports scoped CSS classes (e.g., `p-button`, `p-input`) + Tailwind utilities

### Internationalization
- **Setup**: Three locales in `src/assets/i18n/` (JSON files)
- **Usage**: `const { t, tm, locale } = useI18n()` in components
- **Nav/Navbar**: Locale switching via `locale.value = "zh-CN"` or similar

### Error Handling
- **Toast Notifications**: `useToast()` from PrimeVue → `toast.add({ severity: 'error', ... })`
- **HTTP Status**: Axios `validateStatus: () => true` means check response status manually in handlers

## Build Optimization

### Code Splitting
Vite config manually chunks by feature (see `vite.config.ts`):
- Login bundle: `login-view`
- Admin bundle: `admin-view`
- Reservation features: `reservation-view`, `reservation-create-view`, `reservation-search-view`, `reservation-analytics-view`
- Heavy libraries isolated: `lucide`, `primevue`, `chartjs`, `rive`

## Testing & Asset Types
- **Asset Inclusion**: Rive animation files (`.riv`) + WebAssembly (`.wasm`) explicitly included
- **Type Checking**: `vue-tsc` before build
- No test suite currently (Jest/Vitest setup available if needed)

## Common Pitfalls to Avoid
1. **Form Validation**: Always use `zodResolver` + i18n for messages; don't hardcode error strings
2. **Component Props**: Import types with `type` keyword to prevent runtime bloat
3. **API Calls**: Remember `CSRF` token is auto-fetched; check response status manually
4. **Rive Assets**: Require inline import: `import url from "@/assets/file.riv?inline"`
5. **Navbar Hidden**: Set `meta: { hideNavbar: true }` in router for analytics raw views
