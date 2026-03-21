/**
 * Shared Utility Functions for bl1nk-workspace
 */

import type { ACPError, ACPResponse } from "./types"

// ─── ID Generation ────────────────────────────────────
export function generateId(prefix?: string): string {
  const id =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return prefix ? `${prefix}_${id}` : id
}

export function generateSessionId(): string {
  return generateId("sess")
}

export function generateTaskId(): string {
  return generateId("task")
}

export function generateAgentId(): string {
  return generateId("agent")
}

// ─── Error Handling ───────────────────────────────────
export function createACPError(code: number, message: string, data?: unknown): ACPError {
  return {
    code,
    message,
    data,
  }
}

export function createACPResponse<T>(
  id: string | number,
  result?: T,
  error?: ACPError
): ACPResponse<T> {
  return {
    jsonrpc: "2.0",
    id,
    ...(result !== undefined && { result }),
    ...(error && { error }),
  }
}

export function isACPError(obj: unknown): obj is ACPError {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "code" in obj &&
    "message" in obj &&
    typeof (obj as ACPError).code === "number" &&
    typeof (obj as ACPError).message === "string"
  )
}

// ─── Validation ───────────────────────────────────────
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidFilePath(path: string): boolean {
  const pathRegex = /^[a-zA-Z0-9._/-]+$/
  return pathRegex.test(path) && !path.includes("//")
}

export function isValidSkillName(name: string): boolean {
  const nameRegex = /^[a-z0-9-]+$/
  return nameRegex.test(name) && name.length > 0 && name.length <= 50
}

// ─── String Utilities ─────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text
  return text.substring(0, length - suffix.length) + suffix
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ─── Date & Time ──────────────────────────────────────
export function formatDate(date: Date, format = "YYYY-MM-DD"): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds)
}

export function getTimeDifference(
  from: Date,
  to: Date = new Date()
): {
  ms: number
  seconds: number
  minutes: number
  hours: number
  days: number
} {
  const ms = to.getTime() - from.getTime()
  return {
    ms,
    seconds: Math.floor(ms / 1000),
    minutes: Math.floor(ms / (1000 * 60)),
    hours: Math.floor(ms / (1000 * 60 * 60)),
    days: Math.floor(ms / (1000 * 60 * 60 * 24)),
  }
}

export function isExpired(date: Date, expiryMs: number): boolean {
  return Date.now() - date.getTime() > expiryMs
}

// ─── Object & Array Utilities ─────────────────────────
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

export function mergeObjects<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
        result[key] = mergeObjects(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>]
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>
  for (const key of keys) {
    delete result[key as unknown as keyof Omit<T, K>]
  }
  return result
}

// ─── Async Utilities ──────────────────────────────────
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await delay(delayMs * 2 ** i) // Exponential backoff
    }
  }
  throw new Error("Retry failed")
}

export function timeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
  ])
}

// ─── Encoding & Hashing ───────────────────────────────
export function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64")
}

export function decodeBase64(str: string): string {
  return Buffer.from(str, "base64").toString("utf-8")
}

export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ─── File Utilities ───────────────────────────────────
export function getFileExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

export function getFileName(path: string): string {
  return path.split("/").pop() || ""
}

export function getFileDirectory(path: string): string {
  const parts = path.split("/")
  return parts.slice(0, -1).join("/")
}

export function joinPath(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/").replace(/\/$/, "")
}

export function isCodeFile(filename: string): boolean {
  const codeExtensions = ["js", "ts", "tsx", "jsx", "py", "java", "cpp", "go", "rs", "sh", "bash"]
  const ext = getFileExtension(filename).toLowerCase()
  return codeExtensions.includes(ext)
}

// ─── JSON Utilities ───────────────────────────────────
export function safeJsonParse<T = unknown>(json: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

export function safeJsonStringify(obj: unknown, space?: number): string | null {
  try {
    return JSON.stringify(obj, null, space)
  } catch {
    return null
  }
}

// ─── Type Guards ──────────────────────────────────────
export function isString(value: unknown): value is string {
  return typeof value === "string"
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

// ─── Environment Utilities ────────────────────────────
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = getEnv(key, defaultValue?.toString())
  const num = parseInt(value, 10)
  if (Number.isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`)
  }
  return num
}

export function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key]?.toLowerCase()
  if (value === undefined) return defaultValue
  return value === "true" || value === "1" || value === "yes"
}

// ─── Export index ─────────────────────────────────────
export const Utils = {
  generateId,
  generateSessionId,
  generateTaskId,
  generateAgentId,
  createACPError,
  createACPResponse,
  isACPError,
  isValidEmail,
  isValidUrl,
  isValidFilePath,
  isValidSkillName,
  slugify,
  truncate,
  capitalize,
  formatDate,
  getTimeDifference,
  isExpired,
  deepClone,
  mergeObjects,
  pick,
  omit,
  delay,
  retry,
  timeout,
  encodeBase64,
  decodeBase64,
  hashString,
  getFileExtension,
  getFileName,
  getFileDirectory,
  joinPath,
  isCodeFile,
  safeJsonParse,
  safeJsonStringify,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  getEnv,
  getEnvNumber,
  getEnvBoolean,
}
