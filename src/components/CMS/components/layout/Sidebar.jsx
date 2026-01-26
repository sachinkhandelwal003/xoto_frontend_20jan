// components/layout/Sidebar.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { useCmsContext } from '../../contexts/CmsContext'; 
import { FiX, FiChevronDown } from 'react-icons/fi';
import { useFreelancer } from '../../../../../src/context/FreelancerContext';

// IMPORT BOTH SEPARATE IMAGES HERE
import logoNew from '../../../../assets/img/logoNew.png'; 
import favicon from '../../../../assets/img/logonewww.png'; 

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '5': 'vendor-b2c', '6': 'vendor-b2b', '7': 'freelancer',
  '11': 'accountant', '12': 'supervisor',
};

const ROLE_MODULE_ORDER = {
  '0': ['Dashboard',"All Estimation","Deals", 'Xoto Partners' ,'Projects','Packages','Estimate master','Consultation Bookings','All Users', 'Products', 'Seller B2C','Request', 'Payout', 'Module', 'Permission', 'Role', 'Inventory','Settings'],
  '1': ['Dashboard', 'Products', 'Xoto Partners', 'Projects', 'Payout', 'Request', 'Settings'],
  '5': ['Dashboard', 'Products', 'My Products', 'Orders', 'Payout', 'Settings'],
  '6': ['Dashboard', 'Products', 'Projects', 'Inventory', 'Payout'],
  '7': ['Dashboard', 'My Projects', 'All Projects', 'Add Projects', 'Payout'],
  '11': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
  '12': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
};

const Sidebar = () => {
  // --- 1. HOOKS (Must always be at the top) ---
  const { 
    sidebarCollapsed, 
    mobileSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarCollapsed
  } = useCmsContext();

  const location = useLocation();
  const { freelancer } = useFreelancer();
  const { user, token, permissions } = useSelector((s) => s.auth);
  const [openModule, setOpenModule] = useState(null);
  const sidebarRef = useRef(null);

  // --- 2. EFFECTS ---
  useEffect(() => {
    if (!mobileSidebarCollapsed) {
      setMobileSidebarCollapsed(true); 
    }
  }, [location.pathname, setMobileSidebarCollapsed]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!mobileSidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileSidebarCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [mobileSidebarCollapsed, setMobileSidebarCollapsed]);

  // --- 3. PRE-CALCULATIONS (Safe for hooks) ---
  // We use optional chaining here so these don't crash when user is null during logout
  const roleCode = user?.role?.code?.toString() || '0';
  const roleSlug = roleSlugMap[roleCode] ?? 'dashboard';
  const basePath = `/dashboard/${roleSlug}`;
  const isFreelancer = roleCode === '7';
  const isPendingApproval = isFreelancer && freelancer && freelancer.status_info?.status !== 1;

  const navTree = useMemo(() => {
    // If no user, return empty tree but keep the hook active
    if (!user || !token) return [];

    const tree = [{ title: 'Dashboard', icon: 'fas fa-home', to: basePath, exact: true, submenus: [] }];
    if (isPendingApproval) return tree;

    const modulesMap = {};
    Object.entries(permissions ?? {}).forEach(([key, p]) => {
      if (!p?.canView || !p?.route) return;
      const [module, sub] = key.split('→').map(s => s.trim());
      const fullPath = `${basePath}/${p.route.replace(/^\/+/, '')}`;
      if (!modulesMap[module]) {
        modulesMap[module] = { title: module, icon: p.icon || 'fas fa-cube', to: null, submenus: [] };
      }
      if (!sub) modulesMap[module].to = fullPath;
      else modulesMap[module].submenus.push({ title: sub, to: fullPath, icon: p.icon || 'fas fa-circle' });
    });

    const ordered = [];
    const customOrder = ROLE_MODULE_ORDER[roleCode] || [];
    customOrder.forEach(t => { 
      if (modulesMap[t]) { 
        ordered.push(modulesMap[t]); 
        delete modulesMap[t]; 
      } 
    });
    ordered.push(...Object.values(modulesMap));
    return [...tree, ...ordered];
  }, [permissions, basePath, isPendingApproval, roleCode, user, token]);

  // --- 4. EARLY RETURN (Only after all Hooks!) ---
  if (!user || !token) return null;

  // --- 5. EVENT HANDLERS ---
  const toggleModule = (mod) => setOpenModule(openModule === mod ? null : mod);
  const isParentActive = (item) => item.submenus.some(s => location.pathname.startsWith(s.to));
  const handleNavClick = () => !mobileSidebarCollapsed && setMobileSidebarCollapsed(true);

  const mobileOpen = !mobileSidebarCollapsed;
  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 flex flex-col
    bg-gradient-to-b from-[#1a0b2e] via-[#2a1247] to-[#14051f]
    border-r border-purple-800/40 shadow-2xl
    transition-all duration-300 ease-in-out overflow-hidden
    ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebarCollapsed(true)} />
      )}

      <aside ref={sidebarRef} className={sidebarClasses}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* Header Section */}
        <div className={`flex items-center p-4 border-b border-purple-800/50 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col items-center flex-shrink-0">
              <img 
                src={sidebarCollapsed ? favicon : logoNew} 
                alt="Logo" 
                className={`transition-all duration-300 ${sidebarCollapsed ? 'h-8 w-8' : 'h-10 sm:h-12 lg:h-14 w-auto'}`} 
              />
              {!sidebarCollapsed && (
                <span className="text-white text-[8px] sm:text-[10px] whitespace-nowrap mt-1">
                  Powered by AI. Inspired by you.
                </span>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-purple-300/80">Welcome</div>
                <div className="text-sm font-bold text-purple-200">{user.role?.name || 'User'}</div>
              </div>
            )}
          </div>

          {mobileOpen && (
            <button onClick={toggleMobileSidebar} className="p-2 text-purple-300 hover:text-white lg:hidden">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navTree.map((item) => {
            const hasSub = item.submenus.length > 0;
            const active = location.pathname === item.to || (hasSub && isParentActive(item));
            const expanded = openModule === item.title;

            return (
              <div key={item.title}>
                {!hasSub ? (
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    title={sidebarCollapsed ? item.title : ""}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-purple-600/50 text-white shadow-lg' : 'text-purple-300 hover:bg-purple-800/30'}
                      ${sidebarCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <i className={`${item.icon} w-5 text-center`} />
                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleModule(item.title)}
                      title={sidebarCollapsed ? item.title : ""}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                        ${active || expanded ? 'text-white bg-purple-800/30' : 'text-purple-300 hover:bg-purple-800/20'}
                        ${sidebarCollapsed ? 'justify-center px-0' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`${item.icon} w-5 text-center`} />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>
                      {!sidebarCollapsed && <FiChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                    </button>
                    {expanded && !sidebarCollapsed && (
                      <div className="mt-1 ml-8 space-y-1 border-l border-purple-700/30 pl-4">
                        {item.submenus.map(sub => (
                          <NavLink key={sub.to} to={sub.to} onClick={handleNavClick}
                            className={({ isActive }) => `block py-2 px-3 rounded-lg text-sm ${isActive ? 'text-purple-100' : 'text-purple-300 hover:text-white'}`}
                          >
                            {sub.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/40 text-center text-xs text-purple-400">
          {!sidebarCollapsed ? <span>v2.0.0</span> : <span title="Version 2.0.0">v2</span>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;