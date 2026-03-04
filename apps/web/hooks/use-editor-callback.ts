"use client"

import { useCallback, useEffect, useRef } from "react"

interface EditorCacheOptions {
  key: string
  ttl?: number // Time to live in milliseconds
  version?: string // Cache version for invalidation
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

/**
 * Custom hook for caching editor state with TTL and version support
 * Prevents unnecessary re-renders and improves mobile performance
 */
export function useEditorCache<T>(
  value: T,
  options: EditorCacheOptions
): {
  cachedValue: T
  updateCache: (newValue: T) => void
  clearCache: () => void
  isCacheValid: boolean
} {
  const { key, ttl = 5 * 60 * 1000, version = "1.0" } = options // Default 5 min TTL
  const cacheRef = useRef<CacheEntry<T> | null>(null)
  const isBrowserRef = useRef(typeof window !== "undefined")

  // Load from localStorage on mount
  useEffect(() => {
    if (!isBrowserRef.current) return

    try {
      const stored = localStorage.getItem(`editor-cache-${key}`)
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored)
        const isExpired = Date.now() - entry.timestamp > ttl
        const isVersionMismatch = entry.version !== version

        if (!isExpired && !isVersionMismatch) {
          cacheRef.current = entry
        } else {
          // Clear expired or outdated cache
          localStorage.removeItem(`editor-cache-${key}`)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load editor cache:", error)
    }
  }, [key, ttl, version])

  // Update cache
  const updateCache = useCallback(
    (newValue: T) => {
      if (!isBrowserRef.current) return

      const entry: CacheEntry<T> = {
        data: newValue,
        timestamp: Date.now(),
        version,
      }

      cacheRef.current = entry

      try {
        localStorage.setItem(`editor-cache-${key}`, JSON.stringify(entry))
      } catch (error) {
        console.error("[v0] Failed to update editor cache:", error)
      }
    },
    [key, version]
  )

  // Clear cache
  const clearCache = useCallback(() => {
    if (!isBrowserRef.current) return

    cacheRef.current = null
    try {
      localStorage.removeItem(`editor-cache-${key}`)
    } catch (error) {
      console.error("[v0] Failed to clear editor cache:", error)
    }
  }, [key])

  // Check if cache is valid
  const isCacheValid =
    cacheRef.current !== null &&
    Date.now() - cacheRef.current.timestamp <= ttl &&
    cacheRef.current.version === version

  // Return cached value or current value
  const cachedValue = isCacheValid ? cacheRef.current!.data : value

  // Auto-update cache when value changes
  useEffect(() => {
    if (value !== cachedValue) {
      updateCache(value)
    }
  }, [value, cachedValue, updateCache])

  return {
    cachedValue,
    updateCache,
    clearCache,
    isCacheValid,
  }
}
