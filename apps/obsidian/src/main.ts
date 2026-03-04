import { Notice, Plugin, requestUrl, type WorkspaceLeaf, type WorkspaceSplit } from "obsidian"
import type { Root } from "react-dom/client"
import * as semver from "semver"
import { AcpAdapter } from "./adapters/acp/acp.adapter"
import { createSettingsStore, type SettingsStore } from "./adapters/obsidian/settings-store.adapter"
import { ChatView, VIEW_TYPE_CHAT } from "./components/chat/ChatView"
import { FloatingButtonContainer } from "./components/chat/FloatingButton"
import { createFloatingChat, FloatingViewContainer } from "./components/chat/FloatingChatView"
import { AgentClientSettingTab } from "./components/settings/AgentClientSettingTab"
import type {
  AgentEnvVar,
  ClaudeAgentSettings,
  CodexAgentSettings,
  CustomAgentSettings,
  GeminiAgentSettings,
} from "./domain/models/agent-config"
import type { SavedSessionInfo } from "./domain/models/session-info"
import { ChatViewRegistry } from "./shared/chat-view-registry"
import { parseChatFontSize } from "./shared/display-settings"
import { initializeLogger } from "./shared/logger"
import {
  ensureUniqueCustomAgentIds,
  normalizeCustomAgent,
  normalizeEnvVars,
  sanitizeArgs,
} from "./shared/settings-utils"

// ✅ Re-export สำหรับ backward compatibility
export type { AgentEnvVar, CustomAgentSettings }

/**
 * ✅ ตั้งค่าปุ่มส่งข้อความ
 * - 'enter': Enter เพื่อส่ง, Shift+Enter สำหรับบรรทัดใหม่ (ค่าเริ่มต้น)
 * - 'cmd-enter': Cmd/Ctrl+Enter เพื่อส่ง, Enter สำหรับบรรทัดใหม่
 */
export type SendMessageShortcut = "enter" | "cmd-enter"

/**
 * ✅ ตั้งค่าตำแหน่งของ Chat View
 * - 'right-tab': เปิดในบานขวาเป็นแท็บ (ค่าเริ่มต้น)
 * - 'right-split': เปิดในบานขวาแบบแยก
 * - 'editor-tab': เปิดในพื้นที่ editor เป็นแท็บ
 * - 'editor-split': เปิดในพื้นที่ editor แบบแยก
 */
export type ChatViewLocation = "right-tab" | "right-split" | "editor-tab" | "editor-split"

export interface AgentClientPluginSettings {
  gemini: GeminiAgentSettings
  claude: ClaudeAgentSettings
  codex: CodexAgentSettings
  customAgents: CustomAgentSettings[]
  /** ID ของ agent เริ่มต้นสำหรับ view ใหม่ */
  defaultAgentId: string
  autoAllowPermissions: boolean
  autoMentionActiveNote: boolean
  debugMode: boolean
  nodePath: string
  exportSettings: {
    defaultFolder: string
    filenameTemplate: string
    autoExportOnNewChat: boolean
    autoExportOnCloseChat: boolean
    openFileAfterExport: boolean
    includeImages: boolean
    imageLocation: "obsidian" | "custom" | "base64"
    imageCustomFolder: string
    frontmatterTag: string
  }
  // ✅ ตั้งค่า WSL (Windows เท่านั้น)
  windowsWslMode: boolean
  windowsWslDistribution?: string
  // ✅ พฤติกรรมการป้อนข้อมูล
  sendMessageShortcut: SendMessageShortcut
  // ✅ ตั้งค่า View
  chatViewLocation: ChatViewLocation
  // ✅ ตั้งค่าการแสดงผล
  displaySettings: {
    autoCollapseDiffs: boolean
    diffCollapseThreshold: number
    maxNoteLength: number
    maxSelectionLength: number
    showEmojis: boolean
    fontSize: number | null
  }
  // ✅ ข้อมูล session ที่บันทึกไว้ (สำหรับ agent ที่ไม่รองรับ session/list)
  savedSessions: SavedSessionInfo[]
  // ✅ Model ที่ใช้ล่าสุดต่อ agent (agentId → modelId)
  lastUsedModels: Record<string, string>
  // ✅ ตั้งค่าปุ่ม floating chat
  showFloatingButton: boolean
  floatingButtonImage: string
  floatingWindowSize: { width: number; height: number }
  floatingWindowPosition: { x: number; y: number } | null
  floatingButtonPosition: { x: number; y: number } | null
}

const DEFAULT_SETTINGS: AgentClientPluginSettings = {
  claude: {
    id: "claude-code-acp",
    displayName: "Claude Code",
    apiKey: "",
    command: "",
    args: [],
    env: [],
  },
  codex: {
    id: "codex-acp",
    displayName: "Codex",
    apiKey: "",
    command: "",
    args: [],
    env: [],
  },
  gemini: {
    id: "gemini-cli",
    displayName: "Gemini CLI",
    apiKey: "",
    command: "",
    args: ["--experimental-acp"],
    env: [],
  },
  customAgents: [],
  defaultAgentId: "claude-code-acp",
  autoAllowPermissions: false,
  autoMentionActiveNote: true,
  debugMode: false,
  nodePath: "",
  exportSettings: {
    defaultFolder: "Agent Client",
    filenameTemplate: "agent_client_{date}_{time}",
    autoExportOnNewChat: false,
    autoExportOnCloseChat: false,
    openFileAfterExport: true,
    includeImages: true,
    imageLocation: "obsidian",
    imageCustomFolder: "Agent Client",
    frontmatterTag: "agent-client",
  },
  windowsWslMode: false,
  windowsWslDistribution: undefined,
  sendMessageShortcut: "enter",
  chatViewLocation: "right-tab",
  displaySettings: {
    autoCollapseDiffs: false,
    diffCollapseThreshold: 10,
    maxNoteLength: 10000,
    maxSelectionLength: 10000,
    showEmojis: true,
    fontSize: null,
  },
  savedSessions: [],
  lastUsedModels: {},
  showFloatingButton: false,
  floatingButtonImage: "",
  floatingWindowSize: { width: 400, height: 500 },
  floatingWindowPosition: null,
  floatingButtonPosition: null,
}

