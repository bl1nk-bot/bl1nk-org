"use client"

import type { ComponentProps, ReactNode } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type CanvasProps = ComponentProps<"div"> & {
  edges?: Array<{
    id: string
    source: string
    target: string
    type?: string
  }>
  edgeTypes?: Record<string, React.ComponentType<any>>
  nodes?: Array<{
    id: string
    type?: string
    position?: { x: number; y: number }
    data?: any
  }>
  nodeTypes?: Record<string, React.ComponentType<any>>
  fitView?: boolean
  children?: ReactNode
}

export const Canvas = memo(
  ({ className, edges, edgeTypes, nodes, nodeTypes, fitView, children, ...props }: CanvasProps) => (
    <div className={cn("relative h-full w-full overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
)

Canvas.displayName = "Canvas"
