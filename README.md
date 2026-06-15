# Space Hover — Cubiz Group Recreation

A recreated Space Hover landing experience inspired by `hover-space-united.lovable.app`: dark aerospace interface, terminal-style navigation, live UTC clock, Earth/orbit visual, telemetry ticker, module cards, Cubiz ecosystem panel, manifesto and responsive layout.

## Fastest way to see it

If package installation is blocked, open the static preview directly:

```bash
python3 -m http.server 4173
```

Then visit:

```text
http://localhost:4173/preview.html
```

You can also double-click `preview.html` in a file browser. The static preview has no build step and includes its CSS and clock script inline.

## Next.js app preview

When dependencies are available:

```bash
pnpm install
pnpm dev
```

Then visit:

```text
http://localhost:3000
```

The main Next.js implementation is in `app/page.tsx`, with project styling in `app/globals.css`.

## Implemented pages

- `/` — full Space Hover landing page
- `/research`
- `/services`
- `/software`
- `/tracker`
- `/cosmic`
- `/library`
- `/community`
- `/partners`
- `/signin`

## Notes

- This repository was initially provided as a zip archive; the project scaffold has been committed into the repo.
- If registry access returns 403 for scoped npm packages, use `preview.html` to review the visual design without installing dependencies.