export default class AgentClientPlugin extends Plugin {
  settings: AgentClientPluginSettings
  settingsStore!: SettingsStore

  /** ✅ Registry สำหรับ chat view containers ทั้งหมด (sidebar + floating) */
  viewRegistry = new ChatViewRegistry()

  /** ✅ Map ของ viewId ไปยัง AcpAdapter สำหรับ multi-session support */
  private _adapters: Map<string, AcpAdapter> = new Map()

  /** ✅ Floating button container (อิสระจาก chat view instances) */
  private floatingButton: FloatingButtonContainer | null = null

  /** ✅ Map ของ viewId ไปยัง floating chat roots และ containers */
  private floatingChatInstances: Map<string, { root: Root; container: HTMLElement }> = new Map()

  /** ✅ Counter สำหรับสร้าง unique floating chat instance IDs */
  private floatingChatCounter = 0

  async onload() {
    try {
      // ✅ โหลด settings ก่อน
      await this.loadSettings()

      // ✅ เริ่มต้น logger
      initializeLogger(this.settings)

      // ✅ สร้าง settings store หลังจาก loadSettings
      this.settingsStore = createSettingsStore(this.settings, this)

      // ✅ ลงทะเบียน chat view
      this.registerView(VIEW_TYPE_CHAT, (leaf) => new ChatView(leaf, this))

      // ✅ เพิ่มปุ่ม ribbon
      const ribbonIconEl = this.addRibbonIcon(
        "bot-message-square",
        "เปิด agent client",
        (_evt: MouseEvent) => {
          void this.activateView()
        }
      )
      ribbonIconEl.addClass("agent-client-ribbon-icon")

      // ✅ ลงทะเบียน commands
      this.registerCommands()

      // ✅ เพิ่ม settings tab
      this.addSettingTab(new AgentClientSettingTab(this.app, this))

      // ✅ เมาท์ floating button
      this.floatingButton = new FloatingButtonContainer(this)
      this.floatingButton.mount()

      // ✅ เมาท์ floating chat instance เริ่มต้น (ถ้าเปิดใช้งาน)
      if (this.settings.showFloatingButton) {
        this.openNewFloatingChat()
      }

      // ✅ ลงทะเบียน event สำหรับ cleanup เมื่อ quit
      this.registerEvent(
        this.app.workspace.on("quit", () => {
          // ✅ ไม่รอให้ disconnect เสร็จเพื่อไม่บล็อก quit
          for (const [viewId, adapter] of this._adapters) {
            adapter.disconnect().catch((error) => {
              console.warn(`[AgentClient] ข้อผิดพลาด cleanup สำหรับ view ${viewId}:`, error)
            })
          }
          this._adapters.clear()
        })
      )

      console.log("[AgentClient] Plugin โหลดเสร็จสิ้น")
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างโหลด:", error)
      new Notice("[AgentClient] ข้อผิดพลาดระหว่างโหลด plugin")
    }
  }

  async onunload() {
    try {
      // ✅ ยกเลิก floating button
      if (this.floatingButton) {
        this.floatingButton.unmount()
        this.floatingButton = null
      }

      // ✅ ยกเลิก floating chat instances ทั้งหมด
      for (const container of this.viewRegistry.getByType("floating")) {
        if (container instanceof FloatingViewContainer) {
          try {
            container.unmount()
          } catch (error) {
            console.warn("[AgentClient] ข้อผิดพลาดระหว่าง unmount floating view:", error)
          }
        }
      }

      // ✅ ล้าง registry
      this.viewRegistry.clear()

      // ✅ ล้าง legacy storage
      this.floatingChatInstances.clear()

      // ✅ ปิด adapters ทั้งหมด
      for (const [viewId, adapter] of this._adapters) {
        try {
          await adapter.disconnect()
        } catch (error) {
          console.warn(`[AgentClient] ข้อผิดพลาดระหว่างปิด adapter สำหรับ view ${viewId}:`, error)
        }
      }
      this._adapters.clear()

      console.log("[AgentClient] Plugin ยกเลิกเสร็จสิ้น")
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างยกเลิก:", error)
    }
  }

