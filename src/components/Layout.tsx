import React, { useRef, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ControlBar } from "./ControlBar";
import { ReaderSurface } from "./ReaderSurface";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Layout: React.FC = () => {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleScroll = () => {
    if (mainRef.current) {
      // Show sticky title when scrolled past 100px
      setShowStickyTitle(mainRef.current.scrollTop > 100);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      <Header showStickyTitle={showStickyTitle} />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 flex flex-col min-w-0">
          <main
            ref={mainRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto relative bg-white scroll-smooth scrollbar-hide"
          >
            <ReaderSurface sidebarCollapsed={sidebarCollapsed} />
          </main>
          <ControlBar />
        </div>

        {/* Toggle button and sidebar container */}
        <div className="relative h-full">
          {/* Toggle button positioned relative to the sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-8 top-4 z-20 bg-white rounded-l-lg shadow-md p-2 hover:bg-slate-50 border border-slate-200 transition-all duration-200 flex items-center justify-center"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Sidebar with conditional width - this doesn't affect the main content margins */}
          <div className={`${sidebarCollapsed ? "w-12" : "w-80"} h-full transition-all duration-300 ease-in-out`}>
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
        </div>
      </div>
    </div>
  );
};
