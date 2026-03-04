"use client"

import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { memo, useState } from "react"
import { cn } from "@/lib/utils"

export type TaskProps = ComponentProps<"div"> & {
  defaultOpen?: boolean
}

export const Task = memo(({ className, children, defaultOpen = true }: TaskProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return <div className={cn("space-y-2", className)}>{isOpen ? children : null}</div>
})

export type TaskTriggerProps = ComponentProps<"button"> & {
  title: string
}

export const TaskTrigger = memo(({ className, title }: TaskTriggerProps) => (
  <button className={cn("flex items-center gap-2 text-sm")}>
    <ChevronDownIcon className="size-4 text-muted-foreground" />
    <span>{title}</span>
  </button>
))

export type TaskContentProps = ComponentProps<"div">

export const TaskContent = memo(({ className, ...props }: TaskContentProps) => (
  <div className={cn("ml-6 space-y-1", className)} {...props} />
))

export type TaskItemFileProps = ComponentProps<"div">

export const TaskItemFile = memo(({ className, children, ...props }: TaskItemFileProps) => (
  <div
    className={cn("flex items-center gap-2 text-muted-foreground text-xs", className)}
    {...props}
  >
    {children}
  </div>
))

Task.displayName = "Task"
TaskTrigger.displayName = "TaskTrigger"
TaskContent.displayName = "TaskContent"
TaskItemFile.displayName = "TaskItemFile"
