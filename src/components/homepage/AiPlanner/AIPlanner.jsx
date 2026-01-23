import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, LayoutDashboard, Compass, 
  Image as ImageIcon, Sparkles, Upload, 
  ChevronDown, X, ArrowRight, CheckCircle2,
  Download, Coins, Crown, Loader2, Sun, Sprout, Info, ArrowLeft ,Check 
} from 'lucide-react';
import { 
  Button, Modal, Progress, Card, Tag, Empty, 
  notification, Typography, Divider 
} from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage'; 
import logoNew from "../../../assets/img/logonew2.png";

const { Paragraph, Title, Text } = Typography;

// --- Constants ---
const BRAND_PURPLE = "#5C039B"; 
const API_BASE_URL = 'https://xoto.ae/api';

// --- Mock Data ---
const dummySpaceImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800' },
  { id: 2, url: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800' },
  { id: 3, url: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=800' },
];

const gardenStyles = [
  { value: 'modern', label: 'Modern Garden', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600' },
  { value: 'japanese', label: 'Japanese Zen', img: 'https://www.japan-experience.com/sites/default/files/styles/scale_crop_570x300/public/regiondo/big-ticket-image-5f7541324c6c4582000815-cropped600-400-dpl-65a78e47b9a57.jpg.webp?itok=-yBTm-IO' },
  { value: 'cottage', label: 'English Cottage', img: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600' },
  { value: 'mediterranean', label: 'Urban Parks', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg8fAUL2dlGy5ThADjNfnZK6FCt-PyxLRe8JOonNb8Tlje7dIJD6pNA0M&s' },
  { value: 'tropical', label: 'Tropical Oasis', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSseHbxdOMINrtqNJ7vAph6i_ipKzK--QmDTQ&s' },
  { value: 'minimalist', label: 'Minimalist', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' },
];

const gardenElements = [
  { value: 'fountain', label: 'Water Fountain', img: 'https://img.freepik.com/free-photo/nice-fountain-with-leafy-trees-background_1160-297.jpg?semt=ais_hybrid&w=740&q=80' },
  { value: 'pond', label: 'Pond', img: 'https://media.istockphoto.com/id/165615108/photo/long-pond-maine-deep-blue-water-lake-lily-pads-grasses.jpg?s=612x612&w=0&k=20&c=vaW1nnSYFl-E45R3Bsna6wg9PNnwZUw0bEaWxR85BCw=' },
  { value: 'pathway', label: 'Stone Pathway', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg8fAUL2dlGy5ThADjNfnZK6FCt-PyxLRe8JOonNb8Tlje7dIJD6pNA0M&s' },
  { value: 'gazebo', label: 'Gazebo', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7VzauykJs9jY1IjtMmQMgiPHS3MZ7ghhSwQ&s' },
  { value: 'firepit', label: 'Fire Pit', img: 'https://irp.cdn-website.com/cea9e5b2/dms3rep/multi/Vakkas-paver-patio-fire-pit-5.jpg' },
  { value: 'seating', label: 'Seating Area', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN533r4zs2Vywi2quKHBlEqsrzpY4l_Mpbkg&s' },
];

const AIPlanner = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [specificRequirement, setSpecificRequirement] = useState('');
  
  const [designs, setDesigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Modals
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); 
  
  // UI & Results
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [currentResult, setCurrentResult] = useState({ url: '', desc: '' });

  // Mobile Tabs
  const [activeMobileTab, setActiveMobileTab] = useState('create');

  const isCustomerLoggedIn = useMemo(() => {
    return user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin');
  }, [user]);

  // --- Handlers ---

  const resetDesign = () => {
    setSelectedImage(null);
    setUploadedFile(null);
    setSelectedStyles([]);
    setSelectedElements([]);
    setSpecificRequirement('');
    notification.info({ message: 'Form cleared' });
  };

  const processUploadedFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(file);
        setSelectedImage(e.target.result);
        setShowUploadModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedImage) {
      notification.warning({ message: 'Please upload a photo first' });
      return;
    }

    if (!isCustomerLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    // Removed the hasUsedFreeCredit check. 
    // We now let the backend decide if the user has reached their limit.
    generateAIDesigns(user);
  };

  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    // You could trigger generateAIDesigns here automatically if desired
  };

  const generateAIDesigns = async (currentUser) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const formData = new FormData();
    if (uploadedFile) {
      formData.append('gardenImage', uploadedFile);
    } else {
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], "input_image.jpg", { type: "image/jpeg" });
        formData.append('gardenImage', file);
      } catch (err) {
        console.error("Blob failed", err);
      }
    }

    formData.append('styleName', selectedStyles.length > 0 ? gardenStyles.find(s => s.value === selectedStyles[0])?.label : 'Modern Garden');
    formData.append('elements', selectedElements.map(e => gardenElements.find(el => el.value === e)?.label).join(', ') || 'Natural Landscaping');
    formData.append('description', specificRequirement || 'A professional landscaping design');
 
    const interval = setInterval(() => {
      setGenerationProgress(prev => (prev < 95 ? prev + (95 - prev) * 0.1 : 95));
    }, 500);

    try {
      const response = await apiService.post('ai/generate-garden', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 
      });

      const resData = response;

      // --- LOGIC: Check for Premium Restriction Response ---
      if (resData.status === false && resData.aiImageGeneration === false) {
        setIsGenerating(false);
        setUpgradeMessage(resData.message || "Limit reached. Upgrade to continue.");
        setShowUpgradeModal(true);
        return; 
      }

      // --- LOGIC: Check for Success Response ---
      if (resData.imageUrl && resData.imageUrl !== "") {
        const aiUrl = resData.imageUrl;
        const aiDesc = resData.message || "Garden generated successfully";
        
        const newDesign = {
          id: Date.now(),
          image: aiUrl,
          title: `Vision ${designs.length + 1}`,
          styles: [...selectedStyles],
          elements: [...selectedElements],
          timestamp: new Date().toLocaleTimeString(),
          aiAnalysis: aiDesc,
          userInfo: currentUser
        };

        setDesigns(prev => [newDesign, ...prev]);
        setCurrentResult({ url: aiUrl, desc: aiDesc });
        setGenerationProgress(100);
        
        notification.success({ message: 'Design Generated!', duration: 2 });
        
        setTimeout(() => {
          setIsGenerating(false);
          setShowGeneratedModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      // Handle Error Responses
      const errRes = error.response?.data;
      
      // --- START: TARGET LOGIC ---
      if (errRes?.error?.message === "Customer not found") {
        setIsGenerating(false);
        notification.error({
          message: 'Account Required',
          description: errRes.error.message,
        });
        setShowAuthModal(true); 
        return;
      }
      // --- END: TARGET LOGIC ---

      if (errRes && (errRes.aiImageGeneration === false || errRes.status === false)) {
          setIsGenerating(false);
          setUpgradeMessage(errRes.message || "Please upgrade to generate more images.");
          setShowUpgradeModal(true);
          return;
      }

      // notification.error removed here to stop "Something went wrong" as requested
      setIsGenerating(false);
    } finally {
      clearInterval(interval);
    }
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Mobile Tab Item ---
  const MobileTabItem = ({ icon: Icon, label, id, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 ${activeMobileTab === id ? 'text-purple-600' : 'text-gray-400'}`}
    >
      <Icon size={24} className={activeMobileTab === id ? 'fill-current' : ''} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FC] font-sans overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <div 
        className="hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-300 z-50 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-sm hover:shadow-2xl overflow-hidden"
        style={{ width: isSidebarHovered ? '280px' : '88px' }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Logo */}
        <div className="h-24 flex items-center px-6 mb-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white rounded-full"/>
              <div className="w-1 h-6 bg-white rounded-full"/>
              <div className="w-1 h-4 bg-white rounded-full"/>
            </div>
          </div>

          {/* Logo Text */}
          <span
            className={`
              ml-4 font-bold text-2xl tracking-tight
              transition-all duration-300
              ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
            `}
          >
            Xoto.AI
          </span>
        </div>

        {/* Menu */}
        <div className="flex-1 flex flex-col gap-1">
          
          {/* Home */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center px-6 py-3.5 cursor-pointer hover:bg-gray-50 group relative"
          >
            {/* ICON FIXED SLOT */}
            <div className="w-12 flex justify-center shrink-0">
              <Home size={26} className="text-gray-500 group-hover:text-gray-900" />
            </div>

            {/* TEXT */}
            <span
              className={`
                ml-2 text-base font-medium whitespace-nowrap
                transition-all duration-300
                ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
              `}
            >
              Home
            </span>
          </div>

          {/* Active */}
          <div className="flex items-center px-6 py-3.5 bg-purple-50 text-purple-700 cursor-pointer relative">
            
            {/* Active Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 rounded-r-full" />

            {/* ICON FIXED SLOT */}
            <div className="w-12 flex justify-center shrink-0">
              <Sparkles size={26} />
            </div>

            {/* TEXT */}
            <span
              className={`
                ml-2 text-base font-medium whitespace-nowrap
                transition-all duration-300
                ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
              `}
            >
              AI Landscaping
            </span>
          </div>
        </div>
      </div>


      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative lg:ml-[88px] transition-all duration-300 w-full">
        
        {/* --- LEFT: CONFIGURATION PANEL --- */}
        <div className="w-full lg:w-[460px] bg-white h-full  overflow-y-auto p-4 lg:p-6 border-r border-gray-400 shrink-0 z-10 custom-scrollbar pb-24 lg:pb-6">
          
          {/* Header Mobile Only */}
          <div className="lg:hidden flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
               <Link to="/"><ArrowLeft className="text-gray-600" /></Link>
               <span className="font-bold text-lg">AI Planner</span>
             </div>
             {isCustomerLoggedIn && <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Pro</div>}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex rounded-2xl p-4 mb-8 justify-between items-center shadow-sm" style={{ backgroundColor: BRAND_PURPLE }}>
             <div className="flex items-center gap-3">
               <span className="font-bold text-lg text-white">Landscaping</span>
             </div>
          </div>

          {/* Upload Area */}
          <div className="bg-[#F3F4F6] rounded-[24px] lg:rounded-[32px] h-[280px] lg:h-[320px] mb-6 lg:mb-8 relative overflow-hidden group border border-gray-100 transition-colors hover:border-purple-100">
            {selectedImage ? (
              <>
                 <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
                 <button 
                   onClick={() => setSelectedImage(null)}
                   className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-red-500 transition-all shadow-md"
                 >
                   <X size={18} />
                 </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="bg-white rounded-full p-4 lg:p-5 mb-4 shadow-sm">
                  <ImageIcon className="text-gray-300 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="font-bold text-gray-800 text-base lg:text-lg mb-2">Start with a photo</h3>
                <p className="text-gray-400 text-xs lg:text-sm text-center max-w-[280px] mb-6 leading-relaxed">
                  Upload a photo of your garden to see the AI magic.
                </p>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-[var(--color-primary)] text-white px-6 py-3 lg:px-8 lg:py-4 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl text-sm lg:text-base"
                >
                  <Upload size={16} />
                  Add a photo
                </button>
              </div>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
             <button onClick={() => setShowStyleModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
               <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                 <Sparkles className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" />
               </div>
               <span className="font-bold text-gray-700 text-sm lg:text-base">Style</span>
               <span className="bg-white border border-gray-200 text-gray-600 text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                 {selectedStyles.length > 0 ? 'Selected' : 'Choose'}
               </span>
               {selectedStyles.length > 0 && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
             </button>

             <button onClick={() => setShowElementModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
               <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                 <LayoutDashboard className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" />
               </div>
               <span className="font-bold text-gray-700 text-sm lg:text-base">Elements</span>
               <span className="bg-white border border-gray-200 text-gray-600 text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                 {selectedElements.length > 0 ? 'Selected' : 'Choose'}
               </span>
               {selectedElements.length > 0 && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
             </button>
          </div>

          {/* Specific Requirement Input */}
          <div className="bg-[#F3F4F6] rounded-2xl p-4 lg:p-5 mb-6 lg:mb-8 border border-transparent hover:border-gray-200">
            <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-gray-800 text-sm lg:text-base">Custom Instructions</span>
            </div>
            <textarea 
              className="w-full bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 resize-none"
              placeholder="e.g. A small pond in the corner..."
              rows={2}
              value={specificRequirement}
              onChange={(e) => setSpecificRequirement(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="w-full text-white font-bold text-base lg:text-lg h-14 lg:h-16 rounded-2xl flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-xl shadow-purple-200 active:scale-[0.98]"
            style={{ backgroundColor: BRAND_PURPLE }}
          >
             {isGenerating ? (
                 <>
                   <Loader2 className="animate-spin w-5 h-5" />
                   <span>Designing...</span>
                 </>
             ) : (
                 <>
                   <span>Generate Vision</span>
                   <div className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-normal backdrop-blur-sm border border-white/10">
                     <Sparkles size={12} className="text-white" />
                   </div>
                 </>
             )}
          </button>

          {/* Mobile Results Preview */}
          <div className="lg:hidden mt-10">
             {designs.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Your Designs</h3>
                    <span className="text-xs text-gray-500">{designs.length} Items</span>
                  </div>
                  <div className="space-y-4">
                    {designs.map(d => (
                        <div key={d.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <img src={d.image} className="w-full h-48 object-cover" alt="Result" />
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">{d.title}</h4>
                                    <span className="text-xs text-gray-400">{d.timestamp}</span>
                                </div>
                                <button onClick={() => { setCurrentResult({url: d.image, desc: d.aiAnalysis}); setShowGeneratedModal(true); }} className="p-2 bg-gray-50 rounded-full">
                                    <ArrowRight size={16} className="text-purple-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                  </div>
                </>
             )}
          </div>
        </div>

        {/* --- RIGHT: RESULTS GALLERY (Desktop Only) --- */}
        <div className="hidden lg:block flex-1 bg-[#F8F9FC] p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
             <div className="mb-10 flex justify-between items-end">
               <div>
                 <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Your Masterpieces</h1>
                 <p className="text-gray-500 font-medium text-lg">AI-generated landscapes created by you.</p>
               </div>
              
             </div>

             {designs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-gray-200 rounded-[32px] bg-white/50">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                   <ImageIcon size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-400">No designs yet</h3>
                 <p className="text-gray-400 mt-2">Use the panel on the left to start.</p>
               </div>
             ) : (
                <div className="grid grid-cols-2 gap-8">
                  {designs.map(d => (
                    <Card key={d.id} hoverable className="rounded-[32px] overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 group" bodyStyle={{ padding: 0 }}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={d.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Design" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 backdrop-blur-[3px]">
                           <button onClick={() => downloadImage(d.image, 'design')} className="flex flex-col items-center gap-3 text-white hover:scale-110 transition-transform group/btn">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover/btn:bg-white/30 border border-white/30">
                                <Download size={24} />
                             </div>
                             <span className="text-xs font-bold tracking-widest uppercase">Download</span>
                           </button>
                        </div>
                        <div className="absolute top-5 left-5">
                           <Tag color="#5c039b" className="text-purple-700 font-bold border-none px-3 py-1.5 rounded-full shadow-lg">AI GENERATED</Tag>
                        </div>
                      </div>
                      <div className="p-6">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{d.title}</h3>
                          <p className="text-gray-400 text-sm">{d.timestamp}</p>
                      </div>
                    </Card>
                  ))}
                </div>
             )}
          </div>
        </div>

      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around py-2 pb-safe-area">
         <MobileTabItem icon={Home} label="Home" id="home" onClick={() => navigate('/')} />
         <MobileTabItem icon={Sparkles} label="Create" id="create" onClick={() => setActiveMobileTab('create')} />
         <MobileTabItem icon={Compass} label="Explore" id="explore" onClick={() => {}} />
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Auth Modal */}
      <LeadGenerationModal 
        visible={showAuthModal} 
        onCancel={() => setShowAuthModal(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      {/* 2. Upgrade / Premium Modal */}
      <Modal
        open={showUpgradeModal}
        footer={null}
        onCancel={() => setShowUpgradeModal(false)}
        width={500}
        centered
        bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}
      >
        <div className="p-8 text-center bg-gradient-to-b from-white to-purple-50">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-yellow-200">
                <Crown size={40} className="text-yellow-600" fill="currentColor" fillOpacity={0.2} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlock Limitless Creativity</h3>
            <p className="text-gray-500 mb-8 leading-relaxed px-4">
                {upgradeMessage || "You've reached your limit. Upgrade to Pro to continue designing."}
            </p>
            <div className="space-y-3">
                <Link to="/subscription/plans">
                    <Button type="primary" size="large" block className="h-12 text-base font-bold rounded-xl shadow-lg shadow-purple-200" style={{ background: 'linear-gradient(135deg, #5C039B 0%, #8E2DE2 100%)', border: 'none' }} onClick={() => setShowUpgradeModal(false)}>View Upgrade Plans</Button>
                </Link>
                <Button type="text" block className="text-gray-400" onClick={() => setShowUpgradeModal(false)}>Maybe Later</Button>
            </div>
        </div>
      </Modal>

      {/* 3. Result Modal */}
      <Modal
        open={showGeneratedModal}
        footer={null}
        onCancel={() => setShowGeneratedModal(false)}
        width={["90vw", "90vw", "90vw", 1000]}
        centered
        bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}
      >
        <div className="flex flex-col h-[80vh] lg:h-[500px] lg:flex-row">
          <div className="lg:w-3/5 h-[50vh] lg:h-full flex-shrink-0">
            <img src={currentResult.url} className="w-full h-full object-cover" alt="Final Design" />
          </div>
          <div className="lg:w-2/5 p-6 lg:p-10 bg-white flex flex-col justify-between h-[30vh] lg:h-full overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                <Sparkles size={18} />
                <span className="text-sm lg:text-base">AI SCENE ANALYSIS</span>
              </div>
              <Paragraph className="text-gray-600 leading-relaxed text-sm lg:text-base">
                {currentResult.desc || "No description provided."}
              </Paragraph>
            </div>
            <div className="space-y-3 pt-4 border-t mt-4">
              <Button type="primary" block size="large" className="h-12 rounded-2xl font-bold" style={{ background: BRAND_PURPLE }} onClick={() => downloadImage(currentResult.url, 'Xoto-Vision')}>Download Render</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 4. Upload Modal */}
      <Modal open={showUploadModal} footer={null} onCancel={() => setShowUploadModal(false)} centered width={600} title="Select Source Canvas" bodyStyle={{ padding: '1rem' }}>
        <div className="p-2">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
            {dummySpaceImages.map((img) => (
              <div key={img.id} onClick={() => { setSelectedImage(img.url); setShowUploadModal(false); }} className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm">
                <img src={img.url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <Divider>OR UPLOAD YOUR OWN</Divider>
          <input type="file" id="file-up" className="hidden" accept="image/*" onChange={(e) => processUploadedFile(e.target.files[0])} />
          <Button block icon={<Upload size={16} />} className="h-12 rounded-xl font-semibold border-dashed text-sm" onClick={() => document.getElementById('file-up').click()}>Browse Local Files</Button>
        </div>
      </Modal>

      {/* 5. Style & Elements Modals */}
      <Modal open={showStyleModal} footer={null} onCancel={() => setShowStyleModal(false)} width={["95vw", "95vw", "95vw", 800]} centered title="Choose Landscape Style" bodyStyle={{ padding: '0.5rem' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {gardenStyles.map(s => (
            <div key={s.value} onClick={() => { setSelectedStyles([s.value]); setShowStyleModal(false); }} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedStyles.includes(s.value) ? 'border-purple-600 shadow-lg' : 'border-transparent hover:border-purple-100 hover:shadow-md'}`}>
              <img src={s.img} className="h-32 lg:h-40 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 lg:p-4"><p className="text-white font-bold text-sm lg:text-base m-0 truncate">{s.label}</p></div>
              {selectedStyles.includes(s.value) && (<div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg"><CheckCircle2 size={14} /></div>)}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showElementModal} footer={null} onCancel={() => setShowElementModal(false)} width={["95vw", "95vw", "95vw", 800]} centered title="Add Landscape Features" bodyStyle={{ padding: '0.5rem' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {gardenElements.map(el => (
            <div key={el.value} onClick={() => { setSelectedElements(prev => prev.includes(el.value) ? prev.filter(x => x !== el.value) : [...prev, el.value]) }} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedElements.includes(el.value) ? 'border-green-500 bg-green-50 shadow-lg' : 'border-transparent hover:border-green-100 hover:shadow-md'}`}>
              <img src={el.img} className="h-28 lg:h-32 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="p-2 lg:p-3 text-center bg-white/90 backdrop-blur-sm"><p className="font-bold text-xs lg:text-sm m-0 truncate">{el.label}</p></div>
              {selectedElements.includes(el.value) && (<div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg"><Check size={14} /></div>)}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end pt-4 border-t">
          <Button type="primary" size="large" onClick={() => setShowElementModal(false)} className="rounded-xl px-8 lg:px-10 h-12" style={{ background: BRAND_PURPLE }}>Apply Selections</Button>
        </div>
      </Modal>

      {/* --- GENERATION LOADING OVERLAY --- */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/90 lg:bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 p-4">
          <div className="relative mb-8 lg:mb-12 w-32 h-32 lg:w-48 lg:h-48 mx-auto flex items-center justify-center">
            <div className="absolute -inset-6 lg:-inset-8 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
            <img src={logoNew} alt="Logo" className="relative max-w-full max-h-full object-contain animate-bounce" />
          </div>
          <div className="text-center mb-6 lg:mb-8 px-4">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {isCustomerLoggedIn ? 'Creating Another Masterpiece' : 'Xoto AI is Sculpting'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium text-sm lg:text-base max-w-md mx-auto">
              Reimagining your outdoor space with premium flora...
            </p>
          </div>
          <div className="w-full max-w-xs lg:w-80">
            <Progress percent={Math.floor(generationProgress)} strokeColor={{ '0%': '#8E2DE2', '100%': BRAND_PURPLE }} status="active" strokeWidth={10} showInfo={false} />
            <div className="flex justify-between mt-3 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>Analyzing Geometry</span>
              <span>{Math.floor(generationProgress)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--color-primary);
    border-radius: 9999px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    opacity: 0.9;
  }

  /* Firefox support */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--color-primary) transparent;
  }
`}</style>

export default AIPlanner;