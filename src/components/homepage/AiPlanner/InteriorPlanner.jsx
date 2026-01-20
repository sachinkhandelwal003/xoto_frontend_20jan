import React, { useState } from 'react';
import { Sparkles, Upload, Sun, Sprout, Zap, X, Check, Loader, Image as ImageIcon, ArrowLeft, Download, RotateCcw, Trash2 } from 'lucide-react';
import { Button, Modal, Progress, Card, Tag, Empty, notification } from 'antd';
import axios from 'axios';

// Dummy Images (using Unsplash or placeholder)
const dummySpaceImages = [
  'https://images.unsplash.com/photo-1589924691995-400dc9aa6447?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1558618666-4178cb59b3d7?w=800',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
];

const gardenStyles = [
  { value: 'modern', label: 'Modern Garden', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600' },
  { value: 'japanese', label: 'Japanese Zen', img: 'https://images.unsplash.com/photo-1587502537104-aac4031028fe?w=600' },
  { value: 'cottage', label: 'English Cottage', img: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600' },
  { value: 'mediterranean', label: 'Mediterranean', img: 'https://images.unsplash.com/photo-1558618666-4178cb59b3d7?w=600' },
  { value: 'tropical', label: 'Tropical Oasis', img: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3f8?w=600' },
  { value: 'minimalist', label: 'Minimalist', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600' },
];

const gardenElements = [
  { value: 'fountain', label: 'Water Fountain', img: 'https://images.unsplash.com/photo-1572015099635-f6f9e54d3cae?w=400' },
  { value: 'pond', label: 'Pond', img: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400' },
  { value: 'pathway', label: 'Stone Pathway', img: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400' },
  { value: 'gazebo', label: 'Gazebo', img: 'https://images.unsplash.com/photo-1592596617544-3d0d4e0ac483?w=400' },
  { value: 'firepit', label: 'Fire Pit', img: 'https://images.unsplash.com/photo-1601919056610-2e3d2c1f33c0?w=400' },
  { value: 'seating', label: 'Seating Area', img: 'https://images.unsplash.com/photo-1586023492125-27b2c0d58d9f?w=400' },
];

const InteriorPlanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [specificRequirement, setSpecificRequirement] = useState('');
  const [designs, setDesigns] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [currentGeneratedImages, setCurrentGeneratedImages] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset function to clear all inputs and start fresh
  const resetDesign = () => {
    setSelectedImage(null);
    setSelectedStyles([]);
    setSelectedElements([]);
    setSpecificRequirement('');
    setUploadedFile(null);
    notification.success({ 
      message: 'Design Reset', 
      description: 'All inputs have been cleared. Ready for a new design!' 
    });
  };

  // Handle file upload from PC
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processUploadedFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  // Process uploaded file
  const processUploadedFile = (file) => {
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        notification.error({
          message: 'Invalid File Type',
          description: 'Please upload an image file (JPEG, PNG, etc.)'
        });
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        notification.error({
          message: 'File Too Large',
          description: 'Please upload an image smaller than 10MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(file);
        setSelectedImage(e.target.result);
        setShowUploadModal(false);
        notification.success({
          message: 'Image Uploaded Successfully!',
          description: 'Your photo is ready for design generation'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle example image selection
  const handleExampleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl);
    setUploadedFile(null); // Clear any uploaded file when selecting example
    setShowUploadModal(false);
    notification.success({ 
      message: 'Example Image Selected', 
      description: 'Your example image is ready for design generation!' 
    });
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setUploadedFile(null);
    notification.info({ 
      message: 'Image Removed', 
      description: 'You can upload a new image to continue' 
    });
  };

  // Delete a design
  const deleteDesign = (designId) => {
    setDesigns(prev => prev.filter(design => design.id !== designId));
    notification.success({
      message: 'Design Deleted',
      description: 'The design has been removed successfully'
    });
  };

  // Function to convert data URL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Function to call AI backend
const generateAIDesigns = async () => {
  try {
    if (!selectedImage) {
      notification.warning({ message: 'Please upload a photo first!' });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const formData = new FormData();

    if (uploadedFile) {
      formData.append('gardenImage', uploadedFile);
    } else if (selectedImage) {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'garden-image.jpg', { type: 'image/jpeg' });
      formData.append('gardenImage', file);
    }

    formData.append(
      'styleName',
      selectedStyles.length > 0
        ? gardenStyles.find(s => s.value === selectedStyles[0])?.label
        : 'Modern Garden'
    );

    const elementsText = selectedElements
      .map(e => gardenElements.find(el => el.value === e)?.label)
      .join(', ');

    formData.append('elements', elementsText || 'beautiful plants');

    formData.append(
      'description',
      specificRequirement || 'Create a beautiful garden design'
    );

    // ⭐ DEBUG SECTION — CHECK FORM DATA CONTENTS ⭐
    console.log("----- FORM DATA DEBUG -----");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    console.log("----- END FORM DATA -----");

    // Simulated progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return newProgress;
      });
    }, 100);

    const response = await axios.post(
      'https://kotiboxglobaltech.online/api/ai/generate-garden',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      }
    );

    clearInterval(progressInterval);
    setGenerationProgress(100);

    if (response.data.success) {
      const generatedImages = response.data.designs.map(d => d.url);
      setCurrentGeneratedImages(generatedImages);

      const newDesigns = generatedImages.map((image, index) => ({
        id: Date.now() + index,
        image: image,
        title: `AI Design ${designs.length + index + 1}`,
        styles: selectedStyles,
        elements: selectedElements,
        requirement: specificRequirement,
        timestamp: new Date().toLocaleString(),
        isUploaded: !!uploadedFile,
        originalImage: selectedImage,
        isAIGenerated: true,
      }));

      setDesigns(prev => [...newDesigns, ...prev]);
      setShowGeneratedModal(true);

      notification.success({
        message: 'AI Designs Generated Successfully!',
        description: `${generatedImages.length} unique garden designs created by AI`,
      });
    } else {
      throw new Error(response.data.message || 'Failed to generate designs');
    }
  } catch (error) {
    console.error('Error generating AI designs:', error);

    if (error.code === 'ECONNABORTED') {
      notification.error({
        message: 'Generation Timeout',
        description: 'AI generation took too long. Try again.',
      });
    } else if (error.response) {
      notification.error({
        message: 'Generation Failed',
        description: error.response.data.message || 'Failed to generate designs.',
      });
    } else {
      notification.error({
        message: 'Connection Error',
        description: 'Backend not running at http://localhost:5000',
      });
    }

    generateFallbackDesigns();
  } finally {
    setIsGenerating(false);
    setGenerationProgress(0);
  }
};


  // Fallback function if AI fails
  const generateFallbackDesigns = () => {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
      'https://images.unsplash.com/photo-1558618666-4178cb59b3d7?w=600'
    ];

    const newDesigns = fallbackImages.map((image, index) => ({
      id: Date.now() + index,
      image: image,
      title: `Design ${designs.length + index + 1} (Demo)`,
      styles: selectedStyles,
      elements: selectedElements,
      requirement: specificRequirement,
      timestamp: new Date().toLocaleString(),
      isUploaded: !!uploadedFile,
      originalImage: selectedImage
    }));

    setDesigns(prev => [...newDesigns, ...prev]);
    setCurrentGeneratedImages(fallbackImages);
    setShowGeneratedModal(true);

    notification.info({
      message: 'Demo Designs Generated',
      description: 'Using example designs. AI service is currently unavailable.'
    });
  };

  // Download image function
  const downloadImage = (imageUrl, designName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notification.success({
      message: 'Download Started',
      description: `${designName} is being downloaded`
    });
  };

  // Download all designs
  const downloadAllDesigns = () => {
    designs.forEach((design, index) => {
      setTimeout(() => {
        downloadImage(design.image, design.title);
      }, index * 500); // Stagger downloads
    });
    
    notification.success({
      message: 'Download All',
      description: `${designs.length} designs are being downloaded`
    });
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --color-primary: #5C039B;
          --color-blue: #03A4F4;
          --color-green: #64EF0A;
        }
        
        .ant-modal-content {
          border-radius: 20px !important;
        }
        
        .ant-modal-header {
          border-radius: 20px 20px 0 0 !important;
        }
        
        .ant-card {
          transition: all 0.3s ease !important;
        }
        
        .ant-card:hover {
          transform: translateY(-5px);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex">
        {/* Fixed Left Sidebar */}
        <div className="w-96 bg-white shadow-2xl flex flex-col fixed left-0 top-0 bottom-0 z-10 border-r-2 border-purple-200">
          <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-blue-500">
            <div className="flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Interior AI
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
            {/* Reset Button */}
            {(selectedImage || selectedStyles.length > 0 || selectedElements.length > 0 || specificRequirement) && (
              <div className="mb-4">
                <button
                  onClick={resetDesign}
                  className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset New Design
                </button>
              </div>
            )}

            {/* Upload Photo */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
                <Upload className="w-5 h-5" /> Your Space
              </h3>
              {!selectedImage ? (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full h-64 bg-purple-50 border-4 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500 transition-all group"
                >
                  <ImageIcon className="w-16 h-16 text-purple-400 group-hover:text-purple-500" />
                  <p className="mt-4 text-xl font-medium text-purple-600">Add Photo</p>
                  <p className="text-sm text-purple-500">Click to upload or choose example</p>
                </button>
              ) : (
                <div className="relative">
                  <img src={selectedImage} alt="Space" className="w-full h-64 object-cover rounded-2xl border-4 border-purple-500" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={removeSelectedImage}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      title="Remove Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="w-6 h-6" />
                      <span className="font-medium">Ready!</span>
                    </div>
                    {uploadedFile && (
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Uploaded: {uploadedFile.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Garden Style */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
                <Sun className="w-5 h-5 text-yellow-500" /> Garden Style
              </h3>
              <button
                onClick={() => setShowStyleModal(true)}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-xl text-left hover:border-purple-500 transition-all"
              >
                {selectedStyles.length === 0 ? (
                  <span className="text-purple-500">Choose style...</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedStyles.map(s => (
                      <Tag key={s} color="purple" className="bg-purple-100 text-purple-700 border-purple-300">
                        {gardenStyles.find(st => st.value === s)?.label}
                      </Tag>
                    ))}
                  </div>
                )}
              </button>
            </div>

            {/* Elements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
                <Sprout className="w-5 h-5 text-green-500" /> Add Elements
              </h3>
              <button
                onClick={() => setShowElementModal(true)}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-xl text-left hover:border-green-500 transition-all"
              >
                {selectedElements.length === 0 ? (
                  <span className="text-green-600">Add fountain, pond, etc...</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedElements.map(e => (
                      <Tag key={e} color="green" className="bg-green-100 text-green-700 border-green-300">
                        {gardenElements.find(el => el.value === e)?.label}
                      </Tag>
                    ))}
                  </div>
                )}
              </button>
            </div>

            {/* Special Request */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-700">Special Request</h3>
              <textarea
                rows={3}
                placeholder="e.g., Low maintenance, family-friendly, drought-resistant..."
                value={specificRequirement}
                onChange={(e) => setSpecificRequirement(e.target.value)}
                className="w-full p-4 border border-purple-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-purple-700 placeholder-purple-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateAIDesigns}
              disabled={!selectedImage || isGenerating}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xl font-bold rounded-2xl hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl transform hover:scale-105 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-8 h-8 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  Generate 3 AI Designs
                  <span className="ml-3 bg-white text-purple-600 px-4 py-1 rounded-full text-sm font-bold">AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Right Area - Designs */}
        <div className="flex-1 ml-96 p-10 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-purple-800">Your Designs</h2>
              {designs.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={resetDesign}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 border-2 border-purple-300 rounded-xl hover:bg-purple-50 hover:border-purple-500 transition-all font-semibold"
                  >
                    <RotateCcw className="w-5 h-5" />
                    New Design
                  </button>
                  {designs.length > 0 && (
                    <button
                      onClick={downloadAllDesigns}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white border-2 border-green-500 rounded-xl hover:bg-green-600 transition-all font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      Download All
                    </button>
                  )}
                  {designs.length > 0 && (
                    <button
                      onClick={() => setDesigns([])}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white border-2 border-red-500 rounded-xl hover:bg-red-600 transition-all font-semibold"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
            {designs.length === 0 ? (
              <div className="flex items-center justify-center min-h-96">
                <Empty description="No designs yet. Upload a photo and generate your first design!" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {designs.map(design => (
                  <Card
                    key={design.id}
                    hoverable
                    cover={
                      <div className="relative">
                        <img src={design.image} alt={design.title} className="h-64 w-full object-cover" />
                        <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded text-sm">
                          {design.timestamp}
                        </div>
                        {design.isAIGenerated && (
                          <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            AI Generated
                          </div>
                        )}
                      </div>
                    }
                    className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-purple-100"
                    actions={[
                      <Button 
                        type="text" 
                        icon={<Download size={16} />} 
                        className="text-purple-600"
                        onClick={() => downloadImage(design.image, design.title)}
                      >
                        Download
                      </Button>,
                      <Button type="text" className="text-blue-500">Edit</Button>,
                      <Button 
                        type="text" 
                        danger 
                        icon={<Trash2 size={16} />}
                        onClick={() => deleteDesign(design.id)}
                      >
                        Delete
                      </Button>,
                    ]}
                  >
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-3 text-purple-700">{design.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {design.styles.map(s => (
                          <Tag key={s} color="purple" className="bg-purple-100 text-purple-700 border-purple-300">
                            {gardenStyles.find(st => st.value === s)?.label}
                          </Tag>
                        ))}
                        {design.elements.map(e => (
                          <Tag key={e} color="green" className="bg-green-100 text-green-700 border-green-300">
                            {gardenElements.find(el => el.value === e)?.label}
                          </Tag>
                        ))}
                      </div>
                      {design.requirement && (
                        <p className="text-sm text-purple-600 italic border-l-4 border-purple-400 pl-3">
                          "{design.requirement}"
                        </p>
                      )}
                      {design.isUploaded && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-purple-500">
                          <Upload className="w-3 h-3" />
                          Custom Upload
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal with Both Options */}
      <Modal open={showUploadModal} footer={null} onCancel={() => setShowUploadModal(false)} width={800}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-purple-700">Choose Your Space</h2>
          
          {/* Upload from PC Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">Upload from Your Computer</h3>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver ? 'border-purple-500 bg-purple-50' : 'border-purple-300 hover:border-purple-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="w-16 h-16 text-purple-400 mb-4" />
                <p className="text-xl font-medium text-purple-600 mb-2">
                  {dragOver ? 'Drop your image here' : 'Click to Upload or Drag & Drop'}
                </p>
                <p className="text-sm text-purple-500 mb-4">JPG, PNG, WEBP (Max 10MB)</p>
                <button 
                  type="button"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  Browse Files
                </button>
              </label>
            </div>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-purple-200"></div>
            <span className="mx-4 text-purple-500 font-medium">OR</span>
            <div className="flex-grow border-t border-purple-200"></div>
          </div>

          {/* Example Images Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-600">Choose from Example Spaces</h3>
            <div className="grid grid-cols-2 gap-6">
              {dummySpaceImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => handleExampleImageSelect(img)}
                  className="cursor-pointer group"
                >
                  <img 
                    src={img} 
                    className="w-full h-64 object-cover rounded-xl group-hover:scale-105 transition-all border-4 border-purple-200 group-hover:border-purple-500" 
                    alt={`Example Space ${i + 1}`}
                  />
                  <p className="text-center mt-3 font-medium text-purple-600">Example Space {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Style Modal */}
      <Modal open={showStyleModal} footer={null} onCancel={() => setShowStyleModal(false)} width={900}>
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Choose Garden Style</h2>
        <div className="grid grid-cols-3 gap-6">
          {gardenStyles.map(style => (
            <div
              key={style.value}
              onClick={() => {
                setSelectedStyles(prev =>
                  prev.includes(style.value)
                    ? prev.filter(s => s !== style.value)
                    : [...prev, style.value]
                );
              }}
              className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${
                selectedStyles.includes(style.value) ? 'border-purple-500 shadow-xl bg-purple-50' : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <img src={style.img} className="w-full h-48 object-cover" alt={style.label} />
              <div className="p-4 bg-white">
                <p className="font-semibold text-center text-purple-700">{style.label}</p>
                {selectedStyles.includes(style.value) && (
                  <Check className="w-8 h-8 text-purple-500 mx-auto mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Elements Modal */}
      <Modal open={showElementModal} footer={null} onCancel={() => setShowElementModal(false)} width={900}>
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Add Garden Elements</h2>
        <div className="grid grid-cols-3 gap-6">
          {gardenElements.map(el => (
            <div
              key={el.value}
              onClick={() => {
                setSelectedElements(prev =>
                  prev.includes(el.value)
                    ? prev.filter(e => e !== el.value)
                    : [...prev, el.value]
                );
              }}
              className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${
                selectedElements.includes(el.value) ? 'border-green-500 shadow-xl bg-green-50' : 'border-green-200 hover:border-green-300'
              }`}
            >
              <img src={el.img} className="w-full h-48 object-cover" alt={el.label} />
              <div className="p-4 bg-white">
                <p className="font-semibold text-center text-green-700">{el.label}</p>
                {selectedElements.includes(el.value) && (
                  <Check className="w-8 h-8 text-green-500 mx-auto mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Generated Result Modal */}
      <Modal 
        open={showGeneratedModal} 
        footer={null} 
        onCancel={() => setShowGeneratedModal(false)} 
        width={1000}
        className="purple-modal"
      >
        <div className="text-center py-8">
          <Check className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-8 text-purple-700">
            Your AI Garden Designs Are Ready!
          </h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {currentGeneratedImages.map((image, index) => (
              <div key={index} className="text-center">
                <img 
                  src={image} 
                  alt={`AI Design ${index + 1}`}
                  className="w-full h-64 object-cover rounded-2xl shadow-lg mb-4 border-4 border-purple-200" 
                />
                <p className="font-semibold text-lg text-purple-600">
                  AI Design {index + 1}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              type="primary" 
              size="large" 
              className="bg-purple-600 h-12 px-8 border-purple-600 hover:bg-purple-700"
              onClick={downloadAllDesigns}
            >
              Download All HD
            </Button>
            <Button 
              size="large" 
              className="h-12 px-8 border-purple-600 text-purple-600 hover:bg-purple-50" 
              onClick={() => {
                setShowGeneratedModal(false);
                resetDesign();
              }}
            >
              Create New Design
            </Button>
          </div>
        </div>
      </Modal>

      {/* Progress Modal */}
      {isGenerating && (
        <Modal open={true} footer={null} closable={false} width={500}>
          <div className="text-center py-10">
            <Sparkles className="w-20 h-20 text-purple-500 mx-auto animate-pulse" />
            <h3 className="text-2xl font-bold mt-6 text-purple-700">AI is Creating Your Dream Garden...</h3>
            <Progress 
              percent={generationProgress} 
              type="circle" 
              className="mt-8"
              strokeColor={{
                '0%': '#5C039B',
                '100%': '#03A4F4',
              }}
            />
            <p className="mt-6 text-lg text-purple-600">
              {generationProgress < 30 && "Analyzing your space and preferences..."}
              {generationProgress >= 30 && generationProgress < 60 && "Designing layout with AI..."}
              {generationProgress >= 60 && generationProgress < 90 && "Adding garden elements with AI..."}
              {generationProgress >= 90 && "Finalizing AI-generated designs..."}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default InteriorPlanner;