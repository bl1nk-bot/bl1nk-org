import { create } from "zustand"

type Theme = "light" | "dark" | "system"

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  terminalExpanded: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  toggleTerminal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  terminalExpanded: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTerminal: () => set((state) => ({ terminalExpanded: !state.terminalExpanded })),
}))
