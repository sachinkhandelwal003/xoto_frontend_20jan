import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DeveloperSidebar from "./DeveloperSidebar";

const DeveloperLayout = () => {
  const [mobileSidebarCollapsed, setMobileSidebarCollapsed] = useState(true);
  const [sidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarCollapsed((p) => !p);

  return (
    <div className="min-h-screen bg-gray-50">
      <DeveloperSidebar
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarCollapsed={mobileSidebarCollapsed}
        toggleMobileSidebar={toggleMobileSidebar}
        setMobileSidebarCollapsed={setMobileSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default DeveloperLayout;
