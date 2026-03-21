"use client"

import { GripVerticalIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { memo, useState } from "react"
import { cn } from "@/lib/utils"

export type NodeProps = ComponentProps<"div"> & {
  title?: string
  icon?: ReactNode
  defaultOpen?: boolean
  handles?: {
    source?: boolean
    target?: boolean
  }
}

export const Node = memo(({ className, title, icon, children, defaultOpen = true }: NodeProps) => {
  const [isOpen, _setIsOpen] = useState(defaultOpen)
  const [position, _setPosition] = useState({ x: 0, y: 0 })

  return (
    <div
      className={cn("absolute min-w-48 rounded-md border bg-background shadow-lg", className)}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div
        className="flex cursor-grab items-center gap-2 border-b px-3 py-2 active:cursor-grabbing"
        onMouseDown={() => {}}
      >
        <GripVerticalIcon className="size-4 text-muted-foreground" />
        {icon && <div className="size-4">{icon}</div>}
        {title && <span className="font-medium text-sm">{title}</span>}
      </div>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  )
})

export type NodeHeaderProps = ComponentProps<"div">

export const NodeHeader = memo(({ className, ...props }: NodeHeaderProps) => (
  <div className={cn("flex items-center gap-2 border-b px-3 py-2", className)} {...props} />
))

export type NodeTitleProps = ComponentProps<"span">

export const NodeTitle = memo(({ className, ...props }: NodeTitleProps) => (
  <span className={cn("font-medium text-sm", className)} {...props} />
))

export type NodeDescriptionProps = ComponentProps<"p">

export const NodeDescription = memo(({ className, ...props }: NodeDescriptionProps) => (
  <p className={cn("text-muted-foreground text-xs", className)} {...props} />
))

export type NodeContentProps = ComponentProps<"div">

export const NodeContent = memo(({ className, ...props }: NodeContentProps) => (
  <div className={cn("p-3", className)} {...props} />
))

export type NodeFooterProps = ComponentProps<"div">

export const NodeFooter = memo(({ className, ...props }: NodeFooterProps) => (
  <div className={cn("flex items-center gap-2 border-t px-3 py-2", className)} {...props} />
))

export type NodeInputProps = ComponentProps<"div">

export const NodeInput = memo(({ className, ...props }: NodeInputProps) => (
  <div className={cn("space-y-2", className)} {...props} />
))

export type NodeOutputProps = ComponentProps<"div">

export const NodeOutput = memo(({ className, ...props }: NodeOutputProps) => (
  <div className={cn("space-y-2", className)} {...props} />
))

export type NodeHandleProps = ComponentProps<"div"> & {
  type?: "source" | "target"
}

export const NodeHandle = memo(({ className, type = "target", ...props }: NodeHandleProps) => (
  <div
    className={cn(
      "absolute size-3 rounded-full border-2 border-background bg-primary",
      type === "source" ? "right-0 top-1/2 -translate-x-1/2" : "left-0 top-1/2 translate-x-1/2",
      className
    )}
    {...props}
  />
))

Node.displayName = "Node"
NodeInput.displayName = "NodeInput"
NodeOutput.displayName = "NodeOutput"
NodeHandle.displayName = "NodeHandle"
