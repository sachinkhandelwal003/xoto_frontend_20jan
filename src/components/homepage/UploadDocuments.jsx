import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://xoto.ae";

// --- HELPERS ---
const getLeadId = () => localStorage.getItem("mortgage_lead_id");
const getAppId = () => localStorage.getItem("mortgage_app_id") || "XOTO-5E33XI";
const getCustomerId = () => localStorage.getItem("customer_id") || "696a40c29830f633a591332c";

// --- UPLOAD ITEM COMPONENT (With Update Button) ---
const UploadItem = ({ id, label, required, description, fileData, onFileSelect, onFileRemove }) => {
  const fileInputRef = useRef(null);
  
  const isUploading = fileData?.status === 'uploading';
  const isSuccess = fileData?.status === 'success';
  const hasFile = fileData?.url; 

  const handleUpdate = () => {
    fileInputRef.current.click(); 
  };

  return (
    <div className="mb-8 border-b border-gray-100 pb-8 last:border-0">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files[0] && onFileSelect(id, e.target.files[0])} 
        className="hidden" 
        accept="image/*,.pdf" 
      />

      {!hasFile ? (
        <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-md text-sm flex items-center hover:bg-gray-50 transition-colors shadow-sm group">
          {isUploading ? (
             <><Loader2 size={16} className="animate-spin mr-2 text-blue-600" /> Uploading...</>
          ) : (
             <><Upload size={16} className="mr-2 text-gray-400 group-hover:text-black" /> Click to upload</>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3">
            <div className="flex items-center border border-green-200 bg-green-50 px-4 py-2.5 rounded-md text-sm text-green-700 min-w-[200px] shadow-sm">
                <FileText size={16} className="mr-2" />
                <span className="font-medium truncate max-w-[150px]">
                    {fileData.file?.name || "Uploaded Document"}
                </span>
                <CheckCircle size={16} className="ml-2" />
            </div>

            {/* 🔥 Update Button (Pencil Icon) */}
            <button 
                onClick={handleUpdate}
                disabled={isUploading}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Update / Replace File"
            >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Edit2 size={18} />}
            </button>

            {/* Remove Button */}
            <button onClick={() => onFileRemove(id)} disabled={isUploading} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={18} />
            </button>
        </div>
      )}
      {description && !hasFile && <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-xl">{description}</p>}
    </div>
  );
};

// --- MAIN COMPONENT ---
const UploadDocuments = () => {
  const navigate = useNavigate();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [files, setFiles] = useState({});
  const [initLoading, setInitLoading] = useState(true);

  // Helper to extract filename
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document.pdf";
    try {
        const parts = decodeURIComponent(url).split('/');
        return parts[parts.length - 1].split('?')[0]; 
    } catch (e) { return "Document.pdf"; }
  };

  // 1. PAGE LOAD: FETCH EXISTING DATA (FIXED)
  useEffect(() => {
    const loadDocs = async () => {
        const leadId = getLeadId();
        if(!leadId) { setInitLoading(false); return; }

        try {
            console.log("Fetching for Lead:", leadId);
            const res = await fetch(`${BASE_URL}/api/mortgages/get-lead-data?lead_id=${leadId}`);
            const json = await res.json();
            
            if(json.success && json.data) {
                // Smart Check for Data
                const getNonEmpty = (obj) => (obj && Object.keys(obj).length > 0) ? obj : null;
                
                // 🔥 CRITICAL FIX: Added 'json.data' as a fallback
                // Aapke JSON me data seedha root 'data' object me hai
                const apiDocs = getNonEmpty(json.data.documents) || 
                                getNonEmpty(json.data.lead?.documents) || 
                                getNonEmpty(json.data.uploaded_documents) || 
                                json.data || // <-- YE LINE ADD KI HAI (Yahi data pakdegi)
                                {};

                console.log("📥 Extracted Docs:", apiDocs);

                const newFiles = {};
                // Helper to set state
                const setIfUrl = (key, urlOrArray) => {
                    let url = urlOrArray;
                    if(Array.isArray(urlOrArray) && urlOrArray.length > 0) url = urlOrArray[0];
                    
                    // Fixed Check: Removed "length > 5" constraint to allow "https" to show (for testing)
                    if(url && typeof url === 'string' && url.trim().length > 0) {
                        newFiles[key] = {
                            status: 'success',
                            url: url,
                            file: { name: getFileNameFromUrl(url) }
                        };
                    }
                };

                setIfUrl('passport', apiDocs.passport || apiDocs.passport_url);
                setIfUrl('visa', apiDocs.visa || apiDocs.visa_url);
                setIfUrl('emiratesId', apiDocs.emirates_id || apiDocs.emiratesId);
                setIfUrl('marriageCert', apiDocs.marriage_certificate || apiDocs.marriageCert);
                setIfUrl('bankStatements', apiDocs.bank_statements || apiDocs.bankStatements);
                setIfUrl('payslips', apiDocs.payslips || apiDocs.payslips_url);
                setIfUrl('salaryCert', apiDocs.salary_certificate || apiDocs.salaryCert);

                setFiles(newFiles);
            }
        } catch(e) { console.error(e); }
        finally { setInitLoading(false); }
    };
    loadDocs();
  }, []);

  // 2. SAVE TO BACKEND
  const saveToBackend = async (updatedFiles) => {
    setIsAutoSaving(true);
    const leadId = getLeadId();

    const getUrl = (key) => updatedFiles[key]?.url || null;

    const payload = {
        passport: getUrl('passport'),
        visa: getUrl('visa'),
        emirates_id: getUrl('emiratesId'),
        marriage_certificate: getUrl('marriageCert'),
        bank_statements: getUrl('bankStatements') ? [getUrl('bankStatements')] : [],
        payslips: getUrl('payslips') ? [getUrl('payslips')] : [],
        salary_certificate: getUrl('salaryCert')
    };

    try {
        await fetch(`${BASE_URL}/api/mortgages/update-lead-documents?customerId=${getCustomerId()}&application_id=${getAppId()}&lead_id=${leadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("💾 Saved to backend");
    } catch(e) { console.error("Save failed", e); }
    finally { setIsAutoSaving(false); }
  };

  // 3. UPLOAD AND EXTRACT URL (FIXED)
  const handleUpload = async (id, file) => {
    setFiles(prev => ({ ...prev, [id]: { status: 'uploading', file: file } }));

    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log("📤 Uploading...");
        const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
        const json = await res.json();

        if(json.success) {
            // Extraction Logic - checks file.url, data.url, or root url
            let uploadedUrl = null;
            if (json.file) uploadedUrl = json.file.url || json.file.location || json.file.path;
            if (!uploadedUrl && json.data) uploadedUrl = (typeof json.data === 'string') ? json.data : json.data.url;
            if (!uploadedUrl) uploadedUrl = json.url || json.secure_url;

            if (!uploadedUrl) throw new Error("URL missing in response");

            console.log("🔗 URL:", uploadedUrl);
            
            setFiles(prev => {
                const newState = { 
                    ...prev, 
                    [id]: { status: 'success', url: uploadedUrl, file: file } 
                };
                saveToBackend(newState); 
                return newState;
            });
        } else { throw new Error("Upload failed"); }
    } catch(e) {
        console.error(e);
        setFiles(prev => ({ ...prev, [id]: { status: 'error' } }));
    }
  };

  const handleRemove = (id) => {
      setFiles(prev => {
          const newState = {...prev};
          delete newState[id];
          saveToBackend(newState);
          return newState;
      });
  };

  if(initLoading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FB]"><Loader2 className="w-10 h-10 animate-spin text-[#5c039b]" /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans p-6 md:p-12 text-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
            <div>
                <div className="text-gray-500 text-sm mb-2">My Applications / Details / Upload Document</div>
                <h1 className="text-4xl font-bold text-gray-900">Upload your documents</h1>
            </div>
            {isAutoSaving && <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse"><Loader2 size={14} className="animate-spin mr-2" /> Saving changes...</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-12 border-b border-gray-200 pb-12 mb-12">
                <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Personal documents</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Changes are saved automatically.</p>
                </div>
                <div className="w-full md:w-2/3">
                    <UploadItem id="passport" label="Passport" required link={true} fileData={files['passport']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                    <UploadItem id="visa" label="Visa" required fileData={files['visa']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                    <UploadItem id="emiratesId" label="Emirates ID" required fileData={files['emiratesId']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                    <UploadItem id="marriageCert" label="Marriage certificate" fileData={files['marriageCert']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/3"><h3 className="text-lg font-bold text-gray-900 mb-2">Income documents</h3></div>
                <div className="w-full md:w-2/3">
                    <UploadItem id="bankStatements" label="Bank Statements" fileData={files['bankStatements']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                    <UploadItem id="payslips" label="Payslips" fileData={files['payslips']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                    <UploadItem id="salaryCert" label="Salary Certificate" fileData={files['salaryCert']} onFileSelect={handleUpload} onFileRemove={handleRemove} />
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end">
                <button onClick={() => navigate(-1)} className="bg-[#5c039c] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#4a027d] transition-colors">Back to application</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;