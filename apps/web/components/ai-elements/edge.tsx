"use client"

import type { ComponentProps } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type EdgeProps = ComponentProps<"svg"> & {
  source?: { x: number; y: number }
  target?: { x: number; y: number }
}

export const Edge = Object.assign(
  memo(({ className, source, target, ...props }: EdgeProps) => (
    <svg className={cn("absolute inset-0 pointer-events-none", className)} {...props}>
      {source && target && (
        <path
          d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/50"
        />
      )}
    </svg>
  )),
  {
    Animated: memo(({ className, source, target, ...props }: EdgeProps) => (
      <svg className={cn("absolute inset-0 pointer-events-none", className)} {...props}>
        {source && target && (
          <>
            <path
              id="edge-path"
              d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/50"
            />
            <circle r="4" fill="currentColor" className="text-primary">
              <animateMotion
                dur="1s"
                repeatCount="indefinite"
                path={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`}
              />
            </circle>
          </>
        )}
      </svg>
    )),
    Temporary: memo(({ className, source, target, ...props }: EdgeProps) => (
      <svg className={cn("absolute inset-0 pointer-events-none opacity-50", className)} {...props}>
        {source && target && (
          <path
            d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-muted-foreground"
          />
        )}
      </svg>
    )),
  }
)

Edge.displayName = "Edge"
Edge.Animated.displayName = "EdgeAnimated"
Edge.Temporary.displayName = "EdgeTemporary"