  /**
   * ✅ ลงทะเบียน commands ทั้งหมด
   */
  private registerCommands(): void {
    // ✅ เปิด chat view
    this.addCommand({
      id: "open-chat-view",
      name: "เปิด agent chat",
      callback: () => {
        void this.activateView()
      },
    })

    // ✅ โฟกัส chat view ถัดไป
    this.addCommand({
      id: "focus-next-chat-view",
      name: "โฟกัส chat view ถัดไป",
      callback: () => {
        this.focusChatView("next")
      },
    })

    // ✅ โฟกัส chat view ก่อนหน้า
    this.addCommand({
      id: "focus-previous-chat-view",
      name: "โฟกัส chat view ก่อนหน้า",
      callback: () => {
        this.focusChatView("previous")
      },
    })

    // ✅ เปิด chat view ใหม่
    this.addCommand({
      id: "open-new-chat-view",
      name: "เปิด chat view ใหม่",
      callback: () => {
        void this.openNewChatViewWithAgent(this.settings.defaultAgentId)
      },
    })

    // ✅ ลงทะเบียน agent-specific commands
    this.registerAgentCommands()
    this.registerPermissionCommands()
    this.registerBroadcastCommands()

    // ✅ Floating chat window commands
    this.addCommand({
      id: "open-floating-chat",
      name: "เปิด floating chat window",
      callback: () => {
        if (!this.settings.showFloatingButton) return
        const instances = this.getFloatingChatInstances()
        if (instances.length === 0) {
          this.openNewFloatingChat(true)
        } else if (instances.length === 1) {
          this.expandFloatingChat(instances[0])
        } else {
          const focused = this.viewRegistry.getFocused()
          if (focused && focused.viewType === "floating") {
            focused.expand()
          } else {
            this.expandFloatingChat(instances[instances.length - 1])
          }
        }
      },
    })

    this.addCommand({
      id: "open-new-floating-chat",
      name: "เปิด floating chat window ใหม่",
      callback: () => {
        if (!this.settings.showFloatingButton) return
        this.openNewFloatingChat(true)
      },
    })

    this.addCommand({
      id: "close-floating-chat",
      name: "ปิด floating chat window",
      callback: () => {
        const focused = this.viewRegistry.getFocused()
        if (focused && focused.viewType === "floating") {
          focused.collapse()
        }
      },
    })
  }

  /**
   * ✅ ดึง หรือ สร้าง AcpAdapter สำหรับ view เฉพาะ
   * แต่ละ ChatView มี adapter ของตัวเอง สำหรับ sessions ที่อิสระ
   */
  getOrCreateAdapter(viewId: string): AcpAdapter {
    let adapter = this._adapters.get(viewId)
    if (!adapter) {
      adapter = new AcpAdapter(this)
      this._adapters.set(viewId, adapter)
    }
    return adapter
  }

  /**
   * ✅ ลบและปิด adapter สำหรับ view เฉพาะ
   * เรียกเมื่อ ChatView ถูกปิด
   */
  async removeAdapter(viewId: string): Promise<void> {
    const adapter = this._adapters.get(viewId)
    if (adapter) {
      try {
        await adapter.disconnect()
      } catch (error) {
        console.warn(`[AgentClient] ล้มเหลวในการปิด adapter สำหรับ view ${viewId}:`, error)
      }
      this._adapters.delete(viewId)
    }
  }

  /**
   * ✅ ดึง ChatView ID ที่ใช้ล่าสุด
   */
  get lastActiveChatViewId(): string | null {
    return this.viewRegistry.getFocusedId()
  }

  /**
   * ✅ ตั้ง ChatView ID ที่ใช้ล่าสุด
   */
  setLastActiveChatViewId(viewId: string | null): void {
    if (viewId) {
      this.viewRegistry.setFocused(viewId)
    }
  }

