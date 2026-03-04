"use client"

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { createContext, memo, useContext, useState } from "react"
import { cn } from "@/lib/utils"

interface FileTreeContextType {
  selectedPath?: string
  expanded?: Set<string>
  onExpandedChange?: (expanded: Set<string>) => void
  onFileSelect?: (path: string) => void
}

const FileTreeContext = createContext<FileTreeContextType>({})

export type FileTreeProps = ComponentProps<"div"> & {
  selectedPath?: string
  expanded?: Set<string>
  onExpandedChange?: (expanded: Set<string>) => void
  onFileSelect?: (path: string) => void
}

export const FileTree = memo(
  ({
    className,
    children,
    selectedPath,
    expanded = new Set(),
    onExpandedChange,
    onFileSelect,
  }: FileTreeProps) => (
    <FileTreeContext.Provider value={{ selectedPath, expanded, onExpandedChange, onFileSelect }}>
      <div className={cn("space-y-1 p-2", className)}>{children}</div>
    </FileTreeContext.Provider>
  )
)

export type FileTreeFolderProps = ComponentProps<"div"> & {
  name: string
  path: string
  children?: ReactNode
}

export const FileTreeFolder = memo(({ className, name, path, children }: FileTreeFolderProps) => {
  const context = useContext(FileTreeContext)
  const [isExpanded, setIsExpanded] = useState(context.expanded?.has(path) ?? true)

  return (
    <div className={cn("space-y-1", className)}>
      <button
        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-muted"
        onClick={() => {
          setIsExpanded(!isExpanded)
          if (context.onExpandedChange) {
            const newExpanded = new Set(context.expanded)
            if (newExpanded.has(path)) {
              newExpanded.delete(path)
            } else {
              newExpanded.add(path)
            }
            context.onExpandedChange(newExpanded)
          }
        }}
      >
        <ChevronRightIcon
          className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
        />
        <FolderIcon className="size-4 text-muted-foreground" />
        <span>{name}</span>
      </button>
      {isExpanded && <div className="ml-4">{children}</div>}
    </div>
  )
})

export type FileTreeFileProps = ComponentProps<"div"> & {
  name: string
  path: string
}

export const FileTreeFile = memo(({ className, name, path }: FileTreeFileProps) => {
  const context = useContext(FileTreeContext)
  const isSelected = context.selectedPath === path

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm",
        isSelected && "bg-muted",
        "hover:bg-muted/80",
        className
      )}
      onClick={() => context.onFileSelect?.(path)}
    >
      <FileIcon className="size-4 text-muted-foreground" />
      <span>{name}</span>
    </div>
  )
})

FileTree.displayName = "FileTree"
FileTreeFolder.displayName = "FileTreeFolder"
FileTreeFile.displayName = "FileTreeFile"
