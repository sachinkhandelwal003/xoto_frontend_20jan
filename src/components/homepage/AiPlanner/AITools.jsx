import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Sparkles, Image as ImageIcon, 
  LogOut, Bell, Search, ArrowRight, 
  Trees, Armchair, Home, 
  Sofa, BoxSelect, Wand2, 
  BrainCircuit, Lock, Menu
} from 'lucide-react';

const toolsData = [
  {
    id: 'landscaping',
    title: 'AI Landscaping',
    description: 'Generative AI garden planning and vegetation render.',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80', 
    route: '/aiPlanner/landscape',
    category: 'Design',
    icon: <Trees size={24} />,
    isNew: false,
    locked: false 
  },
  {
    id: 'interior',
    title: 'Interior Transformation',
    description: 'Redesign your room style instantly with Generative AI.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    route: '/aiPlanner/interior',
    category: 'Design',
    icon: <Armchair size={24} />,
    isNew: false,
    locked: false 
  },
  {
    id: 'exterior',
    title: 'Exterior Remodel',
    description: "Modernize home facades and curb appeal automatically.",
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    route: '/aiPlanner/exterior',
    category: 'Design',
    icon: <Home size={24} />,
    isNew: true,
    locked: true 
  },
  {
    id: 'furniture',
    title: 'Smart Furniture Swap',
    description: 'Remove existing items and place new AI furniture.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    route: '/aiPlanner/furniture',
    category: 'Staging',
    icon: <Sofa size={24} />,
    isNew: true,
    locked: true 
  },
  {
    id: 'virtual',
    title: 'Virtual Staging',
    description: 'Furnish empty rooms with realistic 3D assets.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
    route: '/aiPlanner/staging',
    category: 'Staging',
    icon: <BoxSelect size={24} />,
    isNew: false,
    locked: true 
  },
  {
    id: 'image',
    title: 'Image Enhancer',
    description: 'Upscale resolution and fix lighting with one click.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    route: '/aiPlanner/enhance',
    category: 'Present',
    icon: <Wand2 size={24} />,
    isNew: false,
    locked: true 
  }
];

const categories = ['All', 'Design', 'Staging', 'Present'];

const AITools = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = toolsData.filter(tool => {
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/40 font-sans">
      {/* Global Styles */}
      <style>{`
        .tool-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* MOBILE HEADER + MENU BUTTON */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -ml-2 text-gray-700"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center text-white">
              <BrainCircuit size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">xoto</span>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR DRAWER */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center text-white shadow-md">
                <BrainCircuit size={24} />
              </div>
              <span className="font-bold text-2xl tracking-tight">xoto</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div onClick={() => { navigate('/'); setIsSidebarOpen(false); }} 
                 className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <LayoutGrid size={24} />
              <span className="font-medium">Explore</span>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-purple-700 text-white">
              <Sparkles size={24} />
              <span className="font-bold">AI Tools</span>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600">
              <ImageIcon size={24} />
              <span className="font-medium">My Designs</span>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600">
              <Bell size={24} />
              <span className="font-medium">Notifications</span>
            </div>
          </div>

          <div className="mt-auto p-4">
            <button className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-20 hover:w-64 bg-white border-r border-gray-200 z-30 transition-all duration-300 group">
      
<div className="h-20 flex items-center justify-center">
  {/* Gap ko 0 karein jab hover na ho, taaki icon center me rahe */}
  <div className="flex items-center gap-0 group-hover:gap-3 transition-all duration-300">
    
    {/* Icon Container */}
    <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
      <BrainCircuit size={24} />
    </div>

    {/* Text Label */}
    {/* w-0 aur overflow-hidden add kiya taaki bina hover ke ye space na le */}
    <span className="font-bold text-2xl tracking-tight opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300 whitespace-nowrap">
      xoto
    </span>
    
  </div>
</div>

        <nav className="px-3 flex flex-col gap-1.5">
          <div onClick={() => navigate('/')} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600">
            <LayoutGrid size={24} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">
              Explore
            </span>
          </div>

          <div className="flex items-center gap-4 px-3 py-3 rounded-xl bg-purple-700 text-white">
            <Sparkles size={24} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold whitespace-nowrap">
              AI Tools
            </span>
          </div>

          <div className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600">
            <ImageIcon size={24} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">
              My Designs
            </span>
          </div>

          <div className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600">
            <Bell size={24} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium whitespace-nowrap">
              Notifications
            </span>
          </div>
        </nav>

       {/* Log Out Button Section */}
{/* <div className="absolute bottom-6 left-3 right-3">
  <button className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-0 group-hover:gap-2 transition-all duration-300">
    
    <LogOut size={20} className="shrink-0" />
    
 
    <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300 whitespace-nowrap">
      Log Out
    </span>
    
  </button>
</div> */}

      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-20 min-h-screen pb-20 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">AI Suite</h1>
                <p className="text-gray-500 text-sm mt-1">Transform visuals with xoto AI</p>
              </div>

              <div className="relative w-full sm:w-80 lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tools..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 mt-5 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No tools found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => !tool.locked && navigate(tool.route)}
                  className={`
                    group relative bg-white rounded-2xl overflow-hidden border border-gray-100 
                    shadow-sm hover:shadow-xl transition-all duration-300
                    ${tool.locked 
                      ? 'cursor-not-allowed opacity-85 grayscale-[0.4]' 
                      : 'cursor-pointer tool-card-hover'
                    }
                  `}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] md:aspect-[5/3] relative overflow-hidden bg-gray-100">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        !tool.locked && 'group-hover:scale-110'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {tool.locked && (
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-black/75 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/20">
                          <Lock size={14} /> Coming Soon
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {tool.isNew && !tool.locked && (
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
                          New
                        </span>
                      )}
                      <div className={`p-2 rounded-lg text-white backdrop-blur-sm ${
                        tool.locked ? 'bg-black/50' : 'bg-purple-700/80'
                      }`}>
                        {React.cloneElement(tool.icon, { size: 22 })}
                      </div>
                    </div>

                    {!tool.locked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center">
                          <Sparkles size={22} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className={`font-bold text-lg mb-1.5 transition-colors ${
                      tool.locked ? 'text-gray-500' : 'text-gray-900 group-hover:text-purple-700'
                    }`}>
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                      {tool.description}
                    </p>

                    {!tool.locked ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1">
                        <span>Launch Tool</span>
                        <ArrowRight size={16} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Lock size={14} />
                        <span>Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="mt-12 text-center text-gray-400 text-xs pb-6">
            © {new Date().getFullYear()} xoto. Powered by Generative AI.
          </footer>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex items-center justify-around py-2 px-2 shadow-lg">
        <div className="flex flex-col items-center gap-1 text-purple-700">
          <Sparkles size={22} />
          <span className="text-[10px] font-bold">AI Tools</span>
        </div>
        <div onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-gray-500">
          <LayoutGrid size={22} />
          <span className="text-[10px]">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500">
          <ImageIcon size={22} />
          <span className="text-[10px]">Designs</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500">
          <Bell size={22} />
          <span className="text-[10px]">Alerts</span>
        </div>
      </nav>
    </div>
  );
};

export default AITools;