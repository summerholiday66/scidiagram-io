# Cloudflare Pages + Next.js Template

Use this template as the default starting point for a new Next.js site deployed to Cloudflare Pages.

## 1. Pin the runtime early

Create `.node-version`:

```txt
22
```

Add the package manager and engines to `package.json`:

```json
{
  "packageManager": "pnpm@10.32.1",
  "engines": {
    "node": ">=22 <23",
    "npm": ">=10"
  }
}
```

## 2. Prefer pnpm over npm in CI

Commit `pnpm-lock.yaml`.

Do not commit `package-lock.json` if the project is meant to install with pnpm on Cloudflare.

This avoids the `npm clean-install` failure mode seen in CI and keeps the installer path deterministic.

## 3. Force the official npm registry at project level

Create `.npmrc`:

```txt
registry=https://registry.npmjs.org/
```

This prevents machine-specific mirror settings from leaking into CI behavior.

## 4. Add an explicit Pages config

Create `wrangler.toml`:

```toml
name = "your-project-name"
compatibility_date = "2026-05-05"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

If Cloudflare can infer config, that is still less reliable than checking in the intended output path.

## 5. Add build scripts up front

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:pages": "npx @cloudflare/next-on-pages@1",
    "start": "next start"
  }
}
```

If you stay on `@cloudflare/next-on-pages`, pin supporting tools instead of letting CI float them.

Example:

```json
{
  "devDependencies": {
    "@cloudflare/next-on-pages": "1.13.16",
    "vercel": "47.0.4"
  }
}
```

## 6. Mark dynamic routes for Edge runtime

For App Router API routes and other non-static handlers, add:

```ts
export const runtime = "edge";
```

With `next-on-pages`, missing this line can block the final Cloudflare conversion step even when `next build` succeeds.

## 7. Keep route code Edge-safe

Safe defaults:

- `fetch`
- `Request`, `Response`, `Headers`
- `NextRequest`, `NextResponse`
- `process.env`

Avoid Node-only assumptions unless you have verified Cloudflare support:

- `fs`
- direct filesystem reads
- child processes
- Node-specific crypto usage without checking runtime support

## 8. Debug deployments by stage

Treat these as separate failure layers:

1. Dependency installation
2. `next build`
3. `next-on-pages` or Cloudflare conversion

Do not trust the last error message until the earlier stage is stable.

## 9. Known failure patterns

### Node mismatch

Symptom:

```txt
Unsupported engine ... required: { node: '>=22.0.0' }
```

Fix:

- update `.node-version`
- add `engines.node`
- confirm Cloudflare is not pinned to an older version in the dashboard

### npm installer crash

Symptom:

```txt
npm error Exit handler never called!
```

Fix:

- switch the repo to pnpm
- commit `pnpm-lock.yaml`
- remove `package-lock.json`

### Registry contamination

Symptom:

- lockfile entries or local config point to a mirror registry

Fix:

- add project `.npmrc` with `https://registry.npmjs.org/`
- regenerate the lockfile using the intended package manager

### Pages conversion fails after Next build succeeds

Symptom:

```txt
The following routes were not configured to run with the Edge Runtime
```

Fix:

- add `export const runtime = "edge";` to each listed route

## 10. Minimum bootstrap checklist

- `.node-version` exists and is pinned
- `packageManager` is set in `package.json`
- `pnpm-lock.yaml` is committed
- `.npmrc` points to the official registry
- `wrangler.toml` is committed
- dynamic routes export `runtime = "edge"`
- Cloudflare build output matches `.vercel/output/static`

## 11. Recommended next step

For new projects, prefer evaluating OpenNext early instead of building new work on top of the deprecated `@cloudflare/next-on-pages` flow.

References:

- https://developers.cloudflare.com/pages/framework-guides/nextjs/
- https://opennext.js.org/cloudflare
