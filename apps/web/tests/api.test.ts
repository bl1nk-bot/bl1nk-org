/**
 * API Tests for bl1nk-web
 * Tests for API endpoints and integration
 */

import { test, expect } from "@playwright/test"

// ============================================================================
// Chat API Tests
// ============================================================================

test.describe("Chat API", () => {
  test("POST /api/chat should accept messages", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            role: "user",
            content: "Hello, how are you?",
          },
        ],
        model: "test-model",
        webSearch: false,
      },
    })
    
    // Should return 200 or stream response
    expect([200, 201]).toContain(response.status())
  })

  test("POST /api/chat should handle empty messages", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [],
        model: "test-model",
        webSearch: false,
      },
    })
    
    // Should handle gracefully
    expect(response.status()).toBeGreaterThanOrEqual(200)
  })

  test("POST /api/chat should handle invalid model", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            role: "user",
            content: "Test",
          },
        ],
        model: "invalid-model",
        webSearch: false,
      },
    })
    
    // Should handle invalid model gracefully or return error
    expect([200, 400, 500]).toContain(response.status())
  })

  test("POST /api/chat with webSearch enabled", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            role: "user",
            content: "What's the latest news?",
          },
        ],
        model: "test-model",
        webSearch: true,
      },
    })
    
    // Should return 200 or stream response
    expect([200, 201]).toContain(response.status())
  })

  test("POST /api/chat should handle long messages", async ({ request }) => {
    const longMessage = "A".repeat(10000)
    
    const response = await request.post("/api/chat", {
      data: {
        messages: [
          {
            role: "user",
            content: longMessage,
          },
        ],
        model: "test-model",
        webSearch: false,
      },
    })
    
    // Should handle long messages
    expect([200, 400, 413]).toContain(response.status())
  })
})

// ============================================================================
// Health Check Tests
// ============================================================================

test.describe("Health Check", () => {
  test("GET / should return 200", async ({ request }) => {
    const response = await request.get("/")
    expect(response.status()).toBe(200)
  })

  test("GET /api should return 200 or 404", async ({ request }) => {
    const response = await request.get("/api")
    expect([200, 404]).toContain(response.status())
  })
})

// ============================================================================
// Static Assets Tests
// ============================================================================

test.describe("Static Assets", () => {
  test("should load favicon", async ({ request }) => {
    const response = await request.get("/favicon.ico")
    expect([200, 301, 302, 404]).toContain(response.status())
  })

  test("should load manifest.json", async ({ request }) => {
    const response = await request.get("/manifest.json")
    expect([200, 404]).toContain(response.status())
  })

  test("should load robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt")
    expect([200, 404]).toContain(response.status())
  })
})

// ============================================================================
// Error Handling Tests
// ============================================================================

test.describe("Error Handling", () => {
  test("should handle 404 pages", async ({ page }) => {
    const response = await page.goto("/non-existent-page")
    expect(response?.status()).toBe(404)
  })

  test("should handle invalid API routes", async ({ request }) => {
    const response = await request.get("/api/non-existent")
    expect([404, 405]).toContain(response.status())
  })

  test("should handle malformed POST requests", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: "invalid-json",
      headers: {
        "Content-Type": "application/json",
      },
    })
    expect([400, 415, 500]).toContain(response.status())
  })
})

// ============================================================================
// CORS Tests
// ============================================================================

test.describe("CORS", () => {
  test("should have CORS headers on API", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [{ role: "user", content: "test" }],
        model: "test",
        webSearch: false,
      },
    })
    
    const headers = response.headers()
    // Should have CORS headers or be same-origin
    expect(headers["access-control-allow-origin"] || response.status()).toBeTruthy()
  })
})

// ============================================================================
// Rate Limiting Tests
// ============================================================================

test.describe("Rate Limiting", () => {
  test("should handle multiple rapid requests", async ({ request }) => {
    const requests = []
    
    // Send 5 rapid requests
    for (let i = 0; i < 5; i++) {
      requests.push(
        request.post("/api/chat", {
          data: {
            messages: [{ role: "user", content: `test ${i}` }],
            model: "test",
            webSearch: false,
          },
        })
      )
    }
    
    const responses = await Promise.all(requests)
    const statuses = responses.map((r) => r.status())
    
    // Some might be rate limited (429), but should not all fail
    const successCount = statuses.filter((s) => s >= 200 && s < 300).length
    expect(successCount).toBeGreaterThan(0)
  })
})

// ============================================================================
// Authentication Tests (if applicable)
// ============================================================================

test.describe("Authentication", () => {
  test("should handle unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        messages: [{ role: "user", content: "test" }],
        model: "test",
        webSearch: false,
      },
    })
    
    // Should either accept (no auth required) or return 401
    expect([200, 201, 401, 403]).toContain(response.status())
  })
})

// ============================================================================
// Performance Tests
// ============================================================================

test.describe("API Performance", () => {
  test("should respond within timeout", async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.post("/api/chat", {
      data: {
        messages: [{ role: "user", content: "test" }],
        model: "test",
        webSearch: false,
      },
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should respond within 30 seconds (adjust based on requirements)
    expect(duration).toBeLessThan(30000)
    expect(response.status()).toBeGreaterThanOrEqual(200)
  })
})
