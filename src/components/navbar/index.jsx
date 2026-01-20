"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes, FaTachometerAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logoNew from "../../assets/img/logonew2.png";
import { ChevronDown, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

// REDUX IMPORTS
import { useDispatch, useSelector } from "react-redux";
// Adjust this path to match your project structure
import { logoutUser } from "../../manageApi/store/authSlice"; 

/* ------------------- LANGUAGE DATA ------------------- */
export const languages = [
  { code: "en", name: "EN", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#012169" /></svg>) },
  { code: "hi", name: "HI", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="5" fill="#FF9933"/><rect y="5" width="20" height="5" fill="#FFF"/><rect y="10" width="20" height="5" fill="#138808"/></svg>) },
  { code: "ar", name: "AR", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#007A3D"/></svg>) },
  { code: "ru", name: "RU", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="5" fill="#FFF"/><rect y="5" width="20" height="5" fill="#0039A6"/><rect y="10" width="20" height="5" fill="#D52B1E"/></svg>) },
  { code: "zh", name: "ZH", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#EE1C25"/></svg>) },
  { code: "fa", name: "FA", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="5" fill="#239F40"/><rect y="5" width="20" height="5" fill="#FFF"/><rect y="10" width="20" height="5" fill="#DA0000"/></svg>) },
  { code: "tr", name: "TR", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#E30A17"/></svg>) },
  { code: "es", name: "ES", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#AA151B"/></svg>) },
  { code: "pa", name: "PA", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="5" fill="#FF9933"/><rect y="5" width="20" height="5" fill="#FFF"/><rect y="10" width="20" height="5" fill="#138808"/></svg>) },
  { code: "fr", name: "FR", Flag: () => (<svg viewBox="0 0 20 15"><rect width="6.67" height="15" fill="#002395"/><rect x="6.67" width="6.66" height="15" fill="#FFF"/><rect x="13.33" width="6.67" height="15" fill="#ED2939"/></svg>) },
  { code: "de", name: "DE", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="5" fill="#000"/><rect y="5" width="20" height="5" fill="#DD0000"/><rect y="10" width="20" height="5" fill="#FFCE00"/></svg>) },
  { code: "tl", name: "TL", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="7.5" fill="#0038A8"/><rect y="7.5" width="20" height="7.5" fill="#CE1126"/></svg>) },
  { code: "ur", name: "UR", Flag: () => (<svg viewBox="0 0 20 15"><rect width="20" height="15" fill="#01411C"/></svg>) },
];

