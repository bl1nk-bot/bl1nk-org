"use client"

import { BotIcon, UserIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"

export type MessageProps = ComponentProps<"div"> & {
  from: "user" | "assistant"
}

export const Message = memo(({ className, from, children, ...props }: MessageProps) => (
  <div
    className={cn("flex items-start gap-3", from === "user" ? "flex-row-reverse" : "", className)}
    {...props}
  >
    {from === "assistant" ? (
      <BotIcon className="size-5 text-muted-foreground shrink-0" />
    ) : (
      <UserIcon className="size-5 text-muted-foreground shrink-0" />
    )}
    {children}
  </div>
))

export type MessageContentProps = ComponentProps<"div">

export const MessageContent = memo(({ className, children, ...props }: MessageContentProps) => (
  <div className={cn("max-w-[80%]", className)} {...props}>
    {children}
  </div>
))

export type MessageResponseProps = ComponentProps<"div">

export const MessageResponse = memo(({ className, children, ...props }: MessageResponseProps) => (
  <div className={cn("prose prose-sm", className)} {...props}>
    {children}
  </div>
))

Message.displayName = "Message"
MessageContent.displayName = "MessageContent"
MessageResponse.displayName = "MessageResponse"
