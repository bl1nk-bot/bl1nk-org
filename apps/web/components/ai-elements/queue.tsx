"use client"

import type { ComponentProps, ReactNode } from "react"
import { memo, useState } from "react"
import { cn } from "@/lib/utils"

export type QueueProps = ComponentProps<"div">

export const Queue = memo(({ className, ...props }: QueueProps) => (
  <div className={cn("space-y-2", className)} {...props} />
))

export type QueueSectionProps = ComponentProps<"div"> & {
  defaultOpen?: boolean
}

export const QueueSection = memo(
  ({ className, children, defaultOpen = true }: QueueSectionProps) => {
    const [isOpen, _setIsOpen] = useState(defaultOpen)

    return <div className={cn("space-y-2", className)}>{isOpen ? children : null}</div>
  }
)

export type QueueSectionTriggerProps = ComponentProps<"button">

export const QueueSectionTrigger = memo(({ className, ...props }: QueueSectionTriggerProps) => (
  <button className={cn("flex items-center gap-2", className)} {...props} />
))

export type QueueSectionLabelProps = ComponentProps<"div"> & {
  icon: ReactNode
  label: string
  count?: number
}

export const QueueSectionLabel = memo(
  ({ className, icon, label, count }: QueueSectionLabelProps) => (
    <div className={cn("flex items-center gap-2 text-muted-foreground text-xs", className)}>
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
      )}
    </div>
  )
)

export type QueueSectionContentProps = ComponentProps<"div">

export const QueueSectionContent = memo(({ className, ...props }: QueueSectionContentProps) => (
  <div className={cn("ml-4 space-y-1", className)} {...props} />
))

export type QueueListProps = ComponentProps<"div">

export const QueueList = memo(({ className, ...props }: QueueListProps) => (
  <div className={cn("space-y-1", className)} {...props} />
))

export type QueueItemProps = ComponentProps<"div">

export const QueueItem = memo(({ className, ...props }: QueueItemProps) => (
  <div className={cn("rounded-md p-2", className)} {...props} />
))

export type QueueItemContentProps = ComponentProps<"div"> & {
  completed?: boolean
}

export const QueueItemContent = memo(
  ({ className, completed, ...props }: QueueItemContentProps) => (
    <div
      className={cn("text-sm", completed && "text-muted-foreground line-through", className)}
      {...props}
    />
  )
)

export type QueueItemIndicatorProps = ComponentProps<"div"> & {
  completed?: boolean
}

export const QueueItemIndicator = memo(({ className, completed }: QueueItemIndicatorProps) => (
  <div
    className={cn(
      "size-4 rounded-full border",
      completed ? "bg-primary border-primary" : "border-muted-foreground",
      className
    )}
  />
))

Queue.displayName = "Queue"
QueueSection.displayName = "QueueSection"
QueueSectionTrigger.displayName = "QueueSectionTrigger"
QueueSectionLabel.displayName = "QueueSectionLabel"
QueueSectionContent.displayName = "QueueSectionContent"
QueueList.displayName = "QueueList"
QueueItem.displayName = "QueueItem"
QueueItemContent.displayName = "QueueItemContent"
QueueItemIndicator.displayName = "QueueItemIndicator"
