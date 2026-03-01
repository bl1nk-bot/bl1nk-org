#!/usr/bin/env bash
# scaffold.sh – สร้างโครงสร้าง Monorepo สำหรับ bl1nk-org (AI Workspace)
# รันด้วย bash: chmod +x scaffold.sh && ./scaffold.sh

set -e  # หยุดถ้ามีคำสั่งผิดพลาด

PROJECT_NAME="bl1nk-org"
DOMAIN="bl1nk.site"
EMAIL_ORG="org@bl1nk.site"
EMAIL_TEAM="team@bl1nk.site"

echo "🚀 เริ่มต้นสร้างโปรเจกต์ $PROJECT_NAME ..."

# ----------------------------------------
# ฟังก์ชันช่วยสร้าง package.json แบบง่าย
# ----------------------------------------
create_package_json() {
  local dir="$1"
  local name="$2"
  local deps="$3"
  local dev_deps="$4"
  mkdir -p "$dir"
  cat > "$dir/package.json" <<EOF
{
  "name": "$name",
  "version": "0.1.0",
  "private": true,
  "author": "$PROJECT_NAME <$EMAIL_ORG>",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "dev": "echo 'dev script not implemented'",
    "build": "echo 'build script not implemented'"
  },
  "dependencies": {
    $deps
  },
  "devDependencies": {
    $dev_deps
  }
}
EOF
}

# ----------------------------------------
# รากฐาน (Root)
# ----------------------------------------
echo "📁 สร้างโฟลเดอร์รากและไฟล์พื้นฐาน..."
mkdir -p .github/workflows .github/ISSUE_TEMPLATE .vscode docs

# .env.example
cat > .env.example <<EOF
# Neon Database
DATABASE_URL=postgresql://user:pass@host/db

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# Modal API
MODAL_TOKEN_ID=
MODABL_TOKEN_SECRET=

# Vercel (optional)
VERCEL_TOKEN=
EOF

# .gitignore
cat > .gitignore <<EOF
node_modules
dist
.env
.env.local
.DS_Store
*.log
.turbo
.vscode/*
!.vscode/extensions.json
EOF

# .npmrc
echo "engine-strict=true" > .npmrc

# .bunrc (ถ้าใช้ bun)
cat > .bunrc <<EOF
[install]
registry = "https://registry.npmjs.org"
EOF

# turbo.json
cat > turbo.json <<EOF
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
EOF

# justfile (ตัวอย่าง)
cat > justfile <<EOF
# Tasks for $PROJECT_NAME
dev-web:
  cd app/web && bun run dev

dev-desktop:
  cd app/desktop && bun run tauri dev

build-all:
  bun run build
EOF

# tsconfig.base.json
cat > tsconfig.base.json <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
EOF

# README.md
cat > README.md <<EOF
# $PROJECT_NAME – The Omnipresent AI Workspace

**Local‑first AI agent workspace with cloud enhancement.**

- Web: [https://$DOMAIN](https://$DOMAIN)
- Contact: [$EMAIL_ORG](mailto:$EMAIL_ORG) / [$EMAIL_TEAM](mailto:$EMAIL_TEAM)

ดูรายละเอียดโครงสร้างได้ที่ \`docs/\`
EOF

# ----------------------------------------
# app/web (Next.js + Vercel Edge)
# ----------------------------------------
echo "📁 สร้าง app/web ..."
mkdir -p app/web/src/app/\(auth\) app/web/src/app/\(dashboard\) app/web/src/app/api/{agent,tools,storage}
mkdir -p app/web/src/components/{ui,features,layouts}
mkdir -p app/web/src/hooks app/web/src/lib app/web/src/store
touch app/web/src/app/layout.tsx
touch app/web/src/lib/{api.ts,utils.ts,constants.ts}
touch app/web/src/store/{auth.ts,agent.ts,ui.ts}
touch app/web/middleware.ts app/web/vercel.json app/web/next.config.ts

# package.json สำหรับ web
create_package_json "app/web" "@bl1nk/web" \
  '"next": "15.0.0", "react": "19.0.0", "react-dom": "19.0.0", "zustand": "5.0.0", "zod": "3.22.0", "tailwind-merge": "2.0.0", "clsx": "2.0.0"' \
  '"@types/react": "19.0.0", "@types/node": "20.0.0", "typescript": "5.3.0", "tailwindcss": "3.4.0", "autoprefixer": "10.4.0", "postcss": "8.4.0", "eslint": "8.57.0"'

# ----------------------------------------
# app/desktop (Tauri + React + Vite)
# ----------------------------------------
echo "📁 สร้าง app/desktop ..."
mkdir -p app/desktop/src/{components,hooks,store}
touch app/desktop/src/{App.tsx,main.tsx}
mkdir -p app/desktop/src-tauri/src/{commands,services,utils}
touch app/desktop/src-tauri/src/main.rs
touch app/desktop/src-tauri/{Cargo.toml,tauri.conf.json}
touch app/desktop/{vite.config.ts,tsconfig.json}

create_package_json "app/desktop" "@bl1nk/desktop" \
  '"@tauri-apps/api": "2.0.0", "react": "19.0.0", "react-dom": "19.0.0", "zustand": "5.0.0"' \
  '"@tauri-apps/cli": "2.0.0", "@types/react": "19.0.0", "@types/react-dom": "19.0.0", "@vitejs/plugin-react": "4.2.0", "typescript": "5.3.0", "vite": "5.0.0"'

# ----------------------------------------
# app/obsidian (Plugin)
# ----------------------------------------
echo "📁 สร้าง app/obsidian ..."
mkdir -p app/obsidian/src/{commands,ui}
touch app/obsidian/src/{main.ts,settings.ts}
touch app/obsidian/{esbuild.config.js,manifest.json,tsconfig.json}

create_package_json "app/obsidian" "@bl1nk/obsidian" \
  '"obsidian": "1.5.0"' \
  '"@types/node": "20.0.0", "esbuild": "0.20.0", "typescript": "5.3.0"'

# manifest.json ตัวอย่าง
cat > app/obsidian/manifest.json <<EOF
{
  "id": "bl1nk-obsidian",
  "name": "bl1nk AI Workspace",
  "version": "0.1.0",
  "minAppVersion": "1.5.0",
  "description": "Connect Obsidian with bl1nk AI agents",
  "author": "$PROJECT_NAME",
  "authorUrl": "https://$DOMAIN",
  "isDesktopOnly": false
}
EOF

# ----------------------------------------
# app/android (React Native / Flutter – placeholder)
# ----------------------------------------
echo "📁 สร้าง app/android (placeholder) ..."
mkdir -p app/android/src app/android/android app/android/ios
touch app/android/package.json

# ----------------------------------------
# app/doc (Documentation site with Astro)
# ----------------------------------------
echo "📁 สร้าง app/doc ..."
mkdir -p app/doc/src app/doc/public
touch app/doc/astro.config.mjs

create_package_json "app/doc" "@bl1nk/docs" \
  '"astro": "4.0.0"' \
  '"@astrojs/react": "3.0.0", "typescript": "5.3.0"'

# ----------------------------------------
# packages/ (Shared core)
# ----------------------------------------
echo "📁 สร้าง packages/ ..."

# packages/docs (เอกสารภายใน)
mkdir -p packages/docs/{changelog,development,self-hosting,usage}

# packages/locales
mkdir -p packages/locales/{en-US,zh-CN,th-TH}

# packages/packages/* (โฟลเดอร์ย่อยตามโครงสร้าง)
PACKAGES=(
  agent-runtime builtin-agents builtin-tool-fs builtin-tool-http
  business business/config business/const business/model-runtime
  config const context-engine conversation-flow
  database database/src/{models,schemas,migrations,repositories}
  desktop-bridge edge-config editor-runtime fetch-sse
  file-loaders memory-user-memory model-bank
  model-runtime model-runtime/src/{core,providers}
  observability-otel prompts python-interpreter
  cloud-storage ssrf-safe-fetch types utils web-crawler
)

for pkg in "${PACKAGES[@]}"; do
  mkdir -p "packages/packages/$pkg"
done

touch packages/packages/database/drizzle.config.ts

# telemetry
mkdir -p packages/telemetry/src
touch packages/telemetry/src/{logger.ts,analytics.ts,types.ts,index.ts}

# package.json สำหรับ telemetry
create_package_json "packages/telemetry" "@bl1nk/telemetry" \
  '"opentelemetry/api": "1.8.0"' \
  '"@types/node": "20.0.0", "typescript": "5.3.0"'

# ตัวอย่าง package.json สำหรับบาง package ที่ควรมี dependencies
create_package_json "packages/packages/agent-runtime" "@bl1nk/agent-runtime" \
  '"zod": "3.22.0"' \
  '"typescript": "5.3.0"'

create_package_json "packages/packages/database" "@bl1nk/database" \
  '"drizzle-orm": "0.30.0", "postgres": "3.4.0"' \
  '"drizzle-kit": "0.21.0", "@types/node": "20.0.0", "typescript": "5.3.0"'

create_package_json "packages/packages/model-runtime" "@bl1nk/model-runtime" \
  '"zod": "3.22.0"' \
  '"typescript": "5.3.0"'

create_package_json "packages/packages/cloud-storage" "@bl1nk/cloud-storage" \
  '"boto3": "^1.34.0" (แต่ใน JS ใช้ aws-sdk หรือ lib Storage)' \
  '"@aws-sdk/client-s3": "3.500.0", "typescript": "5.3.0"'

# ปรับ boto3 เป็น JS lib เพราะ boto3 เป็น Python – ใช้ aws-sdk แทน
sed -i '' 's/"boto3": "[^"]*"/"@aws-sdk\/client-s3": "3.500.0"/g' packages/packages/cloud-storage/package.json

# ----------------------------------------
# ไฟล์ Docker / Environment
# ----------------------------------------
touch .env.local .env.production docker-compose.yml Dockerfile .dockerignore

# docker-compose.yml ตัวอย่าง
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: bl1nk
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
EOF

# Dockerfile ตัวอย่าง (multi-stage)
cat > Dockerfile <<EOF
FROM node:20-alpine AS base
WORKDIR /app

# ติดตั้ง Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# คัดลอกไฟล์โปรเจกต์
COPY package.json bun.lockb ./
COPY packages ./packages
COPY app ./app

# ติดตั้ง dependencies
RUN bun install

# Build
RUN bun run build

CMD ["bun", "run", "start"]
EOF

# ----------------------------------------
# Root package.json (Bun workspace)
# ----------------------------------------
cat > package.json <<EOF
{
  "name": "$PROJECT_NAME",
  "version": "0.1.0",
  "private": true,
  "author": "$PROJECT_NAME <$EMAIL_ORG>",
  "license": "MIT",
  "type": "module",
  "workspaces": [
    "app/*",
    "packages/*",
    "packages/packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "eslint ."
  },
  "devDependencies": {
    "turbo": "2.0.0",
    "prettier": "3.2.0",
    "eslint": "8.57.0"
  },
  "packageManager": "bun@1.1.0"
}
EOF

# ----------------------------------------
# สรุปรายการที่สร้าง
# ----------------------------------------
echo "✅ เสร็จสิ้น! โครงสร้างโปรเจกต์ $PROJECT_NAME ถูกสร้างเรียบร้อยแล้ว"
echo "📦 คุณสามารถรัน 'bun install' ที่ root เพื่อติดตั้ง dependencies ทั้งหมด"
echo "🌐 โดเมนหลัก: $DOMAIN"
echo "📧 อีเมลติดต่อ: $EMAIL_ORG, $EMAIL_TEAM"