  /**
   * ✅ เปิด chat view
   */
  async activateView() {
    try {
      const { workspace } = this.app

      let leaf: WorkspaceLeaf | null = null
      const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT)

      if (leaves.length > 0) {
        // ✅ ค้นหา leaf ที่ตรงกับ lastActiveChatViewId หรือใช้ leaf แรก
        const focusedId = this.lastActiveChatViewId
        if (focusedId) {
          leaf = leaves.find((l) => (l.view as ChatView)?.viewId === focusedId) || leaves[0]
        } else {
          leaf = leaves[0]
        }
      } else {
        leaf = this.createNewChatLeaf(false)
        if (leaf) {
          await leaf.setViewState({
            type: VIEW_TYPE_CHAT,
            active: true,
          })
        }
      }

      if (leaf) {
        await workspace.revealLeaf(leaf)
        this.focusTextarea(leaf)
      }
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างเปิด view:", error)
      new Notice("[AgentClient] ไม่สามารถเปิด chat view")
    }
  }

  /**
   * ✅ โฟกัส textarea ใน ChatView leaf
   */
  private focusTextarea(leaf: WorkspaceLeaf): void {
    const viewContainerEl = leaf.view?.containerEl
    if (viewContainerEl) {
      window.setTimeout(() => {
        const textarea = viewContainerEl.querySelector("textarea.agent-client-chat-input-textarea")
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus()
        }
      }, 50)
    }
  }

  /**
   * ✅ โฟกัส ChatView ถัดไป หรือ ก่อนหน้า
   */
  private focusChatView(direction: "next" | "previous"): void {
    try {
      if (direction === "next") {
        this.viewRegistry.focusNext()
      } else {
        this.viewRegistry.focusPrevious()
      }
    } catch (error) {
      console.warn("[AgentClient] ข้อผิดพลาดระหว่างโฟกัส chat view:", error)
    }
  }

  /**
   * ✅ สร้าง leaf ใหม่สำหรับ ChatView ตามตั้งค่าตำแหน่ง
   */
  private createNewChatLeaf(isAdditional: boolean): WorkspaceLeaf | null {
    try {
      const { workspace } = this.app
      const location = this.settings.chatViewLocation

      switch (location) {
        case "right-tab":
          if (isAdditional) {
            return this.createSidebarTab("right")
          }
          return workspace.getRightLeaf(false)
        case "right-split":
          return workspace.getRightLeaf(isAdditional)
        case "editor-tab":
          return workspace.getLeaf("tab")
        case "editor-split":
          return workspace.getLeaf("split")
        default:
          return workspace.getRightLeaf(false)
      }
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างสร้าง leaf:", error)
      return null
    }
  }

  /**
   * ✅ สร้างแท็บใหม่ใน sidebar tab group
   */
  private createSidebarTab(side: "right" | "left"): WorkspaceLeaf | null {
    try {
      const { workspace } = this.app
      const split = side === "right" ? workspace.rightSplit : workspace.leftSplit

      // ✅ ค้นหา chat leaf ที่มีอยู่เพื่อดึง tab group
      const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT)
      const sidebarLeaf = existingLeaves.find((leaf) => leaf.getRoot() === split)

      if (sidebarLeaf) {
        const tabGroup = sidebarLeaf.parent
        return workspace.createLeafInParent(
          tabGroup as unknown as WorkspaceSplit,
          Number.MAX_SAFE_INTEGER
        )
      }

      // ✅ Fallback: ไม่มี chat leaf ใน sidebar
      return side === "right" ? workspace.getRightLeaf(false) : workspace.getLeftLeaf(false)
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างสร้าง sidebar tab:", error)
      return null
    }
  }

  /**
   * ✅ เปิด chat view ใหม่พร้อม agent เฉพาะ
   */
  async openNewChatViewWithAgent(agentId: string): Promise<void> {
    try {
      const leaf = this.createNewChatLeaf(true)
      if (!leaf) {
        console.warn("[AgentClient] ล้มเหลวในการสร้าง leaf ใหม่")
        new Notice("[AgentClient] ไม่สามารถสร้าง chat view ใหม่")
        return
      }

      await leaf.setViewState({
        type: VIEW_TYPE_CHAT,
        active: true,
        state: { initialAgentId: agentId },
      })

      await this.app.workspace.revealLeaf(leaf)

      // ✅ โฟกัส textarea หลังเปิด leaf
      const viewContainerEl = leaf.view?.containerEl
      if (viewContainerEl) {
        window.setTimeout(() => {
          const textarea = viewContainerEl.querySelector(
            "textarea.agent-client-chat-input-textarea"
          )
          if (textarea instanceof HTMLTextAreaElement) {
            textarea.focus()
          }
        }, 0)
      }
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างเปิด chat view ใหม่:", error)
      new Notice("[AgentClient] ไม่สามารถเปิด chat view ใหม่")
    }
  }

  /**
   * ✅ เปิด floating chat window ใหม่
   */
  openNewFloatingChat(initialExpanded = false, initialPosition?: { x: number; y: number }): void {
    try {
      const instanceId = String(this.floatingChatCounter++)
      const container = createFloatingChat(this, instanceId, initialExpanded, initialPosition)
      this.floatingChatInstances.set(container.viewId, {
        root: null as unknown as Root,
        container: container.getContainerEl(),
      })
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างสร้าง floating chat:", error)
      new Notice("[AgentClient] ไม่สามารถเปิด floating chat")
    }
  }

  /**
   * ✅ ปิด floating chat window เฉพาะ
   */
  closeFloatingChat(viewId: string): void {
    try {
      const container = this.viewRegistry.get(viewId)
      if (container && container instanceof FloatingViewContainer) {
        container.unmount()
      }
      this.floatingChatInstances.delete(viewId)
    } catch (error) {
      console.warn("[AgentClient] ข้อผิดพลาดระหว่างปิด floating chat:", error)
    }
  }

  /**
   * ✅ ดึง floating chat instance viewIds ทั้งหมด
   */
  getFloatingChatInstances(): string[] {
    return this.viewRegistry.getByType("floating").map((v) => v.viewId)
  }

  /**
   * ✅ ขยาย floating chat window เฉพาะ
   */
  expandFloatingChat(viewId: string): void {
    try {
      window.dispatchEvent(
        new CustomEvent("agent-client:expand-floating-chat", {
          detail: { viewId },
        })
      )
    } catch (error) {
      console.warn("[AgentClient] ข้อผิดพลาดระหว่างขยาย floating chat:", error)
    }
  }

  /**
   * ✅ ดึง agents ที่มีอยู่ทั้งหมด
   */
  getAvailableAgents(): Array<{ id: string; displayName: string }> {
    return [
      {
        id: this.settings.claude.id,
        displayName: this.settings.claude.displayName || this.settings.claude.id,
      },
      {
        id: this.settings.codex.id,
        displayName: this.settings.codex.displayName || this.settings.codex.id,
      },
      {
        id: this.settings.gemini.id,
        displayName: this.settings.gemini.displayName || this.settings.gemini.id,
      },
      ...this.settings.customAgents.map((agent) => ({
        id: agent.id,
        displayName: agent.displayName || agent.id,
      })),
    ]
  }

  /**
   * ✅ เปิด chat view และสลับไปยัง agent ที่ระบุ
   */
  private async openChatWithAgent(agentId: string): Promise<void> {
    try {
      await this.activateView()
      this.app.workspace.trigger("agent-client:new-chat-requested" as "quit", agentId)
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างเปิด chat กับ agent:", error)
    }
  }

  /**
   * ✅ ลงทะเบียน commands สำหรับแต่ละ agent
   */
  private registerAgentCommands(): void {
    const agents = this.getAvailableAgents()

    for (const agent of agents) {
      this.addCommand({
        id: `open-chat-with-${agent.id}`,
        name: `Chat ใหม่กับ ${agent.displayName}`,
        callback: async () => {
          await this.openChatWithAgent(agent.id)
        },
      })
    }
  }

  /**
   * ✅ ลงทะเบียน permission commands
   */
  private registerPermissionCommands(): void {
    this.addCommand({
      id: "approve-active-permission",
      name: "อนุมัติ permission ที่ใช้งาน",
      callback: async () => {
        const focusedId = this.lastActiveChatViewId
        const isFloatingFocused = focusedId?.startsWith("floating-chat-")
        if (!isFloatingFocused) {
          await this.activateView()
        }
        this.app.workspace.trigger(
          "agent-client:approve-active-permission" as "quit",
          this.lastActiveChatViewId
        )
      },
    })

    this.addCommand({
      id: "reject-active-permission",
      name: "ปฏิเสธ permission ที่ใช้งาน",
      callback: async () => {
        const focusedId = this.lastActiveChatViewId
        const isFloatingFocused = focusedId?.startsWith("floating-chat-")
        if (!isFloatingFocused) {
          await this.activateView()
        }
        this.app.workspace.trigger(
          "agent-client:reject-active-permission" as "quit",
          this.lastActiveChatViewId
        )
      },
    })

    this.addCommand({
      id: "toggle-auto-mention",
      name: "สลับ auto-mention",
      callback: async () => {
        const focusedId = this.lastActiveChatViewId
        const isFloatingFocused = focusedId?.startsWith("floating-chat-")
        if (!isFloatingFocused) {
          await this.activateView()
        }
        this.app.workspace.trigger(
          "agent-client:toggle-auto-mention" as "quit",
          this.lastActiveChatViewId
        )
      },
    })

    this.addCommand({
      id: "cancel-current-message",
      name: "ยกเลิกข้อความปัจจุบัน",
      callback: () => {
        this.app.workspace.trigger(
          "agent-client:cancel-message" as "quit",
          this.lastActiveChatViewId
        )
      },
    })
  }

  /**
   * ✅ ลงทะเบียน broadcast commands
   */
  private registerBroadcastCommands(): void {
    this.addCommand({
      id: "broadcast-prompt",
      name: "ส่ง prompt ไปยัง views ทั้งหมด",
      callback: () => {
        this.broadcastPrompt()
      },
    })

    this.addCommand({
      id: "broadcast-send",
      name: "ส่งข้อความไปยัง views ทั้งหมด",
      callback: () => {
        void this.broadcastSend()
      },
    })

    this.addCommand({
      id: "broadcast-cancel",
      name: "ยกเลิกการทำงานใน views ทั้งหมด",
      callback: () => {
        void this.broadcastCancel()
      },
    })
  }

  /**
   * ✅ คัดลอก prompt จาก active view ไปยัง views อื่น
   */
  private broadcastPrompt(): void {
    try {
      const allViews = this.viewRegistry.getAll()
      if (allViews.length === 0) {
        new Notice("[AgentClient] ไม่มี chat views ที่เปิด")
        return
      }

      const inputState = this.viewRegistry.toFocused((v) => v.getInputState())
      if (!inputState || (inputState.text.trim() === "" && inputState.images.length === 0)) {
        new Notice("[AgentClient] ไม่มี prompt ที่จะส่ง")
        return
      }

      const focusedId = this.viewRegistry.getFocusedId()
      const targetViews = allViews.filter((v) => v.viewId !== focusedId)
      if (targetViews.length === 0) {
        new Notice("[AgentClient] ไม่มี chat views อื่นที่จะส่งไปยัง")
        return
      }

      for (const view of targetViews) {
        view.setInputState(inputState)
      }
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่าง broadcast prompt:", error)
    }
  }

  /**
   * ✅ ส่งข้อความใน views ทั้งหมดที่สามารถส่งได้
   */
  private async broadcastSend(): Promise<void> {
    try {
      const allViews = this.viewRegistry.getAll()
      if (allViews.length === 0) {
        new Notice("[AgentClient] ไม่มี chat views ที่เปิด")
        return
      }

      const sendableViews = allViews.filter((v) => v.canSend())
      if (sendableViews.length === 0) {
        new Notice("[AgentClient] ไม่มี views ที่พร้อมส่ง")
        return
      }

      await Promise.allSettled(sendableViews.map((v) => v.sendMessage()))
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่าง broadcast send:", error)
    }
  }

  /**
   * ✅ ยกเลิกการทำงานใน views ทั้งหมด
   */
  private async broadcastCancel(): Promise<void> {
    try {
      const allViews = this.viewRegistry.getAll()
      if (allViews.length === 0) {
        new Notice("[AgentClient] ไม่มี chat views ที่เปิด")
        return
      }

      await Promise.allSettled(allViews.map((v) => v.cancelOperation()))
      new Notice("[AgentClient] ยกเลิกการทำงานใน views ทั้งหมด")
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่าง broadcast cancel:", error)
    }
  }

  async loadSettings() {
    try {
      const rawSettings = ((await this.loadData()) ?? {}) as Record<string, unknown>

      const claudeFromRaw =
        typeof rawSettings.claude === "object" && rawSettings.claude !== null
          ? (rawSettings.claude as Record<string, unknown>)
          : {}
      const codexFromRaw =
        typeof rawSettings.codex === "object" && rawSettings.codex !== null
          ? (rawSettings.codex as Record<string, unknown>)
          : {}
      const geminiFromRaw =
        typeof rawSettings.gemini === "object" && rawSettings.gemini !== null
          ? (rawSettings.gemini as Record<string, unknown>)
          : {}

      const resolvedClaudeArgs = sanitizeArgs(claudeFromRaw.args)
      const resolvedClaudeEnv = normalizeEnvVars(claudeFromRaw.env)
      const resolvedCodexArgs = sanitizeArgs(codexFromRaw.args)
      const resolvedCodexEnv = normalizeEnvVars(codexFromRaw.env)
      const resolvedGeminiArgs = sanitizeArgs(geminiFromRaw.args)
      const resolvedGeminiEnv = normalizeEnvVars(geminiFromRaw.env)
      const customAgents = Array.isArray(rawSettings.customAgents)
        ? ensureUniqueCustomAgentIds(
            rawSettings.customAgents.map((agent: unknown) => {
              const agentObj =
                typeof agent === "object" && agent !== null
                  ? (agent as Record<string, unknown>)
                  : {}
              return normalizeCustomAgent(agentObj)
            })
          )
        : []

      const availableAgentIds = [
        DEFAULT_SETTINGS.claude.id,
        DEFAULT_SETTINGS.codex.id,
        DEFAULT_SETTINGS.gemini.id,
        ...customAgents.map((agent) => agent.id),
      ]

      // ✅ Migration: รองรับทั้ง activeAgentId เก่าและ defaultAgentId ใหม่
      const rawDefaultId =
        typeof rawSettings.defaultAgentId === "string"
          ? rawSettings.defaultAgentId.trim()
          : typeof rawSettings.activeAgentId === "string"
            ? rawSettings.activeAgentId.trim()
            : ""
      const fallbackDefaultId =
        availableAgentIds.find((id) => id.length > 0) || DEFAULT_SETTINGS.claude.id
      const defaultAgentId =
        availableAgentIds.includes(rawDefaultId) && rawDefaultId.length > 0
          ? rawDefaultId
          : fallbackDefaultId

      this.settings = {
        claude: {
          id: DEFAULT_SETTINGS.claude.id,
          displayName:
            typeof claudeFromRaw.displayName === "string" &&
            claudeFromRaw.displayName.trim().length > 0
              ? claudeFromRaw.displayName.trim()
              : DEFAULT_SETTINGS.claude.displayName,
          apiKey:
            typeof claudeFromRaw.apiKey === "string"
              ? claudeFromRaw.apiKey
              : DEFAULT_SETTINGS.claude.apiKey,
          command:
            typeof claudeFromRaw.command === "string" && claudeFromRaw.command.trim().length > 0
              ? claudeFromRaw.command.trim()
              : typeof rawSettings.claudeCodeAcpCommandPath === "string" &&
                  rawSettings.claudeCodeAcpCommandPath.trim().length > 0
                ? rawSettings.claudeCodeAcpCommandPath.trim()
                : DEFAULT_SETTINGS.claude.command,
          args: resolvedClaudeArgs.length > 0 ? resolvedClaudeArgs : [],
          env: resolvedClaudeEnv.length > 0 ? resolvedClaudeEnv : [],
        },
        codex: {
          id: DEFAULT_SETTINGS.codex.id,
          displayName:
            typeof codexFromRaw.displayName === "string" &&
            codexFromRaw.displayName.trim().length > 0
              ? codexFromRaw.displayName.trim()
              : DEFAULT_SETTINGS.codex.displayName,
          apiKey:
            typeof codexFromRaw.apiKey === "string"
              ? codexFromRaw.apiKey
              : DEFAULT_SETTINGS.codex.apiKey,
          command:
            typeof codexFromRaw.command === "string" && codexFromRaw.command.trim().length > 0
              ? codexFromRaw.command.trim()
              : DEFAULT_SETTINGS.codex.command,
          args: resolvedCodexArgs.length > 0 ? resolvedCodexArgs : [],
          env: resolvedCodexEnv.length > 0 ? resolvedCodexEnv : [],
        },
        gemini: {
          id: DEFAULT_SETTINGS.gemini.id,
          displayName:
            typeof geminiFromRaw.displayName === "string" &&
            geminiFromRaw.displayName.trim().length > 0
              ? geminiFromRaw.displayName.trim()
              : DEFAULT_SETTINGS.gemini.displayName,
          apiKey:
            typeof geminiFromRaw.apiKey === "string"
              ? geminiFromRaw.apiKey
              : DEFAULT_SETTINGS.gemini.apiKey,
          command:
            typeof geminiFromRaw.command === "string" && geminiFromRaw.command.trim().length > 0
              ? geminiFromRaw.command.trim()
              : typeof rawSettings.geminiCommandPath === "string" &&
                  rawSettings.geminiCommandPath.trim().length > 0
                ? rawSettings.geminiCommandPath.trim()
                : DEFAULT_SETTINGS.gemini.command,
          args: resolvedGeminiArgs.length > 0 ? resolvedGeminiArgs : DEFAULT_SETTINGS.gemini.args,
          env: resolvedGeminiEnv.length > 0 ? resolvedGeminiEnv : [],
        },
        customAgents: customAgents,
        defaultAgentId,
        autoAllowPermissions:
          typeof rawSettings.autoAllowPermissions === "boolean"
            ? rawSettings.autoAllowPermissions
            : DEFAULT_SETTINGS.autoAllowPermissions,
        autoMentionActiveNote:
          typeof rawSettings.autoMentionActiveNote === "boolean"
            ? rawSettings.autoMentionActiveNote
            : DEFAULT_SETTINGS.autoMentionActiveNote,
        debugMode:
          typeof rawSettings.debugMode === "boolean"
            ? rawSettings.debugMode
            : DEFAULT_SETTINGS.debugMode,
        nodePath:
          typeof rawSettings.nodePath === "string"
            ? rawSettings.nodePath.trim()
            : DEFAULT_SETTINGS.nodePath,
        exportSettings: (() => {
          const rawExport = rawSettings.exportSettings as Record<string, unknown> | null | undefined
          if (rawExport && typeof rawExport === "object") {
            return {
              defaultFolder:
                typeof rawExport.defaultFolder === "string"
                  ? rawExport.defaultFolder
                  : DEFAULT_SETTINGS.exportSettings.defaultFolder,
              filenameTemplate:
                typeof rawExport.filenameTemplate === "string"
                  ? rawExport.filenameTemplate
                  : DEFAULT_SETTINGS.exportSettings.filenameTemplate,
              autoExportOnNewChat:
                typeof rawExport.autoExportOnNewChat === "boolean"
                  ? rawExport.autoExportOnNewChat
                  : DEFAULT_SETTINGS.exportSettings.autoExportOnNewChat,
              autoExportOnCloseChat:
                typeof rawExport.autoExportOnCloseChat === "boolean"
                  ? rawExport.autoExportOnCloseChat
                  : DEFAULT_SETTINGS.exportSettings.autoExportOnCloseChat,
              openFileAfterExport:
                typeof rawExport.openFileAfterExport === "boolean"
                  ? rawExport.openFileAfterExport
                  : DEFAULT_SETTINGS.exportSettings.openFileAfterExport,
              includeImages:
                typeof rawExport.includeImages === "boolean"
                  ? rawExport.includeImages
                  : DEFAULT_SETTINGS.exportSettings.includeImages,
              imageLocation:
                rawExport.imageLocation === "obsidian" ||
                rawExport.imageLocation === "custom" ||
                rawExport.imageLocation === "base64"
                  ? rawExport.imageLocation
                  : DEFAULT_SETTINGS.exportSettings.imageLocation,
              imageCustomFolder:
                typeof rawExport.imageCustomFolder === "string"
                  ? rawExport.imageCustomFolder
                  : DEFAULT_SETTINGS.exportSettings.imageCustomFolder,
              frontmatterTag:
                typeof rawExport.frontmatterTag === "string"
                  ? rawExport.frontmatterTag
                  : DEFAULT_SETTINGS.exportSettings.frontmatterTag,
            }
          }
          return DEFAULT_SETTINGS.exportSettings
        })(),
        windowsWslMode:
          typeof rawSettings.windowsWslMode === "boolean"
            ? rawSettings.windowsWslMode
            : DEFAULT_SETTINGS.windowsWslMode,
        windowsWslDistribution:
          typeof rawSettings.windowsWslDistribution === "string"
            ? rawSettings.windowsWslDistribution
            : DEFAULT_SETTINGS.windowsWslDistribution,
        sendMessageShortcut:
          rawSettings.sendMessageShortcut === "enter" ||
          rawSettings.sendMessageShortcut === "cmd-enter"
            ? rawSettings.sendMessageShortcut
            : DEFAULT_SETTINGS.sendMessageShortcut,
        chatViewLocation:
          rawSettings.chatViewLocation === "right-tab" ||
          rawSettings.chatViewLocation === "right-split" ||
          rawSettings.chatViewLocation === "editor-tab" ||
          rawSettings.chatViewLocation === "editor-split"
            ? rawSettings.chatViewLocation
            : DEFAULT_SETTINGS.chatViewLocation,
        displaySettings: (() => {
          const rawDisplay = rawSettings.displaySettings as
            | Record<string, unknown>
            | null
            | undefined
          if (rawDisplay && typeof rawDisplay === "object") {
            return {
              autoCollapseDiffs:
                typeof rawDisplay.autoCollapseDiffs === "boolean"
                  ? rawDisplay.autoCollapseDiffs
                  : DEFAULT_SETTINGS.displaySettings.autoCollapseDiffs,
              diffCollapseThreshold:
                typeof rawDisplay.diffCollapseThreshold === "number" &&
                rawDisplay.diffCollapseThreshold > 0
                  ? rawDisplay.diffCollapseThreshold
                  : DEFAULT_SETTINGS.displaySettings.diffCollapseThreshold,
              maxNoteLength:
                typeof rawDisplay.maxNoteLength === "number" && rawDisplay.maxNoteLength >= 1
                  ? rawDisplay.maxNoteLength
                  : DEFAULT_SETTINGS.displaySettings.maxNoteLength,
              maxSelectionLength:
                typeof rawDisplay.maxSelectionLength === "number" &&
                rawDisplay.maxSelectionLength >= 1
                  ? rawDisplay.maxSelectionLength
                  : DEFAULT_SETTINGS.displaySettings.maxSelectionLength,
              showEmojis:
                typeof rawDisplay.showEmojis === "boolean"
                  ? rawDisplay.showEmojis
                  : DEFAULT_SETTINGS.displaySettings.showEmojis,
              fontSize: parseChatFontSize(rawDisplay.fontSize),
            }
          }
          return DEFAULT_SETTINGS.displaySettings
        })(),
        savedSessions: Array.isArray(rawSettings.savedSessions)
          ? (rawSettings.savedSessions as SavedSessionInfo[])
          : DEFAULT_SETTINGS.savedSessions,
        lastUsedModels: (() => {
          const raw = rawSettings.lastUsedModels
          if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const result: Record<string, string> = {}
            for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
              if (
                typeof key === "string" &&
                key.length > 0 &&
                typeof value === "string" &&
                value.length > 0
              ) {
                result[key] = value
              }
            }
            return result
          }
          return DEFAULT_SETTINGS.lastUsedModels
        })(),
        showFloatingButton:
          typeof rawSettings.showFloatingButton === "boolean"
            ? rawSettings.showFloatingButton
            : DEFAULT_SETTINGS.showFloatingButton,
        floatingButtonImage:
          typeof rawSettings.floatingButtonImage === "string"
            ? rawSettings.floatingButtonImage
            : DEFAULT_SETTINGS.floatingButtonImage,
        floatingWindowSize: (() => {
          const raw = rawSettings.floatingWindowSize as
            | { width?: number; height?: number }
            | null
            | undefined
          if (
            raw &&
            typeof raw === "object" &&
            typeof raw.width === "number" &&
            typeof raw.height === "number"
          ) {
            return { width: raw.width, height: raw.height }
          }
          return DEFAULT_SETTINGS.floatingWindowSize
        })(),
        floatingWindowPosition: (() => {
          const raw = rawSettings.floatingWindowPosition as
            | { x?: number; y?: number }
            | null
            | undefined
          if (
            raw &&
            typeof raw === "object" &&
            typeof raw.x === "number" &&
            typeof raw.y === "number"
          ) {
            return { x: raw.x, y: raw.y }
          }
          return null
        })(),
        floatingButtonPosition: (() => {
          const raw = rawSettings.floatingButtonPosition as
            | { x?: number; y?: number }
            | null
            | undefined
          if (
            raw &&
            typeof raw === "object" &&
            typeof raw.x === "number" &&
            typeof raw.y === "number"
          ) {
            return { x: raw.x, y: raw.y }
          }
          return null
        })(),
      }

      this.ensureDefaultAgentId()
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างโหลด settings:", error)
      this.settings = DEFAULT_SETTINGS
    }
  }

  async saveSettings() {
    try {
      await this.saveData(this.settings)
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างบันทึก settings:", error)
      new Notice("[AgentClient] ไม่สามารถบันทึก settings")
    }
  }

  async saveSettingsAndNotify(nextSettings: AgentClientPluginSettings) {
    try {
      this.settings = nextSettings
      await this.saveData(this.settings)
      this.settingsStore.set(this.settings)
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างบันทึก settings และแจ้งเตือน:", error)
      new Notice("[AgentClient] ไม่สามารถบันทึก settings")
    }
  }

  /**
   * ✅ ดึงเวอร์ชัน stable ล่าสุดจาก GitHub
   */
  private async fetchLatestStable(): Promise<string | null> {
    try {
      const response = await requestUrl({
        url: "https://api.github.com/repos/RAIT-09/obsidian-agent-client/releases/latest",
      })
      const data = response.json as { tag_name?: string }
      return data.tag_name ? semver.clean(data.tag_name) : null
    } catch (error) {
      console.warn("[AgentClient] ข้อผิดพลาดระหว่างดึง stable release:", error)
      return null
    }
  }

  /**
   * ✅ ดึงเวอร์ชัน prerelease ล่าสุดจาก GitHub
   */
  private async fetchLatestPrerelease(): Promise<string | null> {
    try {
      const response = await requestUrl({
        url: "https://api.github.com/repos/RAIT-09/obsidian-agent-client/releases",
      })
      const releases = response.json as Array<{
        tag_name: string
        prerelease: boolean
      }>

      // ✅ ค้นหา prerelease แรก (releases เรียงตามวันที่ลดลง)
      const latestPrerelease = releases.find((r) => r.prerelease)
      return latestPrerelease ? semver.clean(latestPrerelease.tag_name) : null
    } catch (error) {
      console.warn("[AgentClient] ข้อผิดพลาดระหว่างดึง prerelease:", error)
      return null
    }
  }

  /**
   * ✅ ตรวจสอบการอัปเดต plugin
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      const currentVersion = semver.clean(this.manifest.version) || this.manifest.version
      const isCurrentPrerelease = semver.prerelease(currentVersion) !== null

      if (isCurrentPrerelease) {
        // ✅ ผู้ใช้ prerelease: ตรวจสอบทั้ง stable และ prerelease
        const [latestStable, latestPrerelease] = await Promise.all([
          this.fetchLatestStable(),
          this.fetchLatestPrerelease(),
        ])

        const hasNewerStable = latestStable && semver.gt(latestStable, currentVersion)
        const hasNewerPrerelease = latestPrerelease && semver.gt(latestPrerelease, currentVersion)

        if (hasNewerStable || hasNewerPrerelease) {
          // ✅ ให้ความสำคัญกับการแจ้งเตือน stable version
          const newestVersion = hasNewerStable ? latestStable : latestPrerelease
          new Notice(`[AgentClient] มีการอัปเดต: v${newestVersion}`)
          return true
        }
      } else {
        // ✅ ผู้ใช้ stable version: ตรวจสอบ stable เท่านั้น
        const latestStable = await this.fetchLatestStable()
        if (latestStable && semver.gt(latestStable, currentVersion)) {
          new Notice(`[AgentClient] มีการอัปเดต: v${latestStable}`)
          return true
        }
      }

      return false
    } catch (error) {
      console.error("[AgentClient] ข้อผิดพลาดระหว่างตรวจสอบการอัปเดต:", error)
      return false
    }
  }

  /**
   * ✅ ตรวจสอบและตั้ง default agent ID
   */
  ensureDefaultAgentId(): void {
    const availableIds = this.collectAvailableAgentIds()
    if (availableIds.length === 0) {
      this.settings.defaultAgentId = DEFAULT_SETTINGS.claude.id
      return
    }
    if (!availableIds.includes(this.settings.defaultAgentId)) {
      this.settings.defaultAgentId = availableIds[0]
    }
  }

  /**
   * ✅ รวบรวม agent IDs ที่มีอยู่
   */
  private collectAvailableAgentIds(): string[] {
    const ids = new Set<string>()
    ids.add(this.settings.claude.id)
    ids.add(this.settings.codex.id)
    ids.add(this.settings.gemini.id)
    for (const agent of this.settings.customAgents) {
      if (agent.id && agent.id.length > 0) {
        ids.add(agent.id)
      }
    }
    return Array.from(ids)
  }
}
