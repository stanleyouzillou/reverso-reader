import React, { useRef, useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ControlBar } from "./ControlBar";
import { ReaderSurface } from "./ReaderSurface";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingToolbar } from "./FloatingToolbar";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { cn } from "../lib/utils";

export const Layout: React.FC = () => {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { theme } = useReaderSettings();

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

        {/* Toggle button and sidebar container */}
        <div className="relative h-full">
          {/* Toggle button positioned relative to the sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-8 top-4 z-20 bg-white rounded-l-lg shadow-md p-2 hover:bg-slate-50 border border-slate-200 transition-all duration-200 flex items-center justify-center"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Sidebar with conditional width - this doesn't affect the main content margins */}
          <div
            className={`${
              sidebarCollapsed ? "w-12" : "w-80"
            } h-full transition-all duration-300 ease-in-out`}
          >
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
        </div>
      </div>
    </div>
  );
};
