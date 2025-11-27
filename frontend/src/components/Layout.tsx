import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Main Layout Component
 * Contains Sidebar and Header for authenticated pages
 */
export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarWidth = useMemo(() => (isSidebarCollapsed ? 80 : 256), [isSidebarCollapsed]);

  return (
    <div className="relative min-h-screen bg-app transition-colors duration-300 ease-in-out">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className="flex min-h-screen flex-col transition-[padding-left] duration-300 ease-in-out"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <Header />

        <main className="flex-1 overflow-auto p-6 md:p-8 transition-colors duration-300 ease-in-out">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
