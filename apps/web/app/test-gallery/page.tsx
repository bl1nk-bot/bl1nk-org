"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Agent, AgentHeader, AgentContent } from "@/components/ai-elements/agent"
import { CodeBlock } from "@/components/ai-elements/code-block"
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "@/components/ai-elements/checkpoint"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { FileTree, FileTreeFile, FileTreeFolder } from "@/components/ai-elements/file-tree"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Plan, PlanContent, PlanHeader, PlanTitle, PlanTrigger } from "@/components/ai-elements/plan"
import { Queue, QueueItem, QueueList, QueueSection, QueueSectionLabel, QueueSectionTrigger, QueueSectionContent } from "@/components/ai-elements/queue"
import { Task, TaskTrigger, TaskContent } from "@/components/ai-elements/task"
import { Terminal, TerminalContent } from "@/components/ai-elements/terminal"
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input"
import { Canvas } from "@/components/ai-elements/canvas"
import { Edge } from "@/components/ai-elements/edge"
import { Node, NodeHeader, NodeTitle, NodeContent } from "@/components/ai-elements/node"

import { Loader2, Mail, Search, User, Settings, Home, Inbox, Calendar } from "lucide-react"

export default function TestGallery() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-4xl font-bold">Component Gallery</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Shadcn UI Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button */}
          <Card id="button-section">
            <CardHeader>
              <CardTitle>Button</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Send mail"><Mail /></Button>
              <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</Button>
            </CardContent>
          </Card>

          {/* Card */}
          <Card id="card-section">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>

          {/* Dialog */}
          <Card id="dialog-section">
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="submit">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Input */}
          <Card id="input-section">
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="email">Email</label>
                <Input type="email" id="email" placeholder="Email" />
              </div>
              <Input disabled placeholder="Disabled Input" />
            </CardContent>
          </Card>

          {/* Skeleton */}
          <Card id="skeleton-section">
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardContent>
          </Card>

          {/* Sonner (Toast) */}
          <Card id="sonner-section">
            <CardHeader>
              <CardTitle>Sonner (Toast)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast("Event has been created")}>Default Toast</Button>
              <Button variant="outline" onClick={() => toast.success("Success!")}>Success Toast</Button>
              <Button variant="outline" onClick={() => toast.error("Error!")}>Error Toast</Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card id="tabs-section">
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card id="avatar-section">
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          {/* Breadcrumb */}
          <Card id="breadcrumb-section">
            <CardHeader>
              <CardTitle>Breadcrumb</CardTitle>
            </CardHeader>
            <CardContent>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>

          {/* ScrollArea */}
          <Card id="scroll-area-section">
            <CardHeader>
              <CardTitle>ScrollArea</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[100px] w-[200px] rounded-md border p-4">
                Jokester began sneaking into the castle in the middle of the night and leaving
                jokes all over the place: under the king's pillow, in his soup, even in the
                royal toilet. The king was furious, but he couldn't help but laugh at some of
                the jokes.
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Separator */}
          <Card id="separator-section">
            <CardHeader>
              <CardTitle>Separator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                <p className="text-sm text-muted-foreground">
                  An open-source UI component library.
                </p>
              </div>
              <Separator className="my-4" />
              <div className="flex h-5 items-center space-x-4 text-sm">
                <div>Blog</div>
                <Separator orientation="vertical" />
                <div>Docs</div>
                <Separator orientation="vertical" />
                <div>Source</div>
              </div>
            </CardContent>
          </Card>

          {/* Accordion */}
          <Card id="accordion-section">
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Alert */}
          <Card id="alert-section">
            <CardHeader>
              <CardTitle>Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the cli.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Your session has expired. Please log in again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Badge */}
          <Card id="badge-section">
            <CardHeader>
              <CardTitle>Badge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>

          {/* Collapsible */}
          <Card id="collapsible-section">
            <CardHeader>
              <CardTitle>Collapsible</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible className="w-[350px] space-y-2">
                <div className="flex items-center justify-between space-x-4 px-4">
                  <h4 className="text-sm font-semibold">
                    @peduarte starred 3 repositories
                  </h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0" aria-label="Toggle repositories">
                      <Search className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2">
                  <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    @radix-ui/primitives
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Command */}
          <Card id="command-section">
            <CardHeader>
              <CardTitle>Command</CardTitle>
            </CardHeader>
            <CardContent>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>Calendar</CommandItem>
                    <CommandItem>Search Emoji</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>

          {/* Dropdown Menu */}
          <Card id="dropdown-menu-section">
            <CardHeader>
              <CardTitle>Dropdown Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Hover Card */}
          <Card id="hover-card-section">
            <CardHeader>
              <CardTitle>Hover Card</CardTitle>
            </CardHeader>
            <CardContent>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@nextjs</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  The React Framework – created and maintained by @vercel.
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>

          {/* Select */}
          <Card id="select-section">
            <CardHeader>
              <CardTitle>Select</CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger className="w-[180px]" aria-label="Select a fruit">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes" disabled>Grapes</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Textarea */}
          <Card id="textarea-section">
            <CardHeader>
              <CardTitle>Textarea</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Type your message here." aria-label="Message" />
            </CardContent>
          </Card>

          {/* Tooltip */}
          <Card id="tooltip-section">
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to library</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card id="progress-section">
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="w-[60%]" />
            </CardContent>
          </Card>

          {/* Input Group */}
          <Card id="input-group-section">
            <CardHeader>
              <CardTitle>Input Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputGroup>
                <Input placeholder="Search..." />
                <Button size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
              </InputGroup>
              <InputGroup>
                <div className="flex items-center justify-center bg-muted px-3 border border-r-0 rounded-l-md">
                  <User className="h-4 w-4" />
                </div>
                <Input className="rounded-l-none" placeholder="Username" />
              </InputGroup>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <Card id="sidebar-section" className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] border rounded-md overflow-hidden relative">
              <SidebarProvider>
                <div className="flex h-full w-full">
                  <Sidebar collapsible="icon" className="absolute left-0 top-0 h-full border-r">
                    <SidebarContent>
                      <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton>
                              <Home />
                              <span>Home</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton>
                              <Inbox />
                              <span>Inbox</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton>
                              <Calendar />
                              <span>Calendar</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroup>
                    </SidebarContent>
                  </Sidebar>
                  <main className="flex-1 p-4 ml-[var(--sidebar-width-icon)]">
                    Sidebar Content Area
                  </main>
                </div>
              </SidebarProvider>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">AI Elements Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agent */}
          <Card id="agent-section">
            <CardHeader>
              <CardTitle>Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <Agent>
                <AgentHeader name="Bl1nk Agent" model="gpt-4o" />
                <AgentContent>
                  <p className="text-sm">Agent components rendered here.</p>
                </AgentContent>
              </Agent>
            </CardContent>
          </Card>

          {/* CodeBlock */}
          <Card id="codeblock-section" className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>CodeBlock</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`function hello() {\n  console.log("Hello, world!");\n}`}
                language="javascript"
                showLineNumbers
              />
            </CardContent>
          </Card>

          {/* Checkpoint */}
          <Card id="checkpoint-section">
            <CardHeader>
              <CardTitle>Checkpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <Checkpoint>
                <CheckpointIcon />
                <CheckpointTrigger tooltip="2 minutes ago">
                  Checkpoint saved
                </CheckpointTrigger>
              </Checkpoint>
            </CardContent>
          </Card>

          {/* Conversation & Message */}
          <Card id="conversation-section" className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Conversation & Message</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] border rounded-md">
              <Conversation>
                <ConversationContent className="p-4 gap-4">
                  <Message from="user">
                    <MessageContent className="rounded-lg bg-secondary px-3 py-2">
                      Hello, how can you help me?
                    </MessageContent>
                  </Message>
                  <Message from="assistant">
                    <MessageContent>
                      I can help you with your code!
                    </MessageContent>
                  </Message>
                </ConversationContent>
              </Conversation>
            </CardContent>
          </Card>

          {/* FileTree */}
          <Card id="filetree-section">
            <CardHeader>
              <CardTitle>FileTree</CardTitle>
            </CardHeader>
            <CardContent>
              <FileTree expanded={new Set(["src"])}>
                <FileTreeFolder name="src" path="src">
                  <FileTreeFile name="index.ts" path="src/index.ts" />
                </FileTreeFolder>
                <FileTreeFile name="package.json" path="package.json" />
              </FileTree>
            </CardContent>
          </Card>

          {/* Plan & Task */}
          <Card id="plan-section">
            <CardHeader>
              <CardTitle>Plan & Task</CardTitle>
            </CardHeader>
            <CardContent>
              <Plan defaultOpen>
                <PlanHeader>
                  <PlanTitle>Deployment Plan</PlanTitle>
                  <PlanTrigger />
                </PlanHeader>
                <PlanContent>
                  <Task defaultOpen>
                    <TaskTrigger title="Prepare infrastructure" />
                    <TaskContent>
                      Setting up servers and database.
                    </TaskContent>
                  </Task>
                </PlanContent>
              </Plan>
            </CardContent>
          </Card>

          {/* Queue */}
          <Card id="queue-section">
            <CardHeader>
              <CardTitle>Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Queue>
                <QueueSection defaultOpen>
                  <QueueSectionTrigger>
                    <QueueSectionLabel label="In Progress" count={1} />
                  </QueueSectionTrigger>
                  <QueueSectionContent>
                    <QueueList>
                      <QueueItem>Deploying to production</QueueItem>
                    </QueueList>
                  </QueueSectionContent>
                </QueueSection>
              </Queue>
            </CardContent>
          </Card>

          {/* Terminal */}
          <Card id="terminal-section" className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <Terminal output="\x1b[32m$\x1b[0m npm run build\n\x1b[36mBuilding...\x1b[0m\nDone!">
                <TerminalContent />
              </Terminal>
            </CardContent>
          </Card>

          {/* PromptInput */}
          <Card id="promptinput-section" className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>PromptInput</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptInput onSubmit={(m) => console.log(m)}>
                <PromptInputTextarea placeholder="Ask anything..." />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit />
                </PromptInputFooter>
              </PromptInput>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card id="canvas-section" className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <Canvas className="h-[300px] border rounded-md" data-testid="canvas-area">
                <div className="text-muted-foreground text-sm p-4">
                  Canvas area for workflow nodes and edges
                </div>
              </Canvas>
            </CardContent>
          </Card>

          {/* Edge */}
          <Card id="edge-section">
            <CardHeader>
              <CardTitle>Edge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-[100px] border rounded-md">
                <Edge
                  source={{ x: 50, y: 50 }}
                  target={{ x: 250, y: 50 }}
                  data-testid="edge-connection"
                />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Edge connection
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Node */}
          <Card id="node-section">
            <CardHeader>
              <CardTitle>Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Node title="Workflow Node" className="relative">
                <NodeHeader>
                  <NodeTitle>Process Data</NodeTitle>
                </NodeHeader>
                <NodeContent>
                  <p className="text-sm text-muted-foreground">
                    Transform and validate input data
                  </p>
                </NodeContent>
              </Node>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
