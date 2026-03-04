"use client"

import { PanelLeftIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface SidebarContextType {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({})

export type SidebarProviderProps = ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const SidebarProvider = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  className,
  children,
  ...props
}: SidebarProviderProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen
  const onOpenChange = onOpenChangeProp ?? setInternalOpen

  return (
    <SidebarContext.Provider value={{ open, onOpenChange }}>
      <div
        className={cn(
          "flex min-h-screen w-full",
          open ? "has-[[data-sidebar=sidebar]]:pl-72" : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export type SidebarProps = ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export const Sidebar = ({
  className,
  children,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  ...props
}: SidebarProps) => {
  const { open } = useContext(SidebarContext)

  if (!open) {
    return null
  }

  return (
    <div
      data-sidebar="sidebar"
      className={cn(
        "fixed inset-y-0 z-50 flex w-72 flex-col border-r bg-background",
        side === "left" ? "left-0" : "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type SidebarHeaderProps = ComponentProps<"div">

export const SidebarHeader = ({ className, ...props }: SidebarHeaderProps) => (
  <div className={cn("flex flex-col border-b p-4", className)} {...props} />
)

export type SidebarContentProps = ComponentProps<"div">

export const SidebarContent = ({ className, ...props }: SidebarContentProps) => (
  <div className={cn("flex flex-1 flex-col overflow-auto p-4", className)} {...props} />
)

export type SidebarFooterProps = ComponentProps<"div">

export const SidebarFooter = ({ className, ...props }: SidebarFooterProps) => (
  <div className={cn("flex flex-col border-t p-4", className)} {...props} />
)

export type SidebarGroupProps = ComponentProps<"div">

export const SidebarGroup = ({ className, ...props }: SidebarGroupProps) => (
  <div className={cn("space-y-2 py-4", className)} {...props} />
)

export type SidebarGroupLabelProps = ComponentProps<"div">

export const SidebarGroupLabel = ({ className, ...props }: SidebarGroupLabelProps) => (
  <div className={cn("px-2 text-xs font-medium text-muted-foreground", className)} {...props} />
)

export type SidebarGroupContentProps = ComponentProps<"div">

export const SidebarGroupContent = ({ className, ...props }: SidebarGroupContentProps) => (
  <div className={cn("space-y-2", className)} {...props} />
)

export type SidebarMenuProps = ComponentProps<"ul">

export const SidebarMenu = ({ className, ...props }: SidebarMenuProps) => (
  <ul className={cn("space-y-1", className)} {...props} />
)

export type SidebarMenuItemProps = ComponentProps<"li">

export const SidebarMenuItem = ({ className, ...props }: SidebarMenuItemProps) => (
  <li className={cn("", className)} {...props} />
)

export type SidebarMenuButtonProps = ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = ({
  className,
  asChild,
  isActive,
  ...props
}: SidebarMenuButtonProps) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
        isActive && "bg-muted font-medium",
        className
      )}
      {...props}
    />
  )
}

export type SidebarMenuBadgeProps = ComponentProps<"span">

export const SidebarMenuBadge = ({ className, ...props }: SidebarMenuBadgeProps) => (
  <span className={cn("ml-auto text-xs", className)} {...props} />
)

export type SidebarMenuSubProps = ComponentProps<"ul">

export const SidebarMenuSub = ({ className, ...props }: SidebarMenuSubProps) => (
  <ul className={cn("ml-4 space-y-1", className)} {...props} />
)

export type SidebarMenuSubItemProps = ComponentProps<"li">

export const SidebarMenuSubItem = ({ className, ...props }: SidebarMenuSubItemProps) => (
  <li className={cn("", className)} {...props} />
)

export type SidebarMenuSubButtonProps = ComponentProps<"a"> & {
  isActive?: boolean
}

export const SidebarMenuSubButton = ({
  className,
  isActive,
  ...props
}: SidebarMenuSubButtonProps) => (
  <a
    className={cn(
      "block rounded-md px-2 py-2 text-sm hover:bg-muted",
      isActive && "bg-muted font-medium",
      className
    )}
    {...props}
  />
)

export type SidebarTriggerProps = ComponentProps<"button">

export const SidebarTrigger = ({ className, ...props }: SidebarTriggerProps) => {
  const { open, onOpenChange } = useContext(SidebarContext)

  return (
    <button className={cn("size-8", className)} onClick={() => onOpenChange?.(!open)} {...props}>
      <PanelLeftIcon className="size-4" />
    </button>
  )
}

export type SidebarInsetProps = ComponentProps<"main">

export const SidebarInset = ({ className, ...props }: SidebarInsetProps) => (
  <main className={cn("flex flex-1 flex-col", className)} {...props} />
)

export type SidebarRailProps = ComponentProps<"button">

export const SidebarRail = ({ className, ...props }: SidebarRailProps) => (
  <button
    className={cn("absolute right-0 top-0 h-full w-1 hover:bg-muted", className)}
    {...props}
  />
)
