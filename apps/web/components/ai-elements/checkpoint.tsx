"use client"

import { ClockIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type CheckpointProps = ComponentProps<"div">

export const Checkpoint = memo(({ className, ...props }: CheckpointProps) => (
  <div className={cn("not-prose flex items-center gap-2 text-xs", className)} {...props} />
))

export type CheckpointIconProps = ComponentProps<"div">

export const CheckpointIcon = memo(({ className, ...props }: CheckpointIconProps) => (
  <div className={cn("text-muted-foreground", className)} {...props}>
    <ClockIcon className="size-3" />
  </div>
))

export type CheckpointTriggerProps = ComponentProps<"button"> & {
  tooltip?: string
}

export const CheckpointTrigger = memo(
  ({ className, children, tooltip, ...props }: CheckpointTriggerProps) => (
    <button
      className={cn("text-muted-foreground hover:text-foreground text-xs", className)}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  )
)

Checkpoint.displayName = "Checkpoint"
CheckpointIcon.displayName = "CheckpointIcon"
CheckpointTrigger.displayName = "CheckpointTrigger"
