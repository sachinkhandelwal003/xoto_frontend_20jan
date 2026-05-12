import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import img1 from "../../../assets/img/interior/interior1.jpg"
import img2 from "../../../assets/img/interior/interior2.jpg"
import img3 from "../../../assets/img/interior/interior3.jpg"

import {
  Home, LayoutDashboard, Compass,
  Image as ImageIcon, Sparkles, Upload,
  X, ArrowRight, CheckCircle2,
  Download, Crown, Loader2, ArrowLeft, Check, Edit2
} from 'lucide-react';
import {
  Button, Modal, Progress, Card, Tag,
  notification, Typography, Divider, Spin, Empty, Input 
} from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage';


const { Paragraph } = Typography;

// --- Constants ---
const BRAND_PURPLE = "#5C039B";

// --- Mock Data ---
const dummySpaceImages = [
  { id: 1, url: img1 },
  { id: 2, url: img2 },
  { id: 3, url: img3 },
];

const interStyles = [
  { value: 'country', label: 'Modern Country', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Modern_Country.webp' },
  { value: 'scandinavian', label: 'Scandinavian', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Scandinavian.webp' },
  { value: 'modern', label: 'Modern', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Modern.webp' },
  { value: 'minimalism', label: 'Minimalism', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Minimalism.webp' },
  { value: 'bohemian', label: 'Bohemian', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Bohemian.webp' },
  { value: 'artdeco', label: 'Art Deco', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Interior_Style/Popular/Art_Deco.webp' },
];

const interElements = [
  { value: 'shelving', label: 'Shelving', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Shelving.webp' },
  { value: 'coffee_table', label: 'Coffee Table', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Coffee_Table.webp' },
  { value: 'rug', label: 'Rug', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Rug.webp' },
  { value: 'armchair', label: 'Armchair', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Armchair.webp' },
  { value: 'plants', label: 'Plants', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Plants.webp' },
  { value: 'sofa', label: 'Sofa', img: 'https://d38b044pevnwc9.cloudfront.net/site/promeai/config/text2img/scene/Interior_Design/Scene_Elements/Living_Room/Sofa.webp' },
];

const roomTypes = [
  { value: 'living', label: 'Living Room', img: 'https://gstatic.ideal.house/interior/Home/Living_Room.webp'    },
  { value: 'bedroom', label: 'Bedroom', img: 'https://gstatic.ideal.house/interior/Home/Bed_Room.webp' },
  { value: 'kitchen', label: 'Kitchen', img: 'https://gstatic.ideal.house/interior/Home/Kitchen.webp' },
  { value: 'bathroom', label: 'Bathroom', img: 'https://gstatic.ideal.house/interior/Home/Bath_Room.webp' },
  { value: 'dining', label: 'Dining Room', img: 'https://gstatic.ideal.house/interior/Home/Dining_Room.webp' }, 
  { value: 'office', label: 'Home Office', img: 'https://gstatic.ideal.house/interior/Home/Home_Office.webp' },
];

const getProgressText = (progress) => {
  if (progress < 20) {
    return {
      title: "Reading Your Inputs",
      subtitle: "Understanding your preferences and space details…",
    };
  }
  if (progress < 40) {
    return {
      title: "Setting the Scene",
      subtitle: "Creating the base layout for your interior image…",
    };
  }
  if (progress < 60) {
    return {
      title: "Adding Elements",
      subtitle: "Placing furniture, decor, and features…",
    };
  }
  if (progress < 80) {
    return {
      title: "Enhancing Visual Details",
      subtitle: "Adjusting lighting, textures, and colors…",
    };
  }
  if (progress < 90) {
    return {
      title: "Rendering Your Interior Image",
      subtitle: "Finalizing composition and details…",
    };
  }
  return {
    title: "Generating Final Design",
    subtitle: "Generating your final Interior design…",
  };
};

const InteriorPlanner = () => {

  const pollingRef = useRef(null);
  const lastDesignCountRef = useRef(0);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [specificRequirement, setSpecificRequirement] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);

  // Designs State (New + Fetched)
  const [designs, setDesigns] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Edit Title State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const progress = Math.floor(generationProgress);
  const { title, subtitle } = getProgressText(progress);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const [libraryDesigns, setLibraryDesigns] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Modals & Payment
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [verifiedPremium, setVerifiedPremium] = useState(false);

  // UI & Results
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [currentResult, setCurrentResult] = useState({ url: '', desc: '', roomType: null, styleName: null, elementsList: [], instruction: '' });

  // Mobile Tabs
  const [activeMobileTab, setActiveMobileTab] = useState('create');

  const isCustomerLoggedIn = useMemo(() => {
    return user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin');
  }, [user]);

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
        const res = await apiService.get("/ai/get-interior-designs");
        const apiDesigns = res?.data || [];

        if (apiDesigns.length > lastDesignCountRef.current) {
          const latest = apiDesigns[0];

          if (latest?.imageUrl && latest.imageUrl !== "failed") {
            stopPolling();

            if (window.generationInterval) {
              clearInterval(window.generationInterval);
              window.generationInterval = null;
            }

            setGenerationProgress(100);
            setCurrentResult({
              url: latest.imageUrl,
              desc: latest.aiMessage || "AI Generated Interior",
              roomType: latest.roomType || null,
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
                aiAnalysis: item.aiMessage || "AI Generated Interior",
                roomType: item.roomType || null,
                styles: item.styleName ? [item.styleName] : [],
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

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const fetchSavedDesigns = async () => {
    if (!user) return;
    try {
      setLoadingSaved(true);
      const res = await apiService.get("/ai/get-interior-designs");
      const apiDesigns = res?.data || [];

      lastDesignCountRef.current = apiDesigns.length;

      const formatted = apiDesigns
        .filter(item => item.imageUrl !== "failed")
        .map((item, index) => ({
          id: item._id,
          image: item.imageUrl,
          title: item.title || `Design ${index + 1}`,
          timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          aiAnalysis: item.aiMessage || "AI Generated Interior",
          roomType: item.roomType || null,
          styles: item.styleName ? [item.styleName] : [],
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
    if (user) {
      fetchSavedDesigns();
    }
  }, [user]);

  const fetchLibraryDesigns = async () => {
    if (!user) return;
    try {
      setLoadingLibrary(true);
      const res = await apiService.get(`/ai/get-customer-liabrary?designType=interior`);
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
        else {
          return [{
            id: d._id || index,
            image: d.imageUrl || d.image,
            title: `Library Design ${index + 1}`,
            timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now',
          }];
        }
      });
  
      const validDesigns = formatted.filter(item => item.image);
      setLibraryDesigns(validDesigns.reverse());
    } catch (err) {
      console.error("Failed to load library", err);
    } finally {
      setLoadingLibrary(false);
    }
  };
  
  useEffect(() => {
    if (user && (showLibraryModal || showUploadModal)) {
      fetchLibraryDesigns();
    }
  }, [user, showLibraryModal, showUploadModal]);

  const saveTitle = (id) => {
    if (!editTitle.trim()) return;
    setDesigns(prev => prev.map(d => d.id === id ? { ...d, title: editTitle } : d));
    setEditingId(null);
    notification.success({ message: "Design name updated!" });
  };

  const processUploadedFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      notification.error({ message: "Please upload a valid image file." });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await apiService.post("upload", formData);
      const uploadedUrl = uploadRes?.file?.url;

      if (!uploadedUrl) throw new Error("Image upload failed");

      if (isCustomerLoggedIn) {
        await apiService.post("ai/post-customer-liabrary", {
          designType: "interior",
          imageUrl: uploadedUrl,
        });
        fetchLibraryDesigns();
      } 
      else {
        const existing = JSON.parse(localStorage.getItem("guestLibrary_interior")) || [];
        existing.push(uploadedUrl);
        localStorage.setItem("guestLibrary_interior", JSON.stringify(existing));
      }

      setUploadedFile(file);
      setSelectedImage(uploadedUrl);
      setShowUploadModal(false);
      notification.success({ message: "File uploaded successfully" });
    } catch (error) {
      console.error("Upload process failed:", error);
      notification.error({ message: "Upload Failed", description: error?.message || "Could not upload image." });
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
        selectedRoomType
      };
      localStorage.setItem('xoto_pending_gen_interior', JSON.stringify(currentData));

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
      const savedData = localStorage.getItem('xoto_pending_gen_interior');

      if (savedData) {
        const data = JSON.parse(savedData);
        setSelectedImage(data.selectedImage);
        setSelectedStyles(data.selectedStyles);
        setSelectedElements(data.selectedElements);
        setSpecificRequirement(data.specificRequirement);
        setSelectedRoomType(data.selectedRoomType);
        localStorage.removeItem('xoto_pending_gen_interior');

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
        formData.append('image', new File([blob], "input.jpg", { type: blob.type || "image/jpeg" }));
      } catch (e) {
        console.error("Fetch failed", e);
        formData.append('imageUrl', data.selectedImage);
      }
    }

    formData.append('styleName', data.selectedStyles?.length > 0 ? interStyles.find(s => s.value === data.selectedStyles[0])?.label : 'Modern');
    formData.append('elements', data.selectedElements?.length > 0 ? data.selectedElements.map(e => interElements.find(el => el.value === e)?.label).join(', ') : 'Sofa, Coffee Table');
    formData.append('description', data.specificRequirement || 'A professional interior design');
    formData.append('roomType', data.selectedRoomType ? roomTypes.find(r => r.value === data.selectedRoomType)?.label : 'Living Room');

    try {
      await apiService.post('/ai/generate-interior', formData);
      startPolling(); 
    } catch (error) {
      console.error("❌ Error:", error);
      notification.error({ message: "Failed to start generation" });
      setIsGenerating(false);
      clearInterval(progressInterval);
      stopPolling();
    }
  };

  const handleGenerateClick = async () => {
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
      setShowUpgradeModal(true);
      return; 
    }

    generateAIDesigns(user);
  };

  const generateAIDesigns = async (currentUser) => {
    if (!uploadedFile && !selectedImage) {
      notification.warning({ message: 'Please select or upload an image first' });
      return;
    }
    setIsGenerating(true);
    setGenerationProgress(5);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 3 + 1.5, 92));
    }, 550);
    window.generationInterval = progressInterval;

    const formData = new FormData();

    if (uploadedFile) {
      formData.append('image', uploadedFile);
    } else if (selectedImage) {
      try {
        const response = await fetch(selectedImage);
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        formData.append('image', new File([blob], 'input_image.jpg', { type: blob.type || 'image/jpeg' }));
      } catch (err) {
        if (selectedImage.startsWith('http')) {
          formData.append('imageUrl', selectedImage);
        } else {
          notification.error({ message: 'Image load failed. Please re-upload.' });
          setIsGenerating(false);
          clearInterval(progressInterval);
          return;
        }
      }
    }

    formData.append('styleName', selectedStyles.length > 0 ? interStyles.find(s => s.value === selectedStyles[0])?.label : 'Modern');
    formData.append('elements', selectedElements.length > 0 ? selectedElements.map(e => interElements.find(el => el.value === e)?.label).join(', ') : 'Sofa, Coffee Table');
    formData.append('description', specificRequirement || 'A professional interior design');
    formData.append('roomType', selectedRoomType ? roomTypes.find(r => r.value === selectedRoomType)?.label : 'Living Room');

    try {
      await apiService.post('/ai/generate-interior', formData);
      
      startPolling(); 
    } catch (error) {
      console.error('Generation failed:', error);
      notification.error({ message: 'Generation Error' });
      setIsGenerating(false);
      clearInterval(progressInterval);
      stopPolling();
    }
  };

  const handleAuthSuccess = async (userData) => {
    setShowAuthModal(false);

    const guestImages = JSON.parse(localStorage.getItem("guestLibrary_interior")) || [];

    if (guestImages.length > 0) {
      try {
        for (let img of guestImages) {
          await apiService.post("ai/post-customer-liabrary", {
            designType: "interior",
            imageUrl: img,
          });
        }
        localStorage.removeItem("guestLibrary_interior");
        fetchLibraryDesigns();
        notification.success({ message: "Your previous uploads added to library!" });
      } catch (err) {
        console.error("Guest migration failed:", err);
      }
    }

    if (pendingGeneration) {
      setPendingGeneration(false);
      generateAIDesigns(userData);
    }
  };

  const downloadImage = async (imageUrl, name) => {
    try {
      const key = imageUrl.split(".amazonaws.com/")[1];
      if (!key) {
        notification.error({ message: "Invalid Image URL" });
        return;
      }
      await apiService.download(`/download-pdf?key=${encodeURIComponent(key)}`, `${name}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Download error:", error);
      notification.error({ message: "Download Failed", description: "PDF could not be generated." });
    }
  };

  const MobileTabItem = ({ icon: Icon, label, id, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 ${activeMobileTab === id ? 'text-purple-600' : 'text-gray-400'}`}
    >
      <Icon size={24} className={activeMobileTab === id ? 'fill-current' : ''} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  // Helper function to get selected elements labels
  const getSelectedElementsLabels = () => {
    if (selectedElements.length === 0) return null;
    return selectedElements.map(e => interElements.find(el => el.value === e)?.label).filter(Boolean);
  };

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FC] font-sans overflow-hidden">

      {/* DESKTOP SIDEBAR */}
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
          <span
            className={`ml-4 font-bold text-2xl tracking-tight transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
          >
            Xoto.AI
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <div onClick={() => navigate('/')} className="flex items-center px-6 py-3.5 cursor-pointer hover:bg-gray-50 group relative">
            <div className="w-12 flex justify-center shrink-0">
              <Home size={26} className="text-gray-500 group-hover:text-gray-900" />
            </div>
            <span className={`ml-2 text-base font-medium whitespace-nowrap transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              Home
            </span>
          </div>

          <div className="flex items-center px-6 py-3.5 bg-purple-50 text-purple-700 cursor-pointer relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 rounded-r-full" />
            <div className="w-12 flex justify-center shrink-0">
              <Sparkles size={26} />
            </div>
            <span className={`ml-2 text-base font-medium whitespace-nowrap transition-all duration-300 ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              AI Interior
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative lg:ml-[88px] transition-all duration-300 w-full">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[460px] bg-white h-full overflow-y-auto p-4 lg:p-6 border-r border-gray-400 shrink-0 z-10 custom-scrollbar pb-24 lg:pb-6">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link to="/"><ArrowLeft className="text-gray-600" /></Link>
              <span className="font-bold text-lg">AI Planner</span>
            </div>
            {(user?.isPremium || verifiedPremium) && <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Pro ✨</div>}
          </div>

          <div className="hidden lg:flex rounded-2xl p-4 mb-8 justify-between items-center shadow-sm" style={{ backgroundColor: BRAND_PURPLE }}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-white">Interior</span>
            </div>
            {(user?.isPremium || verifiedPremium) && <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm border border-white/30">PRO</div>}
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
                  Upload a photo of your room to see the AI magic.
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

          <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <button onClick={() => setShowRoomTypeModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Home className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="font-bold text-gray-700 text-sm lg:text-base">Room Type</span>
              <span className="bg-white border border-gray-200 mt-5 text-gray-600 text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {selectedRoomType ? roomTypes.find(r => r.value === selectedRoomType)?.label : 'Choose'}
              </span>
              {selectedRoomType && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
            </button>

            <button onClick={() => setShowStyleModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="font-bold text-gray-700 text-sm lg:text-base">Style</span>
              <span className="bg-white border border-gray-200 text-gray-600 mt-5 text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {selectedStyles.length > 0 ? interStyles.find(s => s.value === selectedStyles[0])?.label : 'Choose'}
              </span>
              {selectedStyles.length > 0 && <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle2 size={16} /></div>}
            </button>

            <button onClick={() => setShowElementModal(true)} className="bg-[#F3F4F6] hover:bg-gray-100 transition-colors rounded-[20px] lg:rounded-[24px] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 aspect-square relative group">
              <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <LayoutDashboard className="text-gray-500 w-5 h-5 lg:w-6 lg:h-6" />
              </div>
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
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800 text-sm lg:text-base">Custom Instructions</span>
            </div>
            <textarea
              className="w-full bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 resize-none"
              placeholder="e.g. A modern living room with warm lighting..."
              rows={2}
              value={specificRequirement}
              onChange={(e) => setSpecificRequirement(e.target.value)}
            />
          </div>

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

          {/* MOBILE RESULTS PREVIEW WITH EDIT TITLE */}
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
                          
                          {/* Title Edit Logic */}
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

                          {/* Details Button */}
                          {editingId !== d.id && (
                            <button onClick={() => {
                              setCurrentResult({ url: d.image, desc: d.aiAnalysis, roomType: d.roomType, styleName: d.styles?.[0] || null, elementsList: d.elements || [], instruction: d.description || '' });
                              setShowGeneratedModal(true);
                            }} className="p-2 bg-gray-50 rounded-full shrink-0">
                              <ArrowRight size={16} className="text-purple-600" />
                            </button>
                          )}
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

        {/* RIGHT: RESULTS GALLERY (Desktop Only) */}
        <div className="hidden lg:block flex-1 bg-[#F8F9FC] p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Your Masterpieces</h1>
                <p className="text-gray-500 font-medium text-base md:text-lg">AI-generated interiors created by you.</p>
              </div>
              <div className="flex md:justify-end">
                <Button type="default" onClick={() => setShowLibraryModal(true)} className="h-10 px-5 rounded-xl font-bold text-purple-700 border border-purple-200 hover:bg-purple-50 transition">
                  View Library
                </Button>
              </div>
            </div>

            {/* FETCHING SAVED DESIGNS LOGIC */}
            {loadingSaved ? (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                   <Spin size="large" tip="Loading your designs..." />
                </div>
            ) : designs.length === 0 ? (
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
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[3px]">
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

                    <div className="p-6 flex justify-between items-center relative">
                      <div className="w-[80%]">
                        {/* Title Edit Logic */}
                        <div className="flex items-center gap-2 mb-1">
                          {editingId === d.id ? (
                             <div className="flex items-center gap-2 w-full pr-4">
                               <Input 
                                 value={editTitle} 
                                 onChange={(e) => setEditTitle(e.target.value)} 
                                 onPressEnter={() => saveTitle(d.id)} 
                                 size="small" autoFocus className="rounded-md"
                               />
                               <CheckCircle2 size={20} className="text-green-500 cursor-pointer shrink-0" onClick={() => saveTitle(d.id)} />
                               <X size={20} className="text-red-500 cursor-pointer shrink-0" onClick={() => setEditingId(null)} />
                             </div>
                          ) : (
                             <div className="flex items-center gap-2 cursor-pointer group/title w-full" onClick={() => { setEditingId(d.id); setEditTitle(d.title); }}>
                               <h3 className="font-bold text-xl text-gray-900 truncate">{d.title}</h3>
                               <Edit2 size={14} className="text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                             </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{d.timestamp}</p>
                      </div>

                      {editingId !== d.id && (
                        <button 
                          onClick={() => {
                            setCurrentResult({ 
                              url: d.image, 
                              desc: d.aiAnalysis, 
                              roomType: d.roomType, 
                              styleName: d.styles?.[0] || null, 
                              elementsList: d.elements || [], 
                              instruction: d.description || '' 
                            });
                            setShowGeneratedModal(true);
                          }}
                          className="p-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 hover:scale-110 transition-all shrink-0"
                          title="View Details"
                        >
                          <ArrowRight size={20} />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around py-2 pb-safe-area">
        <MobileTabItem icon={Home} label="Home" id="home" onClick={() => navigate('/')} />
        <MobileTabItem icon={Sparkles} label="Create" id="create" onClick={() => setActiveMobileTab('create')} />
        <MobileTabItem icon={Compass} label="Explore" id="explore" onClick={() => {}} />
      </div>

      {/* MODALS */}
      <LeadGenerationModal visible={showAuthModal} onCancel={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />

      <Modal open={showUpgradeModal} footer={null} onCancel={() => setShowUpgradeModal(false)} width={500} centered bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
        <div className="p-8 text-center bg-gradient-to-b from-white to-purple-50">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-yellow-200">
            <Crown size={40} className="text-yellow-600" fill="currentColor" fillOpacity={0.2} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlock Limitless Creativity</h3>
          <p className="text-gray-500 mb-8 leading-relaxed px-4">You've reached your free limit of 3 images. Upgrade to Pro for unlimited designs! 🚀</p>
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

      <Modal open={showGeneratedModal} footer={null} onCancel={() => setShowGeneratedModal(false)} width={1000} centered bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }} style={{ maxWidth: '95vw' }}>
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
              
              {/* User Preferences Block */}
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-bold text-sm text-purple-700 mb-2">
                  Your Preferences
                </h4>

                {currentResult.roomType && (
                  <p className="text-xs text-gray-700 mb-1">
                    <strong>Room Type:</strong> {currentResult.roomType}
                  </p>
                )}

                {currentResult.styleName && (
                  <p className="text-xs text-gray-700 mb-1">
                    <strong>Style:</strong> {currentResult.styleName}
                  </p>
                )}

                {currentResult.elementsList?.length > 0 && (
                  <p className="text-xs text-gray-700 mb-1">
                    <strong>Elements:</strong> {currentResult.elementsList.join(", ")}
                  </p>
                )}

                {currentResult.instruction && (
                  <p className="text-xs text-gray-700">
                    <strong>Instruction:</strong> {currentResult.instruction}
                  </p>
                )}
              </div>

            </div>
            <div className="space-y-3 pt-4 border-t mt-4">
              <Button type="primary" block size="large" className="h-12 rounded-2xl font-bold" style={{ background: BRAND_PURPLE }} onClick={() => downloadImage(currentResult.url, 'Xoto-Vision')}>
                Download Render
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showUploadModal}
        footer={null}
        onCancel={() => setShowUploadModal(false)}
        centered
        width={600}
        title="Select Source Canvas"
        bodyStyle={{ padding: '1rem' }}
      >
        <div className="p-2">
          {/* Library Designs */}
          {libraryDesigns.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Your Library Designs</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                {libraryDesigns.map(d => (
                  <div
                    key={d.id}
                    onClick={() => { setSelectedImage(d.image); setShowUploadModal(false); }}
                    className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm"
                  >
                    <img src={d.image} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
      
          {/* Dummy Space Images */}
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Suggested Designs</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
            {dummySpaceImages.map(img => (
              <div
                key={img.id}
                onClick={() => { setSelectedImage(img.url); setShowUploadModal(false); }}
                className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm"
              >
                <img src={img.url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
      
          <Divider>OR UPLOAD YOUR OWN</Divider>
      
          <input
            type="file"
            id="file-up"
            className="hidden"
            accept="image/*"
            onChange={(e) => processUploadedFile(e.target.files[0])}
          />
      
          <Button
            block
            icon={<Upload size={16} />}
            className="h-12 rounded-xl font-semibold border-dashed text-sm"
            onClick={() => document.getElementById('file-up').click()}
          >
            Browse Local Files
          </Button>
        </div>
      </Modal>

      <Modal open={showStyleModal} footer={null} onCancel={() => setShowStyleModal(false)} width={800} centered title="Choose Interior Style" bodyStyle={{ padding: '0.5rem' }} style={{ maxWidth: '95vw' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {interStyles.map(s => (
            <div key={s.value} onClick={() => { setSelectedStyles([s.value]); setShowStyleModal(false); }} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedStyles.includes(s.value) ? 'border-purple-600 shadow-lg' : 'border-transparent hover:border-purple-100 hover:shadow-md'}`}>
              <img src={s.img} className="h-32 lg:h-40 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 lg:p-4">
                <p className="text-white font-bold text-sm lg:text-base m-0 truncate">{s.label}</p>
              </div>
              {selectedStyles.includes(s.value) && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={showElementModal} footer={null} onCancel={() => setShowElementModal(false)} width={800} centered title="Add Interior Elements" bodyStyle={{ padding: '0.5rem' }} style={{ maxWidth: '95vw' }}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {interElements.map(el => (
            <div key={el.value} onClick={() => { setSelectedElements(prev => prev.includes(el.value) ? prev.filter(x => x !== el.value) : [...prev, el.value]); }} className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${selectedElements.includes(el.value) ? 'border-green-500 bg-green-50 shadow-lg' : 'border-transparent hover:border-green-100 hover:shadow-md'}`}>
              <img src={el.img} className="h-28 lg:h-32 w-full object-cover transition-transform group-hover:scale-110" />
              <div className="p-2 lg:p-3 text-center bg-white/90 backdrop-blur-sm">
                <p className="font-bold text-xs lg:text-sm m-0 truncate">{el.label}</p>
              </div>
              {selectedElements.includes(el.value) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                  <Check size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end pt-4 border-t">
          <Button type="primary" size="large" onClick={() => setShowElementModal(false)} className="rounded-xl px-8 lg:px-10 h-12" style={{ background: BRAND_PURPLE }}>
            Apply Selections
          </Button>
        </div>
      </Modal>

      <Modal
        open={showLibraryModal}
        footer={null}
        onCancel={() => setShowLibraryModal(false)}
        width={800}
        centered
        title="My Library"
        bodyStyle={{ padding: '1rem' }}
      >
        {loadingLibrary ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Spin size="large" tip="Loading your library..." />
          </div>
        ) : libraryDesigns.length === 0 ? (
          <Empty description="No designs in your library yet." />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {libraryDesigns.map(d => (
              <Card
                key={d.id}
                hoverable
                className="rounded-2xl overflow-hidden shadow-sm"
                bodyStyle={{ padding: 0 }}
              >
                <img
                  src={d.image}
                  alt={d.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{d.title}</h4>
                    <span className="text-xs text-gray-400">{d.timestamp}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(d.image);
                      setShowLibraryModal(false);
                    }}
                    className="p-2 bg-gray-50 rounded-full"
                  >
                    <ArrowRight size={16} className="text-purple-600" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      
        <Divider>OR Upload Your Own</Divider>
      
        <input
          type="file"
          id="library-file-up"
          className="hidden"
          accept="image/*"
          onChange={(e) => processUploadedFile(e.target.files[0])}
        />
      
        <Button
          block
          icon={<Upload size={16} />}
          className="h-12 rounded-xl font-semibold border-dashed text-sm"
          onClick={() => document.getElementById('library-file-up').click()}
        >
          Browse Local Files
        </Button>
      </Modal>

      <Modal
        open={showRoomTypeModal}
        footer={null}
        onCancel={() => setShowRoomTypeModal(false)}
        width={800}
        centered
        title="Choose Room Type"
        bodyStyle={{ padding: '0.5rem' }}
        style={{ maxWidth: '95vw' }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 p-2">
          {roomTypes.map((room) => (
            <div
              key={room.value}
              onClick={() => {
                setSelectedRoomType(room.value);
                setShowRoomTypeModal(false);
              }}
              className={`relative cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all
                ${
                  selectedRoomType === room.value
                    ? 'border-purple-600 shadow-lg'
                    : 'border-transparent hover:border-purple-100 hover:shadow-md'
                }`}
            >
              {/* IMAGE */}
              <img
                src={room.img}
                alt={room.label}
                className="h-32 lg:h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* LABEL OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 lg:p-4">
                <p className="text-white font-bold text-sm lg:text-base m-0 truncate">
                  {room.label}
                </p>
              </div>

              {/* CHECK ICON */}
              {selectedRoomType === room.value && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* GENERATION LOADING OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/90 lg:bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 p-4">
          <div className="relative mb-8 lg:mb-12 w-32 h-32 lg:w-48 lg:h-48 mx-auto flex items-center justify-center">
            <div className="absolute -inset-6 lg:-inset-8 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
          </div>
          <div className="text-center mb-6 lg:mb-8 px-4">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {isCustomerLoggedIn ? 'Creating Another Masterpiece' : 'Xoto AI is Sculpting'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium text-sm lg:text-base max-w-md mx-auto">
              Reimagining your interior space with intelligent design...
            </p>
          </div>

          {/* User Selection Preview Block during Loading */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 mb-6 max-w-md w-full border border-purple-100 shadow-sm text-left">
            <h4 className="font-bold text-gray-800 text-sm mb-3">
              Your Selections
            </h4>

            {selectedRoomType && (
              <p className="text-xs text-gray-600 mb-1">
                <strong>Room Type:</strong>{" "}
                {roomTypes.find(r => r.value === selectedRoomType)?.label}
              </p>
            )}

            {selectedStyles.length > 0 && (
              <p className="text-xs text-gray-600 mb-1">
                <strong>Style:</strong>{" "}
                {interStyles.find(s => s.value === selectedStyles[0])?.label}
              </p>
            )}

            {selectedElements.length > 0 && (
              <p className="text-xs text-gray-600 mb-1">
                <strong>Elements:</strong>{" "}
                {selectedElements
                  .map(e => interElements.find(el => el.value === e)?.label)
                  .join(", ")}
              </p>
            )}

            {specificRequirement && (
              <p className="text-xs text-gray-600">
                <strong>Instruction:</strong> {specificRequirement}
              </p>
            )}
          </div>

          <div className="w-full max-w-xs lg:w-80">
            <Progress
              percent={progress}
              strokeColor={{ "0%": "#8E2DE2", "100%": BRAND_PURPLE }}
              status="active"
              strokeWidth={10}
              showInfo={false}
            />

            <div className="mt-4 text-center">
              <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-purple-400">
                {title}
              </p>
              <p className="mt-1 text-[10px] lg:text-xs text-gray-400">
                {subtitle}
              </p>
            </div>

            <div className="flex justify-between mt-3 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorPlanner;