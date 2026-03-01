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
