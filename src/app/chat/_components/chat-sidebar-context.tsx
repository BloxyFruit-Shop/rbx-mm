"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatSidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(undefined);

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ChatSidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const context = useContext(ChatSidebarContext);
  if (context === undefined) {
    throw new Error("useChatSidebar must be used within a ChatSidebarProvider");
  }
  return context;
}