# bl1nk-web Tests

ชุดเทสสำหรับ bl1nk-org web application ใช้ Playwright test framework

## 📦 สิ่งที่ต้องติดตั้ง

### ติดตั้ง Dependencies

```bash
cd /home/bill/dev/work/bl1nk-org/apps/web
bun install
```

### ติดตั้ง Playwright Browsers

```bash
bunx playwright install
```

หรือติดตั้งเฉพาะ Chromium:

```bash
bunx playwright install chromium
```

## 🧪 รันเทส

### รันเทสทั้งหมด

```bash
bun run test
```

### รันเทสแบบเห็นเบราว์เซอร์

```bash
bun run test:headed
```

### รันเทสแบบ debug

```bash
bun run test:debug
```

### รันเทสเฉพาะไฟล์

```bash
bun run test tests/ui-components.test.ts
bun run test tests/ai-elements.test.ts
bun run test tests/page-navigation.test.ts
bun run test tests/api.test.ts
```

### รันเทสเฉพาะคำอธิบาย

```bash
bun run test --grep "Button"
bun run test --grep "Chat"
```

## 📊 ดูรายงานผลเทส

```bash
bun run test:report
```

จะเปิด HTML report ในเบราว์เซอร์

## 📁 โครงสร้างไฟล์เทส

```
tests/
├── ui-components.test.ts    # เทส UI Components (shadcn/ui)
├── ai-elements.test.ts      # เทส AI Elements Components
├── page-navigation.test.ts  # เทส Navigation และ Layout
└── api.test.ts              # เทส API endpoints
```

## 🎯 สิ่งที่เทส

### UI Components (ui-components.test.ts)

- ✅ Button (variants, sizes, icons)
- ✅ Card (header, content, shadow)
- ✅ Dialog (open/close, overlay)
- ✅ Input (focus states, validation)
- ✅ Skeleton (loading animation)
- ✅ Toast/Sonner (notifications)
- ✅ Tabs (switching, active states)
- ✅ Avatar (images, fallbacks)
- ✅ Breadcrumb (navigation, separators)
- ✅ ScrollArea (scrollbars)
- ✅ Separator (horizontal/vertical)

### AI Elements Components (ai-elements.test.ts)

- ✅ Agent (header, model badge, tools)
- ✅ CodeBlock (syntax highlighting, copy button, line numbers)
- ✅ FileTree (folders, files, expand/collapse)
- ✅ Conversation/Messages (user/assistant messages)
- ✅ Plan (tasks, collapsible)
- ✅ Queue (items, indicators, counts)
- ✅ Task (status, expandable)
- ✅ Terminal (streaming output, ANSI colors)
- ✅ Checkpoint (restore button)
- ✅ PromptInput (textarea, submit, loading states)

### Page & Navigation (page-navigation.test.ts)

- ✅ Main page loading
- ✅ Three-column layout
- ✅ Responsive design (mobile/desktop)
- ✅ Navigation links
- ✅ Settings dialog
- ✅ Workflow canvas (nodes, edges, draggable)
- ✅ Chat interface (send messages, loading)
- ✅ Context preview
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Performance (load time, memory leaks)

### API Tests (api.test.ts)

- ✅ POST /api/chat (messages, models, webSearch)
- ✅ Health checks
- ✅ Static assets (favicon, manifest, robots.txt)
- ✅ Error handling (404, invalid routes)
- ✅ CORS headers
- ✅ Rate limiting
- ✅ Authentication
- ✅ API performance

## ⚙️ Configuration

Playwright config (`playwright.config.ts`):

```typescript
{
  testDir: "./tests",
  baseURL: "http://localhost:3000",
  timeout: 60000,
  retries: 0, // 2 on CI
  reporter: ["html", "json", "list"],
  projects: [
    "chromium",
    "firefox",
    "webkit",
    "Mobile Chrome",
    "Mobile Safari",
    "Microsoft Edge",
    "Google Chrome"
  ]
}
```

## 🔧 เคล็ดลับ

### เทสระหว่างพัฒนา

เปิด dev server ในหน้าต่างหนึ่ง:

```bash
bun run dev
```

แล้วรันเทสในอีกหน้าต่าง:

```bash
bun run test --ui
```

### Debug เทสที่ล้มเหลว

```bash
bun run test --debug tests/ui-components.test.ts
```

### ถ่าย screenshot เมื่อเทสล้มเหลว

Screenshot จะถูกบันทึกอัตโนมัติใน `test-results/`

### ดู trace

ถ้าเทสล้มเหลว ให้เปิด trace viewer:

```bash
bunx playwright show-trace test-results/<test-name>/trace.zip
```

## 📈 Continuous Integration

เทสจะรันอัตโนมัติบน CI เมื่อมี PR ใหม่

## 🐛 แก้ปัญหา

### เทสล้มเหลวเพราะ timeout

เพิ่ม timeout ใน config หรือในเทส:

```typescript
test.use({ timeout: 120000 })
```

### เทสไม่เจอ element

รอให้ element ปรากฏ:

```typescript
await expect(page.locator("button")).toBeVisible({ timeout: 10000 })
```

### Browser ไม่ติดตั้ง

```bash
bunx playwright install
```

## 📚 เอกสารเพิ่มเติม

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test](https://playwright.dev/docs/test-intro)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
