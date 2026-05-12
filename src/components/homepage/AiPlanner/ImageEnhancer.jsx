// src/components/homepage/AiPlanner/ImageEnhancer.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import LeadGenerationModal from '../Signuupage'; 
import { 
    Upload, Sun, Contrast, Maximize2, Download, 
    RefreshCcw, CheckCircle2, ImageIcon, Sparkles, X, ArrowLeft,
    CloudSun, LayoutPanelLeft 
} from 'lucide-react';
import { Button, Slider, notification, Modal } from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

import XYZ from '../../homepage/ImageCustomer'; 

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_DARK = "#4A027F";
const BRAND_PURPLE_LIGHT = "#F3E8FF";

const ImageEnhancer = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // States
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [enhancedImage, setEnhancedImage] = useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [activeOption, setActiveOption] = useState('contrast');
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [showAuthModal, setShowAuthModal] = useState(false); 
    
    const [enhancementValues, setEnhancementValues] = useState({ 
        brightness: 100,
        contrast: 100,
        saturation: 100,
        resolution: 100 
    });

    const isCustomerLoggedIn = useMemo(() => user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin'), [user]);

    const handleAuthSuccess = (userData) => {
        setShowAuthModal(false);
        notification.success({ message: `Welcome ${userData?.name || 'User'}!` });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
            setSelectedImage(URL.createObjectURL(file));
            setEnhancedImage(null);
        }
    };

    const handleEnhance = async () => {
        if (!selectedImage) return notification.warning({ message: 'Upload image' });
        
        if (!isCustomerLoggedIn) {
            setShowAuthModal(true);
            return;
        }

        setIsEnhancing(true);
        const formData = new FormData();
        
        formData.append('image', uploadedFile);
        formData.append('brightness', enhancementValues.brightness / 100);
        formData.append('contrast', enhancementValues.contrast / 100);
        formData.append('saturation', enhancementValues.saturation / 100);
        formData.append('scaling', activeOption === 'resolution' ? 2 : 1);

        try {
            const response = await apiService.post('/ai/enhance/enhance-image', formData);
            
            if (response.status) {
                setEnhancedImage(response.imageUrl);
                notification.success({ 
                    message: 'Xoto AI Enhancement Successful', 
                    description: 'Listing photo enhanced successfully.' 
                });
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error("Enhancement failed:", error);
            notification.error({ message: 'Enhancement failed', description: 'Check backend connection.' });
        } finally {
            setIsEnhancing(false);
        }
    };

//     const handleDownload = async () => {
//         if (!enhancedImage) {
//             notification.warning({ message: "No enhanced image" });
//             return;
//         }

//         try {
//             const key = enhancedImage.split(".amazonaws.com/")[1];
//             if (!key) {
//                 notification.error({ message: "Invalid Image URL" });
//                 return;
//             }
                
//        await apiService.download(
//   `/download-pdf?key=${encodeURIComponent(key)}`,
//   `XOTO_Enhanced_${Date.now()}.pdf`
// );

//             const blob = new Blob([response.data], { type: "application/pdf" });
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = `XOTO_Enhanced_${Date.now()}.pdf`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//         } catch (error) {
//             console.error("Download error", error);
//             notification.error({
//                 message: "Download Failed",
//                 description: "PDF generate nahi hua"
//             });
//         }
//     };
const handleDownload = async () => {
    if (!enhancedImage) {
        notification.warning({ message: "No enhanced image" });
        return;
    }

    try {
        const key = enhancedImage.split(".amazonaws.com/")[1];

        if (!key) {
            notification.error({ message: "Invalid Image URL" });
            return;
        }

        await apiService.download(
            `/download-pdf?key=${encodeURIComponent(key)}`,
            `XOTO_Enhanced_${Date.now()}.pdf`
        );

    } catch (error) {
        console.error("Download error", error);
        notification.error({
            message: "Download Failed",
            description: "PDF generate nahi hua"
        });
    }
};
    return (
        <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 font-sans relative">
            
            {/* --- SIDE NAVIGATION (LEFT MIDDLE) --- */}
            <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4">
                {/* Sky Replacement Button */}
                <Link 
                    to="/aiPlanner/sky" 
                    className="flex items-center bg-white border border-l-0 border-gray-200 p-3 rounded-r-2xl shadow-xl hover:border-[#5C039B] active:border-[#5C039B] transition-all duration-300 group overflow-hidden w-[54px] md:w-[60px] hover:w-[220px] active:w-[220px]"
                >
                    <div className="min-w-[30px] md:min-w-[36px] flex justify-center shrink-0">
                        <CloudSun size={26} className="text-[#5C039B]" />
                    </div>
                    <span className="ml-3 font-bold text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 text-sm md:text-base">
                        Sky Replacement
                    </span>
                </Link>

                {/* Virtual Staging Button */}
                <Link 
                    to="/aiPlanner/virtual"  
                    className="flex items-center bg-white border border-l-0 border-gray-200 p-3 rounded-r-2xl shadow-xl hover:border-[#5C039B] active:border-[#5C039B] transition-all duration-300 group overflow-hidden w-[54px] md:w-[60px] hover:w-[220px] active:w-[220px]"
                >
                    <div className="min-w-[30px] md:min-w-[36px] flex justify-center shrink-0">
                        <LayoutPanelLeft size={26} className="text-[#5C039B]" />
                    </div>
                    <span className="ml-3 font-bold text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 text-sm md:text-base">
                        Virtual Staging
                    </span>
                </Link>
            </div>
            {/* ------------------------------------- */}

            <LeadGenerationModal
                visible={showAuthModal}
                onCancel={() => setShowAuthModal(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <button
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-5 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-purple-50 hover:border-[#5C039B] transition-all group"
            >
                <ArrowLeft size={20} className="text-gray-700 group-hover:text-[#5C039B] transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-[#5C039B] transition-colors">Go Back</span>
            </button>

            <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-[#5C039B] px-4 py-1 rounded-full text-sm font-semibold mb-4">
                    <span className="flex items-center gap-1"><Sparkles size={14} /> Xoto AI Enhancer</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1E26] mb-4">
                    Listing Photo Enhancer <span style={{ color: BRAND_PURPLE }}>for Real Estate</span>
                </h1>
            </div>

            <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    
                    <div className="p-8 lg:p-12">
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">1. Upload Photo</h2>
                        <div className="aspect-square border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/30 transition-all overflow-hidden relative">
                            {selectedImage ? (
                                <>
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedImage(null); 
                                            setUploadedFile(null); 
                                        }} 
                                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-red-500 hover:text-red-600"
                                    >
                                        <X size={18}/>
                                    </button>
                                </>
                            ) : (
                                <div onClick={() => document.getElementById('file-input').click()} className="flex flex-col items-center">
                                    <div className="p-4 bg-purple-50 rounded-full mb-4 text-[#5C039B]">
                                        <Upload />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Drop photo here</p>
                                    <Button className="mt-4 border-[#5C039B] text-[#5C039B] font-bold h-10 rounded-lg px-8 hover:bg-[#5C039B] hover:text-white">Browse</Button>
                                </div>
                            )}
                            <input type="file" id="file-input" hidden onChange={handleFileUpload} accept="image/*" />
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 bg-white">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold">2. Enhancement Options</h2>
                            <button 
                                onClick={() => setEnhancementValues({brightness:100, contrast:100, saturation:100, resolution:100})} 
                                className="text-xs font-bold flex items-center gap-1 text-gray-400 hover:text-[#5C039B]"
                            >
                                <RefreshCcw size={12} /> Reset
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div 
                                onClick={() => setActiveOption('brightness')} 
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeOption === 'brightness' ? 'border-[#5C039B] bg-white shadow-sm' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Sun size={16} className={activeOption === 'brightness' ? 'text-[#5C039B]' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">Brightness</span>
                                </div>
                                {activeOption === 'brightness' && (
                                    <Slider 
                                        value={enhancementValues.brightness} max={200} 
                                        onChange={(v) => setEnhancementValues({...enhancementValues, brightness: v})}
                                        trackStyle={{ backgroundColor: BRAND_PURPLE }} railStyle={{ backgroundColor: BRAND_PURPLE_LIGHT }}
                                    />
                                )}
                            </div>

                            <div 
                                onClick={() => setActiveOption('saturation')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeOption === 'saturation' ? 'border-[#5C039B] bg-white shadow-sm' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles size={16} className={activeOption === 'saturation' ? 'text-[#5C039B]' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">Saturation</span>
                                </div>
                                {activeOption === 'saturation' && (
                                    <Slider
                                        value={enhancementValues.saturation} max={200}
                                        onChange={(v)=> setEnhancementValues({...enhancementValues, saturation:v})}
                                        trackStyle={{ backgroundColor: BRAND_PURPLE }} railStyle={{ backgroundColor: BRAND_PURPLE_LIGHT }}
                                    />
                                )}
                            </div>

                            <div 
                                onClick={() => setActiveOption('contrast')} 
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${activeOption === 'contrast' ? 'border-[#5C039B] bg-white shadow-sm' : 'border-gray-100 bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Contrast size={16} className={activeOption === 'contrast' ? 'text-[#5C039B]' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">Contrast</span>
                                </div>
                                {activeOption === 'contrast' && (
                                    <Slider 
                                        value={enhancementValues.contrast} max={200} 
                                        onChange={(v) => setEnhancementValues({...enhancementValues, contrast: v})}
                                        trackStyle={{ backgroundColor: BRAND_PURPLE }} railStyle={{ backgroundColor: BRAND_PURPLE_LIGHT }}
                                    />
                                )}
                            </div>
                        </div>

                        <Button 
                            loading={isEnhancing}
                            onClick={handleEnhance}
                            style={{ backgroundColor: BRAND_PURPLE, color: 'white' }}
                            className="w-full mt-8 h-12 rounded-xl border-none font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90"
                        >
                            Enhance with Xoto AI
                        </Button>
                    </div>

                    <div className="p-8 lg:p-12">
                        <h2 className="text-xl font-bold mb-8">3. Export Result</h2>
                        <div className="aspect-square bg-gray-50 border border-gray-100 rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden group">
                            {enhancedImage ? (
                                <>
                                    <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button 
                                            icon={<Download size={18}/>} 
                                            className="bg-white text-[#5C039B] font-bold h-12 rounded-full px-8 flex items-center gap-2 border border-[#5C039B] hover:bg-[#5C039B] hover:text-white"
                                            onClick={handleDownload}
                                        >
                                            Download HD
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="text-gray-200 w-16 h-16 mb-4 mx-auto" />
                                    <p className="text-gray-300 text-sm font-semibold">Enhanced preview will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEnhancer;