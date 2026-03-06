import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { 
    Upload, CloudSun, ArrowLeft, 
    Image as ImageIcon, Sun, Moon, X, Loader2, Download 
} from 'lucide-react';
import { notification, Button } from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage'; 

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_LIGHT = "#F3E8FF";

const SkyReplacement = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // States
    const [selectedImage, setSelectedImage] = useState(null); 
    const [rawFile, setRawFile] = useState(null); 
    const [skyStyle, setSkyStyle] = useState('blue');
    const [loading, setLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false); 

    // Auth Check Logic
    const isCustomerLoggedIn = useMemo(() => user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin'), [user]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRawFile(file);
            setSelectedImage(URL.createObjectURL(file));
            setResultImage(null); 
        }
    };

    const handleAuthSuccess = (userData) => {
        setShowAuthModal(false);
        notification.success({ message: `Welcome ${userData?.name || 'User'}!` });
    };

    // ==========================================
    // SKY REPLACEMENT API CALL
    // ==========================================
    const handleReplaceSky = async () => {
        if (!rawFile) return notification.warning({ message: "Bhai, pehle image upload kar!" });
        
        if (!isCustomerLoggedIn) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("image", rawFile);
        formData.append("skyType", skyStyle);

        try {
            // apiService use kar rahe hain jo auth token automatically handle karega
            const response = await apiService.post("/ai/sky-replacement/replace-sky", formData);

            if (response.status) {
                setResultImage(response.imageUrl);
                notification.success({ 
                    message: "Sky Replaced Successfully!", 
                    description: "Xoto AI has updated the sky style."
                });
            }
        } catch (error) {

 console.error("❌ Sky Error:", error);

 const errorMsg =
   error.response?.data?.error?.message ||
   error.response?.data?.message ||
   error.message ||
   "AI processing mein error aaya!";

 notification.error({
   message: "Error",
   description: errorMsg
 });

}finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DOWNLOAD LOGIC (Same as Enhancer)
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
            `XOTO_Sky_${skyStyle}_${Date.now()}.pdf`
        );

    } catch (error) {
        console.error("Download error", error);
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

            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-purple-50 transition-all text-sm"
            >
                <ArrowLeft size={16} className="text-gray-700" />
                <span className="font-medium text-gray-700"> Go Back</span>
            </button>

            {/* Header Section */}
            <div className="text-center mt-12 mb-6 px-4">
                <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-[12px] font-semibold mb-3" style={{ color: BRAND_PURPLE }}>
                    <CloudSun size={14} /> Sky Replacement Tool
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1E26] mb-3">
                    Replace Gray Skies <span style={{ color: BRAND_PURPLE }}>Instantly</span>
                </h1>
            </div>

            {/* Main Container */}
            <div className="w-full max-w-5xl mx-auto px-4">
                <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    
                    {/* Left Column: Controls */}
                    <div className="p-6 md:p-8 border-r border-gray-100 flex flex-col gap-6">
                        <div>
                            <h2 className="text-base font-bold mb-3">1. Upload Exterior Photo</h2>
                            <div className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50/50 relative overflow-hidden transition-all">
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} className="w-full h-full object-contain" alt="Preview" />
                                        <button onClick={() => {setSelectedImage(null); setRawFile(null);}} className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md text-red-500 hover:bg-red-50">
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div onClick={() => document.getElementById('sky-upload').click()} className="text-center p-4 cursor-pointer">
                                        <Upload className="text-gray-400 mx-auto mb-2" size={32} />
                                        <p className="text-gray-800 font-bold text-sm">Drop your photo here</p>
                                        <Button className="mt-3 border-[#5C039B] text-[#5C039B] font-bold">Browse Files</Button>
                                    </div>
                                )}
                                <input type="file" id="sky-upload" hidden onChange={handleFileUpload} accept="image/*" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base font-bold mb-3">2. Choose Sky Style</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setSkyStyle('blue')}
                                    className="flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all font-bold text-sm"
                                    style={skyStyle === 'blue' ? { borderColor: BRAND_PURPLE, backgroundColor: BRAND_PURPLE_LIGHT, color: BRAND_PURPLE } : { borderColor: '#F3F4F6', color: '#6B7280' }}
                                >
                                    <Sun size={14} /> Blue Sky
                                </button>
                                <button 
                                    onClick={() => setSkyStyle('dark')}
                                    className="flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all font-bold text-sm"
                                    style={skyStyle === 'dark' ? { borderColor: '#000000', backgroundColor: '#F3F4F6', color: '#000000' } : { borderColor: '#F3F4F6', color: '#6B7280' }}
                                >
                                    <Moon size={14} /> Dusk Sky
                                </button>
                            </div>
                        </div>

                        <Button 
                            loading={loading}
                            disabled={!rawFile}
                            onClick={handleReplaceSky}
                            style={{ backgroundColor: loading ? '#A0A0A0' : BRAND_PURPLE, color: 'white' }}
                            className="w-full h-14 rounded-xl border-none font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2"
                        >
                            {!loading && <CloudSun size={20} />}
                            {loading ? "AI Processing..." : "Generate New Sky"}
                        </Button>
                    </div>

                    {/* Right Column: Preview/Result */}
                    <div className="p-6 md:p-8 bg-gray-50/20 flex flex-col h-full min-h-[400px]">
                        <h2 className="text-base font-bold mb-3">3. Preview & Download</h2>
                        <div className="flex-1 border border-gray-100 rounded-3xl flex flex-col items-center justify-center bg-white shadow-inner relative overflow-hidden group">
                            {resultImage ? (
                                <div className="w-full h-full p-2 flex flex-col items-center">
                                    <img src={resultImage} className="w-full h-full object-contain rounded-2xl" alt="Result" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button 
                                            icon={<Download size={18}/>} 
                                            className="bg-white text-[#5C039B] font-bold h-12 rounded-full px-8 flex items-center gap-2 border-none hover:bg-[#5C039B] hover:text-white"
                                            onClick={handleDownload}
                                        >
                                            Download HD PDF
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center opacity-25">
                                    <ImageIcon size={60} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        {loading ? "Creating your sky..." : "Result will appear here"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SkyReplacement;