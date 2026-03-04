"use client"

import type { ComponentProps } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type ConversationProps = ComponentProps<"div">

export const Conversation = memo(({ className, ...props }: ConversationProps) => (
  <div className={cn("flex flex-1 flex-col overflow-hidden", className)} {...props} />
))

export type ConversationContentProps = ComponentProps<"div">

export const ConversationContent = memo(({ className, ...props }: ConversationContentProps) => (
  <div className={cn("flex flex-1 flex-col overflow-auto", className)} {...props} />
))

Conversation.displayName = "Conversation"
ConversationContent.displayName = "ConversationContent"
