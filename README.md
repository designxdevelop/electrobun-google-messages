# Google Messages Wrapper (Electrobun)

A native-feeling Electrobun desktop wrapper for Google Messages Web.

## Getting Started

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Notes

- Main app window logic is in `src/bun/index.ts`.
- App metadata is configured in `electrobun.config.ts`.
- The app uses a persistent partition (`persist:google-messages`) to keep login state.
