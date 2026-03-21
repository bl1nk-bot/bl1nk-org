# Tasks for bl1nk-org
dev-web:
  cd apps/web && bun run dev

dev-desktop:
  cd apps/desktop && bun run tauri dev

build-all:
  bun run build
