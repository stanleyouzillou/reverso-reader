import React, { useRef, useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ControlBar } from "./ControlBar";
import { ReaderSurface } from "./ReaderSurface";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingToolbar } from "./FloatingToolbar";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";

export const Layout: React.FC = () => {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useStore((state) => state.setSidebarCollapsed);
  const mainRef = useRef<HTMLElement>(null);
  const theme = useReaderSettings((state) => state.theme);

  // Sync dark mode with document root
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleScroll = () => {
    if (mainRef.current) {
      // Show sticky title when scrolled past 100px
      setShowStickyTitle(mainRef.current.scrollTop > 100);
    }
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300",
        theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
      )}
    >
      <Header showStickyTitle={showStickyTitle} />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 flex flex-col min-w-0">
          <main
            ref={mainRef}
            onScroll={handleScroll}
            className={cn(
              "flex-1 overflow-y-auto relative scroll-smooth scrollbar-hide transition-colors duration-300",
              theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
            )}
          >
            <ReaderSurface sidebarCollapsed={sidebarCollapsed} />
          </main>
          <ControlBar />
        </div>

        <FloatingToolbar sidebarCollapsed={sidebarCollapsed} />

        {/* Sidebar container */}
        <div className="relative h-full">
          {/* Sidebar with conditional width */}
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              sidebarCollapsed ? "w-[3rem]" : "w-[min(20rem,80vw)]",
              // Media queries for extreme zoom / small screens
              !sidebarCollapsed &&
                "max-md:fixed max-md:inset-0 max-md:z-[60] max-md:w-full"
            )}
          >
            <Sidebar 
              collapsed={sidebarCollapsed} 
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Backdrop for mobile/extreme zoom sidebar */}
          {!sidebarCollapsed && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
