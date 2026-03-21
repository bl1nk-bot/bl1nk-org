"use client"

import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { memo, useState } from "react"
import { cn } from "@/lib/utils"

export type PlanProps = ComponentProps<"div"> & {
  defaultOpen?: boolean
}

export const Plan = memo(({ className, children, defaultOpen = true }: PlanProps) => {
  const [isOpen, _setIsOpen] = useState(defaultOpen)

  return <div className={cn("rounded-md border", className)}>{isOpen ? children : null}</div>
})

export type PlanHeaderProps = ComponentProps<"div">

export const PlanHeader = memo(({ className, ...props }: PlanHeaderProps) => (
  <div className={cn("flex items-center justify-between border-b p-3", className)} {...props} />
))

export type PlanTitleProps = ComponentProps<"h3">

export const PlanTitle = memo(({ className, ...props }: PlanTitleProps) => (
  <h3 className={cn("font-semibold text-sm", className)} {...props} />
))

export type PlanDescriptionProps = ComponentProps<"p">

export const PlanDescription = memo(({ className, ...props }: PlanDescriptionProps) => (
  <p className={cn("text-muted-foreground text-xs", className)} {...props} />
))

export type PlanContentProps = ComponentProps<"div">

export const PlanContent = memo(({ className, ...props }: PlanContentProps) => (
  <div className={cn("p-3", className)} {...props} />
))

export type PlanTriggerProps = ComponentProps<"button">

export const PlanTrigger = memo(({ className, ...props }: PlanTriggerProps) => (
  <button className={cn("text-muted-foreground hover:text-foreground", className)} {...props}>
    <ChevronDownIcon className="size-4" />
  </button>
))

export type PlanActionProps = ComponentProps<"div">

export const PlanAction = memo(({ className, ...props }: PlanActionProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
))

Plan.displayName = "Plan"
PlanHeader.displayName = "PlanHeader"
PlanTitle.displayName = "PlanTitle"
PlanDescription.displayName = "PlanDescription"
PlanContent.displayName = "PlanContent"
PlanTrigger.displayName = "PlanTrigger"
PlanAction.displayName = "PlanAction"
