"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

type SidebarState = "open" | "collapsed";

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("open");

  const toggleSidebar = () => {
    if (sidebarState === "open") {
      setSidebarState("collapsed");
    } else {
      setSidebarState("open");
    }
  };

  // Determine if sidebar should be visible
  const shouldShowSidebar = sidebarState === "open";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        state={sidebarState}
        isVisible={shouldShowSidebar}
        onToggle={toggleSidebar}
      />
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${
        sidebarState === "open" ? "ml-0" : "ml-0"
      }`}>
        {children}
      </main>
    </div>
  );
} 