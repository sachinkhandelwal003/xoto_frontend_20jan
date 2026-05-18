import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// In imports, add ChevronDown
import { 
    Upload, 
    ArrowLeft, 
    Image as ImageIcon, 
    X, 
    Loader2, 
    Download, 
    Sofa, 
    Bed, 
    Utensils, 
    Briefcase, 
    Sparkles, 
    Lock,
    ChevronDown // <--- Ye missing tha, isse add karo
} from 'lucide-react';
import { notification, Button } from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage'; 

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_LIGHT = "#F3E8FF";

const VirtualStaging = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form States
    const [rawFile, setRawFile] = useState(null); 
    const [previewImage, setPreviewImage] = useState(null); 
    const [selectedRoom, setSelectedRoom] = useState('Living Room');
    const [style, setStyle] = useState('Modern');
    
    // Status States
    const [loading, setLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false); 

    // Auth Check Logic
    const isCustomerLoggedIn = useMemo(() => user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin'), [user]);

    const roomOptions = [
        { id: 'living', name: 'Living Room', locked: false, icon: <Sofa size={16} /> },
        { id: 'bedroom', name: 'Bedroom', locked: false, icon: <Bed size={16} /> },
        { id: 'kitchen', name: 'Kitchen', locked: true, icon: <Utensils size={16} /> },
        { id: 'office', name: 'Home Office', locked: true, icon: <Briefcase size={16} /> }
    ];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRawFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setResultImage(null); 
        }
    };

    const handleAuthSuccess = (userData) => {
        setShowAuthModal(false);
        notification.success({ message: `Welcome ${userData?.name || 'User'}!` });
    };

    // ==========================================
    // VIRTUAL STAGING API CALL
    // ==========================================
    const handleStageRoom = async () => {
        if (!rawFile) return notification.warning({ message: "Bhai, pehle image upload kar!" });
        
        if (!isCustomerLoggedIn) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("image", rawFile);
formData.append(

"roomType",

selectedRoom.toLowerCase().replace(" ","_")

);        formData.append("style", style);

        try {
            // End-point should match your CommonJS Route
            const response = await apiService.post("/ai/virtual-staging/process-staging", formData);

            if (response.status) {
                setResultImage(response.imageUrl);
                notification.success({ 
                    message: "Room Staged Successfully!", 
                    description: `XOTO AI has added ${style} furniture to your ${selectedRoom}.`
                });
            }
        } catch (error) {
            console.error("❌ Staging Error:", error);
            const errorMsg = error.response?.data?.error || "AI processing mein error aaya!";
            notification.error({ message: "Error", description: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DOWNLOAD LOGIC (S3 to PDF/Image)
    // ==========================================
 const handleDownload = async () => {
    if (!resultImage) return;

    try {
        const key = resultImage.split(".amazonaws.com/")[1];

        if (!key) {
            return notification.error({ message: "Invalid Image URL" });
        }

        await apiService.download(
            `/download-pdf?key=${encodeURIComponent(key)}`,
            `XOTO_Staged_${selectedRoom.replace(" ","_")}_${Date.now()}.pdf`
        );

    } catch (error) {
        notification.error({ message: "Download Failed" });
    }
};

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans relative pb-10">
            
            <LeadGenerationModal
                visible={showAuthModal}
                onCancel={() => setShowAuthModal(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <button 
                onClick={() => navigate(-1)} 
                className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-purple-50 transition-all text-sm"
            >
                <ArrowLeft size={16} className="text-gray-700" />
                <span className="font-medium text-gray-700">Go Back</span>
            </button>

            <header className="text-center mt-12 mb-6 px-4">
                <div className="inline-flex items-center gap-2 bg-[#F3E8FF] px-3 py-1 rounded-full text-[12px] font-semibold mb-3" style={{ color: BRAND_PURPLE }}>
                    <Sparkles size={14} /> Virtual Staging Tool
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                    Virtual Staging - <span style={{ color: BRAND_PURPLE }}>With XOTO AI</span>
                </h1>
            </header>

            <main className="w-full max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    
                    {/* Left Column: Controls */}
                    <div className="p-8 border-r border-gray-100 space-y-8">
                        {/* 1. Upload */}
                        <section>
                            <h2 className="text-base font-bold mb-3 text-slate-900">1. Upload Room Photo</h2>
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50/50 relative overflow-hidden cursor-pointer group hover:border-[#5C039B]/30"
                            >
                                {previewImage ? (
                                    <>
                                        <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                                        <button onClick={(e) => {e.stopPropagation(); setPreviewImage(null); setRawFile(null);}} className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md text-red-500 hover:bg-red-50">
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="text-gray-400 mx-auto mb-2" size={32} />
                                        <p className="text-gray-800 font-bold text-sm">Drop your photo here</p>
                                        <Button className="mt-3 border-[#5C039B] text-[#5C039B] font-bold rounded-lg">Browse Files</Button>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
                            </div>
                        </section>

                        {/* 2. Room Type */}
                        <section>
                            <h2 className="text-base font-bold mb-3">2. Select Room Type</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {roomOptions.map((room) => (
                                    <button
                                        key={room.id}
                                        disabled={room.locked}
                                        onClick={() => setSelectedRoom(room.name)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                                            room.locked ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' : ''
                                        }`}
                                        style={selectedRoom === room.name && !room.locked ? { borderColor: BRAND_PURPLE, backgroundColor: BRAND_PURPLE_LIGHT, color: BRAND_PURPLE } : { borderColor: '#F3F4F6', color: '#6B7280' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {room.icon} {room.name}
                                        </div>
                                        {room.locked && <Lock size={12} />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Style */}
                        <section>
                            <h2 className="text-base font-bold mb-3">3. Select Style</h2>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none bg-white border-2 border-gray-100 rounded-xl p-3 pr-10 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#5C039B]/30"
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                >
                                    <option>Modern</option>
                                    <option>Contemporary</option>
                                    <option>Scandinavian</option>
                                    <option>Luxury</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </section>

                        <Button 
                            loading={loading}
                            disabled={!rawFile}
                            onClick={handleStageRoom}
                            style={{ backgroundColor: loading ? '#A0A0A0' : BRAND_PURPLE, color: 'white' }}
                            className="w-full h-14 rounded-xl border-none font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
                        >
                            {!loading && <Sparkles size={18} />}
                            {loading ? "AI Staging in Progress..." : "Stage This Room"}
                        </Button>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="p-8 bg-gray-50/20 flex flex-col h-full min-h-[500px]">
                        <h2 className="text-base font-bold mb-3">4. Preview & Download</h2>
                        <div className="flex-1 border border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-white shadow-inner relative overflow-hidden group">
                            {resultImage ? (
                                <div className="w-full h-full p-2 flex flex-col items-center">
                                    <img src={resultImage} className="w-full h-full object-contain rounded-2xl" alt="Staged Result" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button 
                                            icon={<Download size={18}/>} 
                                            className="bg-white text-[#5C039B] font-bold h-12 rounded-full px-8 flex items-center gap-2 border-none"
                                            onClick={handleDownload}
                                        >
                                            Download HD Design
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center opacity-30">
                                    <ImageIcon size={60} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        {loading ? "AI is furnishing your room..." : "Staged preview will appear here"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default VirtualStaging;