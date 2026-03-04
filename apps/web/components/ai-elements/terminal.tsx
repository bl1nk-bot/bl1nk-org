"use client"

import type { ComponentProps } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type TerminalProps = ComponentProps<"div"> & {
  output?: string
  isStreaming?: boolean
}

export const Terminal = memo(
  ({ className, output, isStreaming, children, ...props }: TerminalProps) => (
    <div className={cn("overflow-auto bg-muted p-4 font-mono text-xs", className)} {...props}>
      {children}
    </div>
  )
)

export type TerminalContentProps = ComponentProps<"pre">

export const TerminalContent = memo(({ className, children, ...props }: TerminalContentProps) => (
  <pre className={cn("whitespace-pre-wrap", className)} {...props}>
    {children}
  </pre>
))

Terminal.displayName = "Terminal"
TerminalContent.displayName = "TerminalContent"
