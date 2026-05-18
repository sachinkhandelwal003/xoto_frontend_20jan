// components/layout/CmsLayout.js
import React from "react";
import { CmsProvider, useCmsContext } from "../../contexts/CmsContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BackToTop from "./BackToTop";

const CmsLayoutContent = ({ children }) => {
  const { sidebarCollapsed, mobileSidebarOpen } = useCmsContext();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <Topbar />

        <main className={`flex-1 overflow-y-auto pt-16 pb-6 bg-gray-300 transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="max-w-full px-4 py-6 sm:px-6 lg:px-8 mx-auto w-full">
              {children}
           
          </div>
          <BackToTop />
        </main>
      </div>
    </div>
  );
};

const CmsLayout = ({ children }) => (
   <CmsProvider>
    <CmsLayoutContent>{children}</CmsLayoutContent>
  </CmsProvider>
);

export default CmsLayout;