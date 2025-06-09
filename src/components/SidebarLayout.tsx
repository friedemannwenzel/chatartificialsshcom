"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

type SidebarState = "open" | "collapsed" | "hover";

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("open");
  const [isHovering, setIsHovering] = useState(false);

  // Handle mouse position for left edge hover
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarState === "collapsed") {
        const isNearLeftEdge = e.clientX <= 30; // 20px from left edge
        
        if (isNearLeftEdge && !isHovering) {
          setIsHovering(true);
        } else if (!isNearLeftEdge && isHovering) {
          // Add a small delay before hiding to prevent flickering
          setTimeout(() => {
            if (e.clientX > 320) { // Beyond sidebar width
              setIsHovering(false);
            }
          }, 100);
        }
      }
    };

    if (sidebarState === "collapsed") {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [sidebarState, isHovering]);

  const toggleSidebar = () => {
    if (sidebarState === "open") {
      setSidebarState("collapsed");
      setIsHovering(false);
    } else {
      setSidebarState("open");
      setIsHovering(false);
    }
  };

  // Determine if sidebar should be visible
  const shouldShowSidebar = sidebarState === "open" || (sidebarState === "collapsed" && isHovering);
  const isFloating = sidebarState === "collapsed" && isHovering;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        state={sidebarState}
        isHovering={isHovering}
        isVisible={shouldShowSidebar}
        isFloating={isFloating}
        onToggle={toggleSidebar}
        onClose={() => setIsHovering(false)}
      />
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${
        sidebarState === "open" ? "ml-0" : "ml-0"
      }`}>
        {children}
      </main>
    </div>
  );
} 