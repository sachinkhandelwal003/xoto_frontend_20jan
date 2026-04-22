import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Compass,
  Image as ImageIcon, Sparkles, Upload,
  X, ArrowRight, ArrowLeft, CheckCircle2,
  Download, Crown, Loader2, Check, Edit2
} from 'lucide-react';
import {
  Button, Modal, Progress, Card, Tag, Empty,
  notification, Typography, Divider, Spin, Input
} from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage';

const { Paragraph } = Typography;

const getProgressText = (progress) => {
  if (progress < 20) return { title: "Reading Your Inputs", subtitle: "Understanding your preferences and space details…" };
  if (progress < 40) return { title: "Setting the Scene", subtitle: "Creating the base layout…" };
  if (progress < 60) return { title: "Adding Greenery & Elements", subtitle: "Placing key elements…" };
  if (progress < 80) return { title: "Enhancing Visual Details", subtitle: "Adjusting lighting and textures…" };
  if (progress < 90) return { title: "Rendering Image", subtitle: "Finalizing details…" };
  return { title: "Finalizing Design", subtitle: "Almost done…" };
};

const BRAND_PURPLE = "#5C039B";

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

const dummySpaceImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800' },
  { id: 2, url: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800' },
  { id: 3, url: 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=800' },
];

const AIPlanner = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const pollingRef = useRef(null);
  const lastDesignCountRef = useRef(0);

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [specificRequirement, setSpecificRequirement] = useState('');
  const [designs, setDesigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [currentResult, setCurrentResult] = useState({ url: '', desc: '', styleName: '', elementsList: [], instruction: '' });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const [libraryDesigns, setLibraryDesigns] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState('create');
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [verifiedPremium, setVerifiedPremium] = useState(false);

  const progress = Math.floor(generationProgress);
  const { title, subtitle } = getProgressText(progress);

  const isCustomerLoggedIn = useMemo(() => {
    return user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin');
  }, [user]);

  // Helper function to get selected elements labels
  const getSelectedElementsLabels = () => {
    if (selectedElements.length === 0) return null;
    return selectedElements.map(e => gardenElements.find(el => el.value === e)?.label).filter(Boolean);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await apiService.get("/ai/get-landscape-designs");
        const apiDesigns = res?.data || [];

        if (apiDesigns.length > lastDesignCountRef.current) {
          const latest = apiDesigns[0];

          if (latest?.imageUrl) {
            stopPolling();
            if (window.generationInterval) {
              clearInterval(window.generationInterval);
              window.generationInterval = null;
            }

            setGenerationProgress(100);
            setCurrentResult({
              url: latest.imageUrl,
              desc: latest.aiMessage || "AI Generated Garden Design",
              styleName: latest.styleName || null,
              elementsList: latest.elements || [],
              instruction: latest.description || ''
            });
            setIsGenerating(false);
            setShowGeneratedModal(true);

            const formatted = apiDesigns
              .filter(item => item.imageUrl !== "failed")
              .map((item, index) => ({
                id: item._id,
                image: item.imageUrl,
                title: item.title || `Design ${index + 1}`,
                timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                aiAnalysis: item.aiMessage || "AI Generated Design",
                styleName: item.styleName || null,
                elements: item.elements || [],
                description: item.description || null,
                fromApi: true,
              }));
            setDesigns(formatted);
            lastDesignCountRef.current = apiDesigns.length;

            notification.success({ message: "✅ Design Ready!" });
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const fetchSavedDesigns = async () => {
    if (!user) return;
    try {
      setLoadingSaved(true);
      const res = await apiService.get("/ai/get-landscape-designs");
      const apiDesigns = res?.data || [];

      lastDesignCountRef.current = apiDesigns.length;

      const formatted = apiDesigns
        .filter(item => item.imageUrl !== "failed")
        .map((item, index) => ({
          id: item._id,
          image: item.imageUrl,
          title: item.title || `Design ${index + 1}`,
          timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          aiAnalysis: item.aiMessage || "AI Generated Design",
          styleName: item.styleName || null,
          elements: item.elements || [],
          description: item.description || null,
          fromApi: true,
        }));

      setDesigns(formatted);
    } catch (err) {
      console.error("Failed to load designs", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (user) fetchSavedDesigns();
  }, [user]);

  const fetchLibraryDesigns = async () => {
    if (!user) return;
    try {
      setLoadingLibrary(true);
      const res = await apiService.get(`/ai/get-customer-liabrary?designType=landscaping`);
      const apiDesigns = res?.data || [];
      const formatted = apiDesigns.flatMap((d, index) => {
        if (d.images && Array.isArray(d.images)) {
          return d.images.map((img, i) => ({
            id: `${d._id}-${i}`,
            image: img,
            title: `Library Design ${index + 1}-${i + 1}`,
            timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now',
          }));
        }
        return [{ id: d._id || index, image: d.imageUrl || d.image, title: `Library Design ${index + 1}`, timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now' }];
      });
      setLibraryDesigns(formatted.filter(item => item.image).reverse());
    } catch (err) {
      console.error("Failed to load library", err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (user && (showLibraryModal || showUploadModal)) fetchLibraryDesigns();
  }, [user, showLibraryModal, showUploadModal]);

  const saveTitle = (id) => {
    if (!editTitle.trim()) return;
    setDesigns(prev => prev.map(d => d.id === id ? { ...d, title: editTitle } : d));
    setEditingId(null);
    notification.success({ message: "Design name updated!" });
  };

  const processUploadedFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await apiService.post("upload", formData);
      const uploadedUrl = uploadRes?.file?.url;
      if (isCustomerLoggedIn) {
        await apiService.post("ai/post-customer-liabrary", { designType: "landscaping", imageUrl: uploadedUrl });
      } else {
        const existing = JSON.parse(localStorage.getItem("guestLibrary")) || [];
        existing.push(uploadedUrl);
        localStorage.setItem("guestLibrary", JSON.stringify(existing));
      }
      setUploadedFile(file);
      setSelectedImage(uploadedUrl);
      setShowUploadModal(false);
      fetchLibraryDesigns();
      notification.success({ message: "File uploaded successfully" });
    } catch {
      notification.error({ message: "Upload Failed" });
    }
  };

  const handleSubscription = async () => {
    try {
      setIsRedirecting(true);

      const currentData = {
        selectedImage,
        selectedStyles,
        selectedElements,
        specificRequirement,
      };
      localStorage.setItem('xoto_pending_gen', JSON.stringify(currentData));

      const currentUrl = window.location.origin + location.pathname;
      
      const response = await apiService.post("stripe/create-checkout-session", {
        userId: user?._id || user?.id,
        currentUrl: currentUrl
      });
      
      const url = response?.data?.url || response?.url;

      if (url) {
        window.location.href = url;
      } else {
        notification.error({ message: "Failed to initialize payment." });
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      notification.error({ message: "Server connection failed!" });
    } finally {
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      window.history.replaceState(null, '', window.location.pathname);
      const savedData = localStorage.getItem('xoto_pending_gen');

      if (savedData) {
        const data = JSON.parse(savedData);
        setSelectedImage(data.selectedImage);
        setSelectedStyles(data.selectedStyles);
        setSelectedElements(data.selectedElements);
        setSpecificRequirement(data.specificRequirement);
        localStorage.removeItem('xoto_pending_gen');

        notification.info({
          message: "Processing Payment...",
          description: "Confirming with the server. Please wait...",
          duration: 0,
          key: "payment_verify"
        });

        let attempts = 0;
        const checkBackend = setInterval(async () => {
          attempts++;
          try {
            const res = await apiService.get(`/ai/get-user-generation-count?t=${new Date().getTime()}`); 

            if (res?.isPremium || res?.data?.isPremium) {
              clearInterval(checkBackend);
              setVerifiedPremium(true); 
              
              notification.destroy("payment_verify");
              notification.success({ 
                message: "Payment Confirmed! 🎉", 
                description: "You are now a Premium user. Starting generation!" 
              });

              executeDirectGeneration(data);
            } else if (attempts >= 30) {
              clearInterval(checkBackend);
              notification.destroy("payment_verify");
              notification.warning({ 
                message: "Verification Delayed", 
                description: "Payment successful but taking time to reflect. Try generating again." 
              });
            }
          } catch (err) {
            console.error("Verification failed", err);
          }
        }, 1000);
      }
    }
  }, []);

  const executeDirectGeneration = async (data) => {
    setIsGenerating(true);
    setGenerationProgress(5);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 3 + 1.5, 92));
    }, 550);
    window.generationInterval = progressInterval;

    const formData = new FormData();

    if (data.selectedImage?.startsWith('http')) {
      try {
        const res = await fetch(data.selectedImage);
        const blob = await res.blob();
        formData.append('gardenImage', new File([blob], "input.jpg", { type: blob.type || "image/jpeg" }));
      } catch (e) {
        console.error("Fetch failed", e);
      }
    }

    formData.append('styleName', data.selectedStyles.length > 0
      ? gardenStyles.find(s => s.value === data.selectedStyles[0])?.label || "Modern Garden"
      : "Modern Garden"
    );
    formData.append('elements',
      data.selectedElements.map(e => gardenElements.find(el => el.value === e)?.label).join(', ') || 'Natural Landscaping'
    );
    formData.append('description', data.specificRequirement || 'A professional landscaping design');

    try {
      await apiService.post("ai/generate-garden", formData);
      startPolling();
    } catch (error) {
      console.error("❌ Error:", error);
      notification.error({ message: "Failed to start generation" });
      setIsGenerating(false);
      clearInterval(progressInterval);
      stopPolling();
    }
  };

  const handleGenerateClick = () => {
    if (!selectedImage) {
      notification.warning({ message: 'Please upload a photo first' });
      return;
    }
    if (!isCustomerLoggedIn) {
      setPendingGeneration(true);
      setShowAuthModal(true);
      return;
    }

    const isUserPremium = user?.isPremium || verifiedPremium;

    if (!isUserPremium && designs.length >= 3) {
      setUpgradeMessage("You've reached your free limit of 3 images. Upgrade to Pro for unlimited designs! 🚀");
      setShowUpgradeModal(true);
      return;
    }

    generateAIDesigns();
  };

  const handleAuthSuccess = async (userData) => {
    setShowAuthModal(false);
    const guestImages = JSON.parse(localStorage.getItem("guestLibrary")) || [];
    if (guestImages.length > 0) {
      try {
        for (let img of guestImages) {
          await apiService.post("ai/post-customer-liabrary", { designType: "landscaping", imageUrl: img });
        }
        localStorage.removeItem("guestLibrary");
        notification.success({ message: "Your previous uploads added to library!" });
        fetchLibraryDesigns();
      } catch (err) {
        console.error("Auto library migration failed", err);
      }
    }
    if (pendingGeneration) {
      setPendingGeneration(false);
      generateAIDesigns();
    }
  };

  const generateAIDesigns = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(5);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 3 + 1.5, 92));
    }, 550);
    window.generationInterval = progressInterval;

    const formData = new FormData();

    if (uploadedFile) {
      formData.append('gardenImage', uploadedFile);
    } else if (selectedImage?.startsWith('http')) {
      try {
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        formData.append('gardenImage', new File([blob], "input.jpg", { type: blob.type || "image/jpeg" }));
      } catch (e) {
        console.error("Fetch failed", e);
      }
    }

    formData.append('styleName', selectedStyles.length > 0
      ? gardenStyles.find(s => s.value === selectedStyles[0])?.label || "Modern Garden"
      : "Modern Garden"
    );
    formData.append('elements',
      selectedElements.map(e => gardenElements.find(el => el.value === e)?.label).join(', ') || 'Natural Landscaping'
    );
    formData.append('description', specificRequirement || 'A professional landscaping design');

    try {
      await apiService.post("ai/generate-garden", formData);
      startPolling();
    } catch (error) {
      console.error("❌ Error:", error);
      notification.error({ message: "Failed to start generation" });
      setIsGenerating(false);
      clearInterval(progressInterval);
      stopPolling();
    }
  };

  const downloadImage = async (imageUrl) => {
    try {
      const key = imageUrl.split(".amazonaws.com/")[1];
      if (!key) { notification.error({ message: "Invalid Image URL" }); return; }
      await apiService.download(`/download-pdf?key=${encodeURIComponent(key)}`, `XOTO_Landscape_${Date.now()}.pdf`);
    } catch {
      notification.error({ message: "Download Failed", description: "PDF could not be generated." });
    }
  };

  const MobileTabItem = ({ icon: Icon, label, id, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full py-2 ${activeMobileTab === id ? 'text-purple-600' : 'text-gray-400'}`}>
      <Icon size={24} className={activeMobileTab === id ? 'fill-current' : ''} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FC] font-sans overflow-hidden">
      {/* --- DESKTOP SIDEBAR --- */}
      <div
        className="hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-300 z-50 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-sm hover:shadow-2xl overflow-hidden"
        style={{ width: isSidebarHovered ? '280px' : '88px' }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="h-24 flex items-center px-6 mb-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white rounded-full" />
              <div className="w-1 h-6 bg-white rounded-full" />
              <div className="w-1 h-4 bg-white rounded-full" />
            </div>
          </div>
          <span className={`ml-4 font-bold text-2xl tracking-tight transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            Xoto.AI
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div onClick={() => navigate('/')} className="flex items-center px-6 py-3.5 cursor-pointer hover:bg-gray-50 group relative">
            <div className="w-12 flex justify-center shrink-0">
              <Home size={26} className="text-gray-500 group-hover:text-gray-900" />
            </div>
            <span className={`ml-2 text-base font-medium whitespace-nowrap transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>Home</span>
          </div>
          <div className="flex items-center px-6 py-3.5 bg-purple-50 text-purple-700 cursor-pointer relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 rounded-r-full" />
            <div className="w-12 flex justify-center shrink-0"><Sparkles size={26} /></div>
            <span className={`ml-2 text-base font-medium whitespace-nowrap transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>AI Landscaping</span>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative lg:ml-[88px] transition-all duration-300 w-full">

        {/* --- LEFT: CONFIGURATION PANEL --- */}
        <div className="w-full lg:w-[460px] bg-white h-full overflow-y-auto p-4 lg:p-6 border-r border-gray-400 shrink-0 z-10 custom-scrollbar pb-24 lg:pb-6">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link to="/"><ArrowLeft className="text-gray-600" /></Link>
              <span className="font-bold text-lg">AI Planner</span>
            </div>
            {(user?.isPremium || verifiedPremium) && <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Pro ✨</div>}
          </div>

          <div className="hidden lg:flex rounded-2xl p-4 mb-8 justify-between items-center shadow-sm" style={{ backgroundColor: BRAND_PURPLE }}>
            <span className="font-bold text-lg text-white">Landscaping</span>
            {(user?.isPremium || verifiedPremium) && <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm border border-white/30">PRO</div>}
          </div>

          <div className="bg-[#F3F4F6] rounded-[24px] lg:rounded-[32px] h-[280px] lg:h-[320px] mb-6 lg:mb-8 relative overflow-hidden group border border-gray-100 transition-colors hover:border-purple-100">
            {selectedImage ? (
              <>
                <img src={selectedImage} className="w-full h-full object-cover" alt="Selected" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-red-500 transition-all shadow-md">
                  <X size={18} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="bg-white rounded-full p-4 lg:p-5 mb-4 shadow-sm">
                  <ImageIcon className="text-gray-300 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="font-bold text-gray-800 text-base lg:text-lg mb-2">Start with a photo</h3>
                <p className="text-gray-400 text-xs lg:text-sm text-center max-w-[280px] mb-6 leading-relaxed">Upload a photo of your garden to see the AI magic.</p>
                <button onClick={() => setShowUploadModal(true)} className="bg-[var(--color-primary)] text-white px-6 py-3 lg:px-8 lg:py-4 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl text-sm lg:text-base">
                  <Upload size={16} />Add a photo
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <button onClick={() => setShowStyleModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Sparkles className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" /></div>
              <span className="font-bold text-gray-700 text-sm lg:text-base">Style</span>
              <span className="bg-white border border-gray-200 text-gray-600 text-[10px] lg:text-xs mt-5 font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {selectedStyles.length > 0 ? gardenStyles.find(s => s.value === selectedStyles[0])?.label : 'Choose'}
              </span>
              {selectedStyles.length > 0 && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
            </button>
            
            <button onClick={() => setShowElementModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><LayoutDashboard className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" /></div>
              <span className="font-bold text-gray-700 text-sm lg:text-base">Elements</span>
              {/* Display selected elements instead of just "Selected" */}
              <div className="w-full mt-3">
                {selectedElements.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {getSelectedElementsLabels().slice(0, 3).map((label, idx) => (
                      <span key={idx} className="text-[10px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {label}
                      </span>
                    ))}
                    {getSelectedElementsLabels().length > 3 && (
                      <span className="text-[10px] font-medium text-gray-500">
                        +{getSelectedElementsLabels().length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="bg-white border border-gray-200 text-gray-600 text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Choose
                  </span>
                )}
              </div>
              {selectedElements.length > 0 && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
            </button>
          </div>

          <div className="bg-[#F3F4F6] rounded-2xl p-4 lg:p-5 mb-6 lg:mb-8 border border-transparent hover:border-gray-200">
            <span className="font-bold text-gray-800 text-sm lg:text-base block mb-2">Custom Instructions</span>
            <textarea
              className="w-full bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 resize-none"
              placeholder="e.g. A small pond in the corner..."
              rows={2}
              value={specificRequirement}
              onChange={(e) => setSpecificRequirement(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="w-full text-white font-bold text-base lg:text-lg h-14 lg:h-16 rounded-2xl flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-xl shadow-purple-200 active:scale-[0.98] disabled:opacity-70"
            style={{ backgroundColor: BRAND_PURPLE }}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin w-5 h-5" /><span>Designing...</span></>
            ) : (
              <><span>Generate Vision</span><div className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-normal backdrop-blur-sm border border-white/10"><Sparkles size={12} className="text-white" /></div></>
            )}
          </button>

          {/* Mobile Results */}
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
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          {editingId === d.id ? (
                            <div className="flex items-center gap-2 w-full pr-2">
                              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onPressEnter={() => saveTitle(d.id)} size="small" autoFocus />
                              <CheckCircle2 size={20} className="text-green-500 cursor-pointer" onClick={() => saveTitle(d.id)} />
                              <X size={20} className="text-red-500 cursor-pointer" onClick={() => setEditingId(null)} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 cursor-pointer group/title max-w-[80%]" onClick={() => { setEditingId(d.id); setEditTitle(d.title); }}>
                              <h4 className="font-bold text-sm text-gray-800 truncate">{d.title}</h4>
                              <Edit2 size={12} className="text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                            </div>
                          )}
                          <button onClick={() => { setCurrentResult({ url: d.image, desc: d.aiAnalysis, styleName: d.styleName, elementsList: d.elements, instruction: d.description }); setShowGeneratedModal(true); }} className="p-2 bg-gray-50 rounded-full shrink-0">
                            <ArrowRight size={16} className="text-purple-600" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">{d.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- RIGHT: RESULTS GALLERY (Desktop) --- */}
        <div className="hidden lg:block flex-1 bg-[#F8F9FC] p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Your Masterpieces</h1>
                <p className="text-gray-500 font-medium text-lg">AI-generated landscapes created by you.</p>
              </div>
              <Button type="default" onClick={() => setShowLibraryModal(true)} className="h-10 px-4 rounded-xl font-bold text-purple-700 border border-purple-200 hover:bg-purple-50">View Library</Button>
            </div>

            {loadingSaved ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <Spin tip="Loading..."><div style={{ height: 200 }} /></Spin>
              </div>
            ) : designs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-gray-200 rounded-[32px] bg-white/50">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6"><ImageIcon size={40} className="text-gray-300" /></div>
                <h3 className="text-xl font-bold text-gray-400">No designs yet</h3>
                <p className="text-gray-400 mt-2">Use the panel on the left to start.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                {designs.map(d => (
                  <Card key={d.id} hoverable className="rounded-[32px] overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 group" styles={{ body: { padding: 0 } }}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={d.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Design" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 backdrop-blur-[3px]">
                        <button onClick={() => downloadImage(d.image)} className="flex flex-col items-center gap-3 text-white hover:scale-110 transition-transform group/btn">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover/btn:bg-white/30 border border-white/30"><Download size={24} /></div>
                          <span className="text-xs font-bold tracking-widest uppercase">Download</span>
                        </button>
                      </div>
                      <div className="absolute top-5 left-5">
                        <Tag color="#5c039b" className="text-purple-700 font-bold border-none px-3 py-1.5 rounded-full shadow-lg">AI GENERATED</Tag>
                      </div>
                    </div>
                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-2">
                        {editingId === d.id ? (
                          <div className="flex items-center gap-2 w-full pr-4">
                            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onPressEnter={() => saveTitle(d.id)} size="small" autoFocus className="rounded-md" />
                            <CheckCircle2 size={20} className="text-green-500 cursor-pointer shrink-0" onClick={() => saveTitle(d.id)} />
                            <X size={20} className="text-red-500 cursor-pointer shrink-0" onClick={() => setEditingId(null)} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 cursor-pointer group/title max-w-[80%]" onClick={() => { setEditingId(d.id); setEditTitle(d.title); }}>
                            <h3 className="font-bold text-xl text-gray-900 truncate">{d.title}</h3>
                            <Edit2 size={14} className="text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                          </div>
                        )}
                        <button onClick={() => { setCurrentResult({ url: d.image, desc: d.aiAnalysis, styleName: d.styleName, elementsList: d.elements, instruction: d.description }); setShowGeneratedModal(true); }} className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors shrink-0">
                          <ArrowRight size={18} />
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{d.timestamp}</p>
                      {d.styleName && <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full mr-1">{d.styleName}</span>}
                      {d.elements?.slice(0, 2).map((el, i) => <span key={i} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-1">{el}</span>)}
                      {d.aiAnalysis && d.aiAnalysis !== "AI Generated Design" && <p className="text-gray-500 text-xs mt-3 line-clamp-2">{d.aiAnalysis}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around py-2 pb-safe-area">
        <MobileTabItem icon={Home} label="Home" id="home" onClick={() => navigate('/')} />
        <MobileTabItem icon={Sparkles} label="Create" id="create" onClick={() => setActiveMobileTab('create')} />
        <MobileTabItem icon={Compass} label="Explore" id="explore" onClick={() => {}} />
      </div>

      {/* --- MODALS --- */}
      <LeadGenerationModal visible={showAuthModal} onCancel={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />

      <Modal open={showUpgradeModal} footer={null} onCancel={() => setShowUpgradeModal(false)} width={500} centered bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
        <div className="p-8 text-center bg-gradient-to-b from-white to-purple-50">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-yellow-200">
            <Crown size={40} className="text-yellow-600" fill="currentColor" fillOpacity={0.2} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlock Limitless Creativity</h3>
          <p className="text-gray-500 mb-8 leading-relaxed px-4">{upgradeMessage || "You've reached your limit. Upgrade to Pro to continue designing."}</p>
          <div className="space-y-3">
            <Button 
              type="primary" 
              size="large" 
              block 
              loading={isRedirecting}
              className="h-12 text-base font-bold rounded-xl shadow-lg shadow-purple-200" 
              style={{ background: 'linear-gradient(135deg, #5C039B 0%, #8E2DE2 100%)', border: 'none' }} 
              onClick={handleSubscription}
            >
              View Upgrade Plans
            </Button>
            <Button type="text" block className="text-gray-400" onClick={() => setShowUpgradeModal(false)}>Maybe Later</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showGeneratedModal} footer={null} onCancel={() => setShowGeneratedModal(false)} width={1000} centered bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
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
              <Paragraph className="text-gray-600 leading-relaxed text-sm lg:text-base">{currentResult.desc || "No description provided."}</Paragraph>
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-bold text-sm text-purple-700 mb-2">Your Preferences</h4>
                {currentResult.styleName && <p className="text-xs text-gray-700 mb-1"><strong>Style:</strong> {currentResult.styleName}</p>}
                {currentResult.elementsList?.length > 0 && <p className="text-xs text-gray-700 mb-1"><strong>Elements:</strong> {currentResult.elementsList.join(", ")}</p>}
                {currentResult.instruction && <p className="text-xs text-gray-700"><strong>Instruction:</strong> {currentResult.instruction}</p>}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t mt-4">
              <Button type="primary" block size="large" className="h-12 rounded-2xl font-bold" style={{ background: BRAND_PURPLE }} onClick={() => downloadImage(currentResult.url)}>Download Render</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showUploadModal} footer={null} onCancel={() => setShowUploadModal(false)} centered width={600} title="Select Source Canvas" bodyStyle={{ padding: '1rem' }}>
        <div className="p-2">
          {libraryDesigns.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Your Library Designs</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                {libraryDesigns.map(d => (
                  <div key={d.id} onClick={() => { setSelectedImage(d.image); setShowUploadModal(false); }} className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm">
                    <img src={d.image} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Suggested Designs</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
            {dummySpaceImages.map(img => (
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

      <Modal open={showStyleModal} footer={null} onCancel={() => setShowStyleModal(false)} width={800} centered title="Choose Landscape Style" bodyStyle={{ padding: '0.5rem' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {gardenStyles.map(s => (
            <div key={s.value} onClick={() => { setSelectedStyles([s.value]); setShowStyleModal(false); }} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedStyles.includes(s.value) ? 'border-purple-600 shadow-lg' : 'border-transparent hover:border-purple-100 hover:shadow-md'}`}>
              <img src={s.img} className="h-32 lg:h-40 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 lg:p-4"><p className="text-white font-bold text-sm lg:text-base m-0 truncate">{s.label}</p></div>
              {selectedStyles.includes(s.value) && <div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg"><CheckCircle2 size={14} /></div>}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showElementModal} footer={null} onCancel={() => setShowElementModal(false)} width={800} centered title="Add Landscape Features" bodyStyle={{ padding: '0.5rem' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {gardenElements.map(el => (
            <div key={el.value} onClick={() => setSelectedElements(prev => prev.includes(el.value) ? prev.filter(x => x !== el.value) : [...prev, el.value])} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedElements.includes(el.value) ? 'border-green-500 bg-green-50 shadow-lg' : 'border-transparent hover:border-green-100 hover:shadow-md'}`}>
              <img src={el.img} className="h-28 lg:h-32 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="p-2 lg:p-3 text-center bg-white/90 backdrop-blur-sm"><p className="font-bold text-xs lg:text-sm m-0 truncate">{el.label}</p></div>
              {selectedElements.includes(el.value) && <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg"><Check size={14} /></div>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end pt-4 border-t">
          <Button type="primary" size="large" onClick={() => setShowElementModal(false)} className="rounded-xl px-8 lg:px-10 h-12" style={{ background: BRAND_PURPLE }}>Apply Selections</Button>
        </div>
      </Modal>

      <Modal open={showLibraryModal} footer={null} onCancel={() => setShowLibraryModal(false)} width={800} centered title="My Library" bodyStyle={{ padding: '1rem' }}>
        {loadingLibrary ? (
          <div className="flex justify-center items-center h-[50vh]"><Spin size="large" tip="Loading your library..." /></div>
        ) : libraryDesigns.length === 0 ? (
          <Empty description="No designs in your library yet." />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {libraryDesigns.map(d => (
              <Card key={d.id} hoverable className="rounded-2xl overflow-hidden shadow-sm" styles={{ body: { padding: 0 } }}>
                <img src={d.image} alt={d.title} className="w-full h-40 object-cover" />
                <div className="p-3 flex justify-between items-center">
                  <div><h4 className="font-bold text-sm text-gray-800">{d.title}</h4><span className="text-xs text-gray-400">{d.timestamp}</span></div>
                  <button onClick={() => { setSelectedImage(d.image); setShowLibraryModal(false); }} className="p-2 bg-gray-50 rounded-full"><ArrowRight size={16} className="text-purple-600" /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Divider>OR Upload Your Own</Divider>
        <input type="file" id="library-file-up" className="hidden" accept="image/*" onChange={(e) => processUploadedFile(e.target.files[0])} />
        <Button block icon={<Upload size={16} />} className="h-12 rounded-xl font-semibold border-dashed text-sm" onClick={() => document.getElementById('library-file-up').click()}>Browse Local Files</Button>
      </Modal>

      {/* GENERATION LOADING OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <div className="relative mb-10 w-40 h-40 flex items-center justify-center">
            <div className="absolute -inset-12 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
          </div>
          <div className="text-center mb-8 px-4 max-w-md">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Creating Your Garden Vision</h2>
            <p className="text-gray-500 mt-3 text-lg">AI is designing your perfect outdoor space...</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-md w-full border border-purple-100 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4">Your Selections</h4>
            {selectedStyles.length > 0 && <p className="text-sm text-gray-700 mb-2"><strong>Style:</strong> {gardenStyles.find(s => s.value === selectedStyles[0])?.label}</p>}
            {selectedElements.length > 0 && <p className="text-sm text-gray-700 mb-2"><strong>Elements:</strong> {selectedElements.map(e => gardenElements.find(el => el.value === e)?.label).join(", ")}</p>}
            {specificRequirement && <p className="text-sm text-gray-700"><strong>Instruction:</strong> {specificRequirement}</p>}
          </div>
          <div className="w-full max-w-xs">
            <Progress percent={progress} strokeColor={{ "0%": "#8E2DE2", "100%": BRAND_PURPLE }} status="active" strokeWidth={12} showInfo={false} />
            <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              <span>{title}</span><span>{progress}%</span>
            </div>
            <div className="mt-1 text-center text-xs text-gray-400">{subtitle}</div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--color-primary); border-radius: 9999px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--color-primary) transparent; }
      `}</style>
    </div>
  );
};

export default AIPlanner;