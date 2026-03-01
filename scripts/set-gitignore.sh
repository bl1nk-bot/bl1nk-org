#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

append_unique() {
  file="$1"
  shift

  touch "$file"

  for line in "$@"; do
    if ! grep -Fxq "$line" "$file" 2>/dev/null; then
      printf "%s\n" "$line" >> "$file"
    fi
  done
}

RULES=(
"# ========================"
"# Global"
"# ========================"
".DS_Store"
"Thumbs.db"
"*.log"
"*.tmp"
"*.swp"
"# ========================"
"# Node / Next.js"
"# ========================"
"node_modules/"
".next/"
"out/"
"dist/"
"build/"
"coverage/"
".vercel/"
".env"
".env.local"
".env.*.local"
"npm-debug.log*"
"pnpm-debug.log*"
"yarn-debug.log*"
"yarn-error.log*"
"# ========================"
"# Rust"
"# ========================"
"target/"
"Cargo.lock"
"# ========================"
"# Tauri"
"# ========================"
"src-tauri/target/"
"src-tauri/gen/"
"src-tauri/binaries/"
"src-tauri/.cargo/"
"src-tauri/Cargo.lock"
"# ========================"
"# IDE"
"# ========================"
".vscode/"
".idea/"
)

mapfile -t DIRS < <(
  find "$ROOT" -type f \( -name "package.json" -o -name "Cargo.toml" \) \
  -exec dirname {} \; | sort -u
)

DIRS+=("$ROOT")

mapfile -t UNIQUE_DIRS < <(printf "%s\n" "${DIRS[@]}" | sort -u)

for dir in "${UNIQUE_DIRS[@]}"; do
  append_unique "$dir/.gitignore" "${RULES[@]}"
done

echo "Done."