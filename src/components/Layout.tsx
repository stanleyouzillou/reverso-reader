import React, { useRef, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ControlBar } from "./ControlBar";
import { ReaderSurface } from "./ReaderSurface";

export const Layout: React.FC = () => {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
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
            <ReaderSurface />
          </main>
          <ControlBar />
        </div>
        <Sidebar />
      </div>
    </div>
  );
};
