import React, { useState, useEffect } from 'react';
import {
  Shield,
  Home,
  Wrench,
  FileText,
  Eye,
  Lock,
  Cookie,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Briefcase,
  Scale,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
  Globe,
  Building2,
  Smartphone,
  Server,
  Database,
  Share2,
  Trash2,
  Clock,
  Award,
  HeartHandshake,
  FileCheck,
  Landmark,
  ClipboardList,
  MessageCircle,
  Send,
  ArrowUp,
  Printer,
  Download,
  Search
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const themeColor = "#5C039B";
  const themeGradient = "linear-gradient(135deg, #5C039B 0%, #8B3FC6 100%)";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("definitions");
  const [scrolled, setScrolled] = useState(false);

  // Sections for navigation
  const sections = [
    { id: "definitions", label: "1. Definitions & Parties", icon: FileText },
    { id: "acceptance", label: "2. Acceptance of Terms", icon: CheckCircle },
    { id: "regulatory", label: "3. Regulatory Framework", icon: Scale },
    { id: "eligibility", label: "4. Eligibility & Obligations", icon: Users },
    { id: "realestate", label: "5. Real Estate Disclaimers", icon: Home },
    { id: "technical", label: "6. Technical Services", icon: Wrench },
    { id: "intellectual", label: "7. Intellectual Property", icon: Award },
    { id: "privacy", label: "8. Privacy Policy", icon: Lock },
    { id: "contact", label: "9. Contact Details", icon: Mail }
  ];

  // Handle scroll effects and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Find active section
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Floating Action Buttons */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        style={{ background: themeGradient }}
      >
        <ArrowUp className="h-5 w-5 text-white" />
      </button>

      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="fixed bottom-6 right-24 z-50 p-3 rounded-full shadow-lg bg-white hover:bg-gray-100 transition-all duration-300"
      >
        <Printer className="h-5 w-5 text-gray-700" />
      </button>

  

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-5" style={{ background: themeGradient }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-3xl">
       
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Privacy Policy & Terms of Use
              <span className="block" style={{ background: themeGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
           
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              Effective Date: 1st January 2025 — Xoto Group operates under Dubai laws and DET/DED regulations. 
              Your privacy and legal rights are our priority.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <FileCheck className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Version 2.1</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <Landmark className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">UAE Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Dubai Mainland</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10" style={{ background: themeGradient, borderRadius: '100%', filter: 'blur(60px)' }}></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200" style={{ backgroundColor: `${themeColor}04` }}>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" style={{ color: themeColor }} />
                    Table of Contents
                  </h3>
                </div>
                <nav className="p-3 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 mb-1 ${
                        activeSection === section.id
                          ? 'text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={activeSection === section.id ? { background: themeGradient } : {}}
                    >
                      <section.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{section.label}</span>
                      <ChevronRight className={`h-3 w-3 transition-all ${activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                <HeartHandshake className="h-8 w-8 mb-3" style={{ color: themeColor }} />
                <h4 className="font-bold text-gray-900">Need Assistance?</h4>
                <p className="text-sm text-gray-600 mt-1">Our legal team is available to answer your questions about this policy.</p>
                <button className="mt-4 w-full py-2.5 rounded-lg font-medium text-white transition-all hover:shadow-lg" style={{ background: themeGradient }}>
                  Contact Legal Team
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Search Bar */}
            {/* <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search within privacy policy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
              />
            </div> */}

            {/* Section 1: Definitions */}
            <section id="definitions" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">1. Definitions and Parties</h2>
              </div>
              <div className="p-6 space-y-4 text-gray-700">
                <p><span className="font-semibold text-gray-900">"Xoto Group", "we", "us", or "our"</span> means:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4" style={{ borderLeftColor: themeColor }}>
                    <h4 className="font-bold text-gray-900">Xoto Proptech Real Estate LLC</h4>
                    <p className="text-sm text-gray-600 mt-1">License No. 1567404</p>
                    <p className="text-xs text-gray-500 mt-2">Real Estate Buying/Selling Brokerage, Leasing Property Brokerage, Mortgage Commission</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4" style={{ borderLeftColor: themeColor }}>
                    <h4 className="font-bold text-gray-900">Xoto Home Technical Services LLC</h4>
                    <p className="text-sm text-gray-600 mt-1">License No. 1569951</p>
                    <p className="text-xs text-gray-500 mt-2">Alternative Energy, Electrical Fitting, Landscaping, Maintenance</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm"><span className="font-semibold">📱 "Website"</span> means any platform operated by Xoto Group including all content and tools.</p>
                  <p className="text-sm mt-2"><span className="font-semibold">👤 "User", "you" or "your"</span> means any person who accesses or uses the Website.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Acceptance */}
            <section id="acceptance" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">2. Acceptance of Terms</h2>
              </div>
              <div className="p-6 space-y-4 text-gray-700">
                <p>By accessing or using the Website, you confirm that you have read, understood and agree to be bound by these Terms of Use and the Privacy Policy.</p>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: `${themeColor}08` }}>
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                  <p className="text-sm">We may amend these Terms at any time by publishing an updated version on the Website. Your continued use after any amendment constitutes your acceptance of the updated Terms.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Regulatory */}
            <section id="regulatory" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">3. Regulatory and Legal Framework (UAE)</h2>
              </div>
              <div className="p-6 space-y-4 text-gray-700">
                <p>The Website and Services operate under UAE Federal laws including civil transactions, cybercrime, and data protection regulations.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <Building2 className="h-6 w-6 mx-auto mb-2" style={{ color: themeColor }} />
                    <p className="font-semibold text-sm">Dubai Land Department</p>
                    <p className="text-xs text-gray-500">RERA Regulations</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <Wrench className="h-6 w-6 mx-auto mb-2" style={{ color: themeColor }} />
                    <p className="font-semibold text-sm">Dubai Municipality</p>
                    <p className="text-xs text-gray-500">Technical Services</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <Landmark className="h-6 w-6 mx-auto mb-2" style={{ color: themeColor }} />
                    <p className="font-semibold text-sm">UAE Central Bank</p>
                    <p className="text-xs text-gray-500">Financial Regulations</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Eligibility */}
            <section id="eligibility" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">4. Eligibility and User Obligations</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="font-bold" style={{ color: themeColor }}>18+</span>
                  </div>
                  <p>You must be at least <span className="font-semibold">18 years old</span> to use the Website.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> You agree to:
                    </h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-green-700 space-y-1">
                      <li>Provide true and accurate information</li>
                      <li>Keep your details up to date</li>
                      <li>Use Website for lawful purposes only</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> You must not:
                    </h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-red-700 space-y-1">
                      <li>Use for fraudulent or unlawful purposes</li>
                      <li>Disrupt Website operations</li>
                      <li>Copy content without written consent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Real Estate */}
            <section id="realestate" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Home className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">5. Real Estate Brokerage & Leasing Disclaimers</h2>
              </div>
              <div className="p-6 space-y-4 text-gray-700">
                <p>Xoto Proptech Real Estate LLC acts as a real estate buying/selling broker and leasing agent in accordance with DLD/RERA rules.</p>
                <div className="space-y-3">
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                    <Home className="h-5 w-5 flex-shrink-0" style={{ color: themeColor }} />
                    <p className="text-sm">Property listings, prices, yields and images are <span className="font-semibold">indicative only</span> and subject to change without notice.</p>
                  </div>
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                    <Briefcase className="h-5 w-5 flex-shrink-0" style={{ color: themeColor }} />
                    <p className="text-sm">Mortgage/financing information is informational only. Approval is at the discretion of banks/lenders.</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-800">⚠️ You remain solely responsible for obtaining independent legal, tax, and financial advice before entering into any transaction.</p>
                </div>
              </div>
            </section>

            {/* Section 6: Technical Services */}
            <section id="technical" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">6. Technical and Home Services Disclaimers</h2>
              </div>
              <div className="p-6 space-y-4 text-gray-700">
                <p>Xoto Home Technical Services LLC provides installation, maintenance, landscaping, and related works.</p>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="font-semibold flex items-center gap-2"><Wrench className="h-4 w-4" /> Scope of Works</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Alternative Energy', 'Electrical Fitting', 'Swimming Pools', 'Tiling', 'Wallpaper', 'Landscaping', 'Irrigation', 'False Ceilings'].map(service => (
                      <span key={service} className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 shadow-sm">{service}</span>
                    ))}
                  </div>
                  <p className="text-xs mt-3 text-blue-700">Actual works to be performed will be specified in a written contract. Permits may be required from authorities.</p>
                </div>
              </div>
            </section>

            {/* Section 7: Intellectual Property */}
            <section id="intellectual" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Award className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">7. Intellectual Property</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700">All content on the Website, including text, graphics, logos, icons, images, videos, software, code, design, layout and compilations, is owned or licensed by Xoto Group and is protected by applicable copyright, trademark and other intellectual property laws of the UAE.</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                  <p>⚠️ You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Website for your personal, non-commercial use only.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Privacy Policy - Detailed */}
            <section id="privacy" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">8. Privacy Policy</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Data Collection */}
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4" style={{ color: themeColor }} /> Categories of Personal Data Collected
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { title: "Identification", items: ["Name, email, phone", "Address, nationality", "ID/Passport copies"] },
                      { title: "Property & Transaction", items: ["Budget & preferences", "Ownership status", "Mortgage requirements"] },
                      { title: "Technical Services", items: ["Property location", "Drawings & photos", "Site information"] },
                      { title: "Website Usage", items: ["IP address & device", "Browser type", "Cookies & analytics"] }
                    ].map((category, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                        <p className="font-medium text-gray-800">{category.title}</p>
                        <ul className="list-disc pl-4 mt-1 text-xs text-gray-600">
                          {category.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Sharing */}
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Share2 className="h-4 w-4" style={{ color: themeColor }} /> Data Sharing & Transfers
                  </h3>
                  <p className="text-gray-700 text-sm">We may share data with group entities, professional advisors, real estate counterparties, government authorities, and service providers. Data may be transferred outside UAE with adequate protection.</p>
                </div>

                {/* Your Rights */}
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4" style={{ color: themeColor }} /> Your Rights
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { icon: Eye, label: "Access" },
                      { icon: FileCheck, label: "Rectification" },
                      { icon: Trash2, label: "Erasure" },
                      { icon: Clock, label: "Restriction" },
                      { icon: AlertCircle, label: "Object" },
                      { icon: MessageCircle, label: "Withdraw Consent" }
                    ].map((right, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <right.icon className="h-3 w-3" style={{ color: themeColor }} />
                        <span className="text-xs text-gray-700">{right.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cookies */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Cookie className="h-4 w-4" style={{ color: themeColor }} /> Cookies & Similar Technologies
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">We use cookies to recognize your device, enhance user experience, perform analytics, and improve security. You may control cookies through your browser settings.</p>
                </div>
              </div>
            </section>

            {/* Section 9: Contact */}
            <section id="contact" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden scroll-mt-20 transition-all hover:shadow-xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${themeColor}04` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: themeGradient }}>
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">9. Contact Details</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Office Address</p>
                        <p className="text-gray-600 text-sm">Office 1616, Park Lane Tower, Business Bay, Dubai, UAE</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Mail className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a href="mailto:connect@xoto.ae" className="text-sm hover:underline" style={{ color: themeColor }}>connect@xoto.ae</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <a href="tel:+97143486807" className="text-sm hover:underline" style={{ color: themeColor }}>+971 43486807</a>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                    <p className="text-sm text-gray-700">For privacy-related requests or to exercise your data protection rights, please contact us using the details provided. We may request proof of identity before responding.</p>
                    <button className="mt-4 w-full py-2.5 rounded-lg font-medium text-white transition-all hover:shadow-lg flex items-center justify-center gap-2" style={{ background: themeGradient }}>
                      <Send className="h-4 w-4" /> Send Privacy Request
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Governing Law & Footer */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Landmark className="h-4 w-4" style={{ color: themeColor }} />
                    17. Governing Law and Dispute Resolution
                  </h3>
                  <p className="text-gray-700 text-sm mt-2">These Terms are governed by the laws of the Emirate of Dubai and UAE federal laws. Disputes shall be subject to the exclusive jurisdiction of Dubai courts.</p>
                </div>
                <div className="border-t pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    © {new Date().getFullYear()} Xoto Group — All rights reserved.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Xoto Prophet Real Estate LLC | Xoto Home Technical Services LLC
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    This document is an electronic record under UAE laws. No part may be reproduced without written permission.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5C039B;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a0263;
        }
        @media print {
          .sticky, .fixed, button, .lg\\:block {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicyPage;