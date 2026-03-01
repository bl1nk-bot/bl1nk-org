# Tasks for bl1nk-org
dev-web:
  cd app/web && bun run dev

dev-desktop:
  cd app/desktop && bun run tauri dev

build-all:
  bun run build