/* ------------------- NAV ITEMS ------------------- */
const navItems = [
  { key: "home", path: "/" },
  {
    key: "homeUpgrade",
    children: [
      { key: "landscaping", path: "/landscaping" },
      { key: "interiors", path: "/services/interior" },
    ],
  },
  {
    key: "homeOwnership",
    children: [
      { key: "mortgages", path: "/mortgage/services" },
      { key: "properties", path: "/marketplace" },
    ],
  },
  { key: "store", path: "/ecommerce/b2c" },
  {   
    key: "knowledgeHub",
    children: [
      { key: "blogs", path: "/explore" },
      { key: "caseStudies", path: "/case-studies" },
      { key: "training", path: "/training" },
    ],
  },
  { key: "ecosystem", path: "/ecosystem" },
  { key: "about", path: "/about" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // GET USER FROM REDUX
  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // NEW STATES FOR LOGIN DROPDOWN
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const langRef = useRef(null);
  const userMenuRef = useRef(null);
  const loginMenuRef = useRef(null); // Ref for login dropdown

  // Helper to determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user?.role?.name) return "/dashboard";
    const role = user.role.name.toLowerCase();
    
    if (role === 'customer') return '/dashboard/customer';
    if (role === 'admin' || role === 'superadmin') return '/dashboard/superadmin';
    if (role.includes('vendor')) return '/dashboard/vendor-b2b';
    return '/dashboard';
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const current = languages.find(l => l.code === i18n.language);
    if (current) setSelectedLang(current);
  }, [i18n.language]);

  // Click outside handler
  useEffect(() => {
    const close = e => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (loginMenuRef.current && !loginMenuRef.current.contains(e.target)) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-[1440px] mx-auto px-6 py-1">

        {/* TOP BAR */}
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex flex-col">
            <img src={logoNew} alt="Logo" className="h-15" />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden xl:flex items-center gap-1 text-sm">
            {navItems.map(item =>
              item.children ? (
                <div key={item.key} className="relative group h-full flex items-center">
                  <button className="px-3 py-2 flex items-center gap-1 font-medium text-gray-700 hover:text-[#5C039B] transition-colors">
                    {t(`nav.${item.key}`)}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  
                  {/* Dropdown with invisible buffer */}
                  <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
                    <div className="bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden">
                      {item.children.map(child => (
                        <Link
                          key={child.key}
                          to={child.path}
                          className="block px-4 py-3 hover:bg-purple-50 text-gray-600 hover:text-[#5C039B] transition-colors border-b border-gray-50 last:border-none"
                        >
                          {t(`nav.${child.key}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.key} to={item.path} className="px-3 py-2 font-medium text-gray-700 hover:text-[#5C039B] transition-colors">
                  {t(`nav.${item.key}`)}
                </Link>
              )
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* LANGUAGE SELECTOR (Visible on Mobile & Desktop) */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 border px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-4 h-3">
                  <selectedLang.Flag />
                </div>
                {/* Hide text on very small screens if needed, otherwise show */}
                <span className="text-sm font-medium">{selectedLang.name}</span>
                <ChevronDown size={12} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded border border-gray-100 z-50 w-40 overflow-y-auto">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 w-full text-left transition-colors"
                    >
                      <div className="w-4 h-3">
                        <lang.Flag />
                      </div>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CONTACT BUTTON (Hidden on Mobile) */}
            <Link to="/contact" className="hidden lg:block">
              <button className="px-4 py-2 bg-[#5C039B] text-white rounded-lg hover:bg-[#4a027c] transition-colors font-medium">
                {t("nav.contact")}
              </button>
            </Link>

            {/* AUTH SECTION (Hidden on Mobile) */}
            <div className="hidden lg:block">
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5C039B] text-white flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-bold text-gray-800 leading-none">{user.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500 uppercase">{user.role?.name || "User"}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaTachometerAlt size={16} className="text-[#5C039B]" /> Dashboard
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut size={16} /> {"Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* LOGIN DROPDOWN (Desktop) */
                <div ref={loginMenuRef} className="relative">
                  <button 
                    onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                    className="px-4 py-2 border border-[#5C039B] text-[#5C039B] hover:bg-[#5C039B] hover:text-white rounded-lg transition-all font-medium flex items-center gap-2"
                  >
                    {t("nav.login")}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${loginMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {loginMenuOpen && (
                     <div className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <Link 
                          to="/user/login" 
                          onClick={() => setLoginMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5C039B] transition-colors"
                        >
                          Customer
                        </Link>
                        <Link 
                          to="/login" 
                          onClick={() => setLoginMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5C039B] transition-colors"
                        >
                          Partners
                        </Link>
                     </div>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE (HAMBURGER) */}
            <button
              className="xl:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="xl:hidden border-t py-4 space-y-3 animate-in fade-in slide-in-from-top-5 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navItems.map(item =>
              item.children ? (
                <div key={item.key}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                    className="flex justify-between w-full py-2 px-2 text-gray-700 font-medium hover:bg-gray-50 rounded transition-colors"
                  >
                    {t(`nav.${item.key}`)}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === item.key ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openDropdown === item.key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-4 space-y-1 border-l-2 border-purple-100 ml-2 mt-1 py-1">
                      {item.children.map(child => (
                        <Link
                          key={child.key}
                          to={child.path}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 px-2 text-sm text-gray-600 hover:text-[#5C039B] transition-colors"
                        >
                          {t(`nav.${child.key}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 px-2 text-gray-700 font-medium hover:bg-gray-50 rounded transition-colors"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              )
            )}

            {/* MOBILE AUTH & CONTACT */}
            <div className="pt-5 border-t space-y-3">
              {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-2 bg-gray-50 p-3 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#5C039B] text-white flex items-center justify-center font-bold text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role?.name}</p>
                      </div>
                    </div>

                    <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <FaTachometerAlt /> Dashboard
                      </button>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
              ) : (
                 /* LOGIN DROPDOWN (Mobile) */
                 <div className="w-full">
                    <button 
                      onClick={() => setMobileLoginOpen(!mobileLoginOpen)}
                      className="w-full px-4 py-2 border border-[#5C039B] text-[#5C039B] rounded-lg font-bold hover:bg-[#5C039B] hover:text-white transition-all flex justify-center items-center gap-2"
                    >
                      {t("nav.login")}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${mobileLoginOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {/* Expandable Mobile Menu for Login */}
                    {mobileLoginOpen && (
                       <div className="mt-2 space-y-2 pl-4 border-l-2 border-purple-100 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
                          <Link 
                             to="/user/login" 
                             onClick={() => setMobileOpen(false)}
                             className="block py-2 text-gray-600 hover:text-[#5C039B] font-medium"
                          >
                             Customer
                          </Link>
                          <Link 
                             to="/login" 
                             onClick={() => setMobileOpen(false)}
                             className="block py-2 text-gray-600 hover:text-[#5C039B] font-medium"
                          >
                             Partners
                          </Link>
                       </div>
                    )}
                 </div>
              )}

              <Link to="/contact" className="block" onClick={() => setMobileOpen(false)}>
                <button className="w-full px-4 py-2 bg-[#5C039B] text-white rounded-lg font-bold hover:bg-[#4a027c] transition-colors">
                  {t("nav.contact")}
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;