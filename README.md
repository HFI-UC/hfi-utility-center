# HFI Utility Center

Graphic motion frontend built with Next.js, with room booking and reservation search.

## Local development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Start the sibling `hfi-utility-center-backend` project separately following its README (database and SMTP configuration are required).

The frontend uses `http://127.0.0.1:8000` by default. To change it, add `UTILITY_API_URL=http://your-backend:8000` to `.env.local` and restart Next.js. This URL stays on the server. The frontend proxies only the public directory, reservation search, and reservation creation endpoints, and obtains a fresh backend CSRF token for each submission. No admin sessions are forwarded.

Booking times use the browser's local time zone and are submitted as Unix seconds. The backend remains responsible for room policies, conflicts, and approvals. An unavailable backend produces a retryable error, never a simulated success.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
```

The original Google font setup needs internet access during builds. Motion can be paused in the footer and respects the system's reduced-motion setting. The theme button and existing `D` shortcut switch light/dark themes.

## Components

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
