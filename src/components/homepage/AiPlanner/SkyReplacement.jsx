import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Upload, CloudSun, ArrowLeft, 
    Image as ImageIcon, Sun, Moon, X, Loader2, Download, ArrowRight
} from 'lucide-react';
import { notification, Button, Modal, Spin, Empty, Divider, Card } from 'antd';
import { useSelector } from 'react-redux';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import LeadGenerationModal from '../Signuupage'; 

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_LIGHT = "#F3E8FF";

// Dummy images if you want to show suggestions in the modal
const dummySpaceImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800' },
    { id: 2, url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800' },
];

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

    // Library & Modal States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [libraryDesigns, setLibraryDesigns] = useState([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);

    // Auth Check Logic
    const isCustomerLoggedIn = useMemo(() => user && (user.role?.name === 'Customer' || user.role?.name === 'SuperAdmin'), [user]);

    // ==========================================
    // LIBRARY FETCH LOGIC
    // ==========================================
    const fetchLibraryDesigns = async () => {
        if (!user) return;
      
        try {
          setLoadingLibrary(true);
          const res = await apiService.get(`/ai/get-customer-liabrary?designType=sky`);
          const apiDesigns = res?.data || [];
      
          const formatted = apiDesigns.flatMap((d, index) => {
            if (d.images && Array.isArray(d.images)) {
              return d.images.map((img, i) => ({
                id: `${d._id}-${i}`, image: img, title: `Library Image ${index + 1}-${i + 1}`, timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now',
              }));
            } else {
              return [{
                id: d._id || index, image: d.imageUrl || d.image, title: `Library Image ${index + 1}`, timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now',
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

    // ==========================================
    // UPLOAD LOGIC (S3 & Library)
    // ==========================================
    const processUploadedFile = async (file) => {
        if (!file || !file.type.startsWith("image/")) {
            notification.error({ message: "Please upload a valid image file." });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            
            // Upload to S3
            const uploadRes = await apiService.post("upload", formData);
            const uploadedUrl = uploadRes?.file?.url;

            if (!uploadedUrl) throw new Error("Image upload failed");

            // Save to Library
            if (isCustomerLoggedIn) {
                await apiService.post("ai/post-customer-liabrary", { designType: "sky", imageUrl: uploadedUrl });
                fetchLibraryDesigns();
            } else {
                const existing = JSON.parse(localStorage.getItem("guestLibrary_sky")) || [];
                existing.push(uploadedUrl);
                localStorage.setItem("guestLibrary_sky", JSON.stringify(existing));
            }

            // Update UI
            setRawFile(file);
            setSelectedImage(uploadedUrl);
            setResultImage(null);
            setShowUploadModal(false);
            notification.success({ message: "File uploaded successfully" });

        } catch (error) {
            console.error("Upload process failed:", error);
            notification.error({ message: "Upload Failed", description: error?.message || "Could not upload image." });
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
        if (!selectedImage) return notification.warning({ message: "Bhai, pehle image upload kar!" });
        
        if (!isCustomerLoggedIn) {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        
        // Agar URL hai (library se select kiya hua), usko Blob mein convert karke file banayenge
        if (rawFile) {
            formData.append("image", rawFile);
        } else {
            try {
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const file = new File([blob], 'input_image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } catch (err) {
                console.error('Image processing failed', err);
            }
        }
        
        formData.append("skyType", skyStyle);

        try {
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
            const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || "AI processing mein error aaya!";
            notification.error({ message: "Error", description: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DOWNLOAD LOGIC
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
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-base font-bold">1. Upload Exterior Photo</h2>
                                <Button type="link" size="small" onClick={() => setShowLibraryModal(true)} style={{ color: BRAND_PURPLE, fontWeight: 'bold' }}>
                                    View Library
                                </Button>
                            </div>
                            <div className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50/50 relative overflow-hidden transition-all group hover:border-purple-200">
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} className="w-full h-full object-contain" alt="Preview" />
                                        <button onClick={() => {setSelectedImage(null); setRawFile(null); setResultImage(null);}} className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md text-red-500 hover:bg-red-50 z-10">
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div onClick={() => setShowUploadModal(true)} className="text-center p-4 cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                        <Upload className="text-gray-400 mx-auto mb-2" size={32} />
                                        <p className="text-gray-800 font-bold text-sm">Click to select photo</p>
                                        <Button className="mt-3 border-[#5C039B] text-[#5C039B] font-bold shadow-sm">Browse Files / Library</Button>
                                    </div>
                                )}
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
                            disabled={!selectedImage}
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
                                <div className="text-center opacity-25 p-4">
                                    <ImageIcon size={60} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        {loading ? "Creating your sky..." : "Result will appear here"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* YOUR SELECTIONS (Added Here) */}
                        <div className="mt-4 w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left">
                            <h4 className="font-bold text-gray-800 text-sm mb-2">Your Selection</h4>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                                <strong>Sky Style:</strong> 
                                {skyStyle === 'blue' ? (
                                    <span className="flex items-center gap-1 text-blue-600"><Sun size={14}/> Blue Sky</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-gray-800"><Moon size={14}/> Dusk Sky</span>
                                )}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- MODALS (Upload & Library) --- */}
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
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Your Library</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                                {libraryDesigns.map(d => (
                                    <div
                                        key={d.id}
                                        onClick={() => { setSelectedImage(d.image); setRawFile(null); setShowUploadModal(false); }}
                                        className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm"
                                    >
                                        <img src={d.image} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
            
                    {/* Dummy Space Images */}
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Suggested Images</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                        {dummySpaceImages.map(img => (
                            <div
                                key={img.id}
                                onClick={() => { setSelectedImage(img.url); setRawFile(null); setShowUploadModal(false); }}
                                className="aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer hover:ring-4 ring-purple-100 transition-all shadow-sm"
                            >
                                <img src={img.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
            
                    <Divider>OR UPLOAD YOUR OWN</Divider>
            
                    <input
                        type="file"
                        id="sky-file-up"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => processUploadedFile(e.target.files[0])}
                    />
            
                    <Button
                        block
                        icon={<Upload size={16} />}
                        className="h-12 rounded-xl font-semibold border-dashed text-sm"
                        onClick={() => document.getElementById('sky-file-up').click()}
                    >
                        Browse Local Files
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
                    <Card key={d.id} hoverable className="rounded-2xl overflow-hidden shadow-sm" bodyStyle={{ padding: 0 }}>
                        <img src={d.image} alt={d.title} className="w-full h-40 object-cover" />
                        <div className="p-3 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{d.title}</h4>
                                <span className="text-xs text-gray-400">{d.timestamp}</span>
                            </div>
                            <button
                                onClick={() => {
                                setSelectedImage(d.image);
                                setRawFile(null);
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
                id="library-sky-up"
                className="hidden"
                accept="image/*"
                onChange={(e) => processUploadedFile(e.target.files[0])}
                />
            
                <Button
                block
                icon={<Upload size={16} />}
                className="h-12 rounded-xl font-semibold border-dashed text-sm"
                onClick={() => document.getElementById('library-sky-up').click()}
                >
                Browse Local Files
                </Button>
            </Modal>

        </div>
    );
};

export default SkyReplacement;