import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, Edit2, Upload, FileText, User, LayoutGrid, CheckCircle, Save, Mail, Phone, Loader2, AlertCircle, Download 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://xoto.ae"; 

// --- HELPER: Get IDs from LocalStorage ---
const getLeadId = () => localStorage.getItem("mortgage_lead_id");
const getCustomerId = () => localStorage.getItem("customer_id") || "696a40c29830f633a591332c";
const getAppId = () => localStorage.getItem("mortgage_app_id") || "XOTO-5E33XI";

// --- SUB-COMPONENT: HANDLES FILE LIST DISPLAY ---
const UploadedFileItem = ({ label, url, isArray = false }) => {
  if (!url) return null;
  if (Array.isArray(url) && url.length === 0) return null;
  if (typeof url === 'string' && !url.trim()) return null;

  const getFileName = (link) => {
    if (typeof link !== 'string') return "Document.pdf";
    try {
        const parts = decodeURIComponent(link).split('/');
        return parts[parts.length - 1].split('?')[0]; 
    } catch (e) { return "view_document.pdf"; }
  };

  const FileRow = ({ fileUrl }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2 hover:border-gray-300 transition-colors group">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
           <FileText size={20} className="text-gray-400 group-hover:text-gray-600" />
        </div>
        <div className="min-w-0 flex flex-col">
           <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-xs">
             {getFileName(fileUrl)}
           </span>
           <span className="text-xs text-gray-400">Uploaded</span>
        </div>
      </div>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-all">
        <Download size={18} />
      </a>
    </div>
  );

  return (
    <div className="mb-5 last:mb-0 animate-fade-in">
      <h5 className="text-sm font-semibold text-gray-900 mb-2">{label}</h5>
      {isArray && Array.isArray(url) ? (
         url.map((link, idx) => <FileRow key={idx} fileUrl={link} />)
      ) : (
         <FileRow fileUrl={Array.isArray(url) ? url[0] : url} />
      )}
    </div>
  );
};

// --- UI COMPONENTS ---
const StatusBadge = ({ status }) => {
  const getStatusColor = (s) => {
      if (!s) return 'bg-gray-100 text-gray-800';
      const lower = s.toLowerCase();
      if (lower.includes('submit') || lower.includes('in_progress')) return 'bg-yellow-100 text-yellow-800';
      if (lower.includes('approved')) return 'bg-green-100 text-green-800';
      if (lower.includes('rejected')) return 'bg-red-100 text-red-800';
      return 'bg-gray-100 text-gray-800';
  };
  return <span className={`${getStatusColor(status)} text-xs px-3 py-1 rounded-full font-medium capitalize`}>{status ? status.replace(/_/g, ' ') : 'Pending'}</span>;
};

const SummaryItem = ({ label, value }) => <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">{label}</span><span className="text-gray-900 font-medium text-sm truncate" title={value}>{value || '-'}</span></div>;
const ApplicationReadyBanner = () => <div className="bg-[#F0FDF4] border border-green-200 rounded-xl p-6 mb-6 animate-fade-in"><h3 className="text-lg font-bold text-gray-900 mb-2">Your application is almost ready!</h3><p className="text-gray-600 text-sm leading-relaxed">To help move the process along smoothly, please upload the required documents and complete your personal details.</p></div>;

const FormInput = ({ label, value, onChange, type = "text", placeholder, suffix, required }) => (
  <div className="flex flex-col"><label className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center">{label} {required && <span className="text-red-500 ml-1">*</span>}</label><div className="relative flex items-center"><input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-900 transition-all shadow-sm" />{suffix && <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 bg-gray-50 border-l border-gray-300 rounded-r-md text-gray-500 text-sm font-medium">{suffix}</div>}</div></div>
);

const FormSelect = ({ label, value, onChange, options, required }) => (
  <div className="flex flex-col"><label className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center">{label} {required && <span className="text-red-500 ml-1">*</span>}</label><div className="relative"><select value={value || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-gray-900 appearance-none bg-white shadow-sm"><option value="" disabled>Select {label}</option>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" /></div></div>
);

const DataRow = ({ label, value }) => <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 min-h-[50px]"><span className="text-gray-500 text-sm">{label}</span><span className="text-gray-900 text-sm font-medium">{value || '-'}</span></div>;

const Card = ({ title, subTitle, children, onEdit, isEditing, isSaving, onUpload, isExpanded = true, toggleExpand, icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden shadow-sm transition-all">
      <div className="p-6 flex items-start justify-between">
        <div className="flex gap-4"><div className="mt-1"><div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-500">{icon}</div></div><div><h3 className="text-lg font-semibold text-gray-900">{title}</h3><p className="text-gray-500 text-sm mt-1">{subTitle}</p></div></div>
        <div className="flex items-center gap-4">
          {onUpload && <button onClick={onUpload} className="flex items-center text-gray-600 text-sm font-medium hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"><Upload size={16} className="mr-2" /> Upload</button>}
          {onEdit && <button onClick={onEdit} disabled={isSaving} className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${isEditing ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200'}`}>{isSaving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</> : isEditing ? <><Save size={16} className="mr-2" /> Save</> : <><Edit2 size={16} className="mr-2" /> Edit</>}</button>}
          <button onClick={toggleExpand} className="text-gray-400 hover:text-gray-600 p-1">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
        </div>
      </div>
      {isExpanded && <div className="px-6 pb-6 pt-0 border-t border-transparent animate-fade-in"><div className="h-px w-full bg-gray-100 mb-6"></div>{children}</div>}
    </div>
);

// --- PRODUCT OFFER COMPONENT ---
const ProductOffer = ({ productData, isSelected, onSelect, isDetailsOpen, onToggleDetails }) => {
  const { _id, bankInfo, offerSummary, costBreakdown, loanDetails, insurance } = productData;
  const fmt = (val) => val !== undefined && val !== null ? Number(val).toLocaleString() + ` ${offerSummary?.currency || 'AED'}` : '0 AED';
  
  const tags = [];
  if (offerSummary?.popularityTag) tags.push(offerSummary.popularityTag);
  if (offerSummary?.title && !offerSummary.title.includes(offerSummary.popularityTag)) tags.push(offerSummary.title);

  return (
    <div className={`border rounded-lg p-5 mb-4 relative group transition-all duration-300 ${isSelected ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-gray-400 hover:shadow'}`}>
      <div className="flex justify-between items-start mb-4">
         <div className="flex gap-2 flex-wrap">{tags.map((tag, idx) => <span key={idx} className={`text-xs px-2 py-1 rounded ${tag.includes('Popular') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{tag}</span>)}</div>
         {isSelected ? <span className="flex items-center text-purple-600 font-bold text-sm bg-white px-3 py-1.5 rounded-full shadow-sm border border-purple-100"><CheckCircle size={16} className="mr-1 text-purple-600" fill="currentColor" stroke="none"/> Selected</span> : <button onClick={() => onSelect(_id)} className="bg-black text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-800 transition-all shadow-sm">Select Offer</button>}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4"><div className="flex items-center gap-3 w-full md:w-1/4"><div className="font-bold text-xl text-gray-800">{bankInfo?.bankName}</div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full"><div><p className="text-gray-500 text-xs mb-1">Initial rate</p><p className="font-bold text-gray-900 text-lg">{offerSummary?.initialRate}%</p></div><div><p className="text-gray-500 text-xs mb-1">Monthly EMI</p><p className="font-bold text-gray-900 text-lg">{fmt(offerSummary?.monthlyEMI)}</p></div><div><p className="text-gray-500 text-xs mb-1">Bank processing fee</p><p className="font-bold text-gray-900 text-lg">{fmt(costBreakdown?.bankProcessingFee)}</p></div><div><p className="text-gray-500 text-xs mb-1">Total upfront cost</p><p className="font-bold text-gray-900 text-lg">{fmt(offerSummary?.totalUpfrontCost)}</p></div></div></div>
      <div className="flex justify-start"><button onClick={() => onToggleDetails(_id)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">{isDetailsOpen ? <><ChevronUp size={16} className="mr-1"/> Hide details</> : <><ChevronDown size={16} className="mr-1"/> View details</>}</button></div>
      {isDetailsOpen && <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in bg-white/50"><h4 className="font-medium text-gray-900 mb-2">{offerSummary?.fixedYears} year(s) {offerSummary?.productType} | {loanDetails?.loanToValue}% Loan to value application | {loanDetails?.interestType}</h4><div className="grid md:grid-cols-2 gap-10"><div><h5 className="font-semibold text-gray-900 mb-4 border-b pb-2">Costs breakdown</h5><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-600">Down payment</span> <span className="font-medium">{fmt(costBreakdown?.downPayment)}</span></div><div className="flex justify-between"><span className="text-gray-600">Dubai land department fee</span> <span className="font-medium">{fmt(costBreakdown?.dldFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Mortgage registration fee</span> <span className="font-medium">{fmt(costBreakdown?.mortgageRegistrationFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Trustee fee</span> <span className="font-medium">{fmt(costBreakdown?.trusteeFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Bank processing fee</span> <span className="font-medium">{fmt(costBreakdown?.bankProcessingFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Valuation</span> <span className="font-medium">{fmt(costBreakdown?.valuationFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Fees add to loan</span> <span className={`font-medium ${costBreakdown?.feesAddedToLoan > 0 ? 'text-green-600' : 'text-red-500'}`}>{costBreakdown?.feesAddedToLoan > 0 ? '+' : '-'}{fmt(costBreakdown?.feesAddedToLoan)}</span></div><div className="flex justify-between pt-2 border-t font-bold text-gray-900"><span className="">Total upfront cost</span> <span className="">{fmt(costBreakdown?.totalUpfrontCost)}</span></div></div></div><div><h5 className="font-semibold text-gray-900 mb-4 border-b pb-2">Loan breakdown</h5><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-600">Product type</span> <span className="font-medium">{offerSummary?.productType}</span></div><div className="flex justify-between"><span className="text-gray-600">Initial interest rate</span> <span className="font-medium">{offerSummary?.initialRate}%</span></div><div className="flex justify-between"><span className="text-gray-600">Follow on rate</span> <span className="font-medium">{loanDetails?.followOnRate}</span></div><div className="flex justify-between"><span className="text-gray-600">Bank processing fee</span> <span className="font-medium">{fmt(costBreakdown?.bankProcessingFee)}</span></div><div className="flex justify-between"><span className="text-gray-600">Life insurance</span> <span className="font-medium">{insurance?.lifeInsurance}</span></div><div className="flex justify-between"><span className="text-gray-600">Property insurance</span> <span className="font-medium">{insurance?.propertyInsurance}</span></div><div className="flex justify-between"><span className="text-gray-600 max-w-[200px]">Over payments allowed without penalty</span> <span className="font-medium">{loanDetails?.overpaymentAllowedPercent}%</span></div></div></div></div></div>}
    </div>
  );
};

// --- MAIN COMPONENT STARTS HERE ---

const MortgageProduct = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [documents, setDocuments] = useState({}); 

  const [bankProducts, setBankProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  // Default Requirements expanded state matches user request to see details
  const [expandedSections, setExpandedSections] = useState({ products: true, documents: true, personal: false, requirements: true });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false); 
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openDetailsId, setOpenDetailsId] = useState(null); 
  
  const [personalDetails, setPersonalDetails] = useState({ 
      name: "", dob: "", gender: "", marital: "", residence: "", nationality: "", 
      salary: "", employer: "", 
      passportNo: "", passportCountry: "", 
      emiratesId: "", emiratesExpiry: "", 
      building: "", unit: "", street: "", country: "", city: "", emirate: "" 
  });

  // --- 1. GET LEAD DATA (FIXED FOR REAL-TIME UPDATE) ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const leadId = getLeadId();
            if (!leadId) {
                console.warn("No Lead ID");
                setErrorMsg("No application found.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/api/mortgages/get-lead-data?lead_id=${leadId}`);
            const result = await response.json();
            
            console.log("🔥 API RESULT (Dashboard):", result); 

            if (result.success && result.data) {
                setApiData(result.data); // Save full data
                
                // Extract Documents
                const getNonEmpty = (obj) => (obj && Object.keys(obj).length > 0) ? obj : null;
                const rawDocs = getNonEmpty(result.data.upload_your_document) || 
                                getNonEmpty(result.data.upload_documents) || 
                                getNonEmpty(result.data.lead?.documents) || 
                                {};

                const normalizeArray = (val) => Array.isArray(val) && val.length > 0 ? val : [];
                const normalizeString = (val) => typeof val === "string" && val.trim() !== "" ? val : "";

                setDocuments({
                    passport: normalizeString(rawDocs.passport),
                    visa: normalizeString(rawDocs.visa),
                    emiratesId: normalizeString(rawDocs.emirates_id),
                    marriageCert: normalizeString(rawDocs.marriage_certificate),
                    bankStatements: normalizeArray(rawDocs.bank_statements),
                    payslips: normalizeArray(rawDocs.payslips),
                    salaryCert: normalizeString(rawDocs.salary_certificate),
                });

                // Extract Personal Details
                const lead = result.data.lead || {};
                const pd = result.data.personal_details || {};
                
                let finalName = pd.full_name || (typeof lead.name === 'object' ? `${lead.name.first_name} ${lead.name.last_name}` : lead.name) || "";
                
                setPersonalDetails({
                    name: finalName,
                    email: pd.email || lead.email || "",
                    salary: pd.monthly_salary || lead.monthly_income || "",
                    employer: pd.employer || pd.employer_name || lead.occupation || "", 
                    residence: pd.residence_status || (lead.residency_status === 'non_resident' ? "Non-Resident" : "UAE Resident"),
                    nationality: pd.nationality || "",
                    dob: pd.dob || "",
                    gender: pd.gender || "",
                    marital: pd.marital_status || "",
                    passportNo: pd.passport_number || "",
                    passportCountry: pd.passport_issueing_country || pd.passport_country || "",
                    emiratesId: pd.emirates_id || "",
                    emiratesExpiry: pd.emirated_expiry_date || pd.emirates_expiry || "",
                    building: pd.building_name || pd.building || "",
                    unit: pd.residential_address_unit || pd.unit || "",
                    street: pd.street_address || pd.street || "",
                    country: pd.country || lead.country || "UAE",
                    city: pd.city || lead.city || "",
                    emirate: pd.emirate || lead.area || ""
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMsg("Network Error: Could not fetch data.");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // --- 2. GET BANK PRODUCTS ---
  useEffect(() => {
    const fetchBankProducts = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/mortgages/get-all-bank-products`);
            if(response.ok) {
                const result = await response.json();
                if(result.success) setBankProducts(result.data);
            }
        } catch (error) { console.error(error); } 
        finally { setLoadingProducts(false); }
    };
    fetchBankProducts();
  }, []);

  // --- 3. SAVE PERSONAL DETAILS ---
  const handleSavePersonalDetails = async () => {
      setIsSavingPersonal(true);
      const payload = {
          full_name: personalDetails.name,
          dob: personalDetails.dob,
          gender: personalDetails.gender,
          marital_status: personalDetails.marital,
          residence_status: personalDetails.residence,
          nationality: personalDetails.nationality,
          monthly_salary: Number(personalDetails.salary),
          employer: personalDetails.employer,
          passport_number: personalDetails.passportNo,
          passport_issueing_country: personalDetails.passportCountry,
          emirates_id: personalDetails.emiratesId,
          emirated_expiry_date: personalDetails.emiratesExpiry,
          building_name: personalDetails.building,
          residential_address_unit: personalDetails.unit,
          street_address: personalDetails.street,
          country: personalDetails.country,
          city: personalDetails.city,
          emirate: personalDetails.emirate
      };
      const queryParams = new URLSearchParams({ customerId: getCustomerId(), application_id: getAppId(), lead_id: getLeadId() }).toString();

      try {
          const response = await fetch(`${BASE_URL}/api/mortgages/update-personal-details?${queryParams}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (response.ok) setIsEditingPersonal(false);
          else alert("Failed to save details. Please try again.");
      } catch (error) { alert("Network error occurred."); } 
      finally { setIsSavingPersonal(false); }
  };

  const handlePersonalDetailsAction = () => isEditingPersonal ? handleSavePersonalDetails() : setIsEditingPersonal(true);

  // Handlers
  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  const handlePersonalChange = (field, value) => setPersonalDetails(prev => ({ ...prev, [field]: value }));
  const handleUploadClick = () => navigate('/mortgages-product-upload-document'); 
  const handleEditRequirements = () => navigate('/product-requirements-edit');
  const handleSelectOffer = (id) => { setSelectedProductId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleProductDetails = (id) => setOpenDetailsId(prev => prev === id ? null : id);

  const hasDocuments = Object.values(documents).some(val => (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val.trim().length > 0));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]"><Loader2 className="w-10 h-10 animate-spin text-[#5c039b]" /></div>;
  if (errorMsg) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] p-4"><div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2><p className="text-gray-600 mb-6">{errorMsg}</p><button onClick={() => navigate('/mortgages')} className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800">Go to Home</button></div></div>;

  const { mortgage_application, lead, product_selected, product_requirements } = apiData || {};

  // --- 🔥 PRIORITY DATA SELECTOR ---
  // Prefer 'product_selected' (edited data) -> then 'product_requirements' -> then 'mortgage_application' -> then 'lead'
  const getData = (key, altKey, fallback) => {
      // Check for edited data first
      if (product_selected?.[key]) return product_selected[key];
      if (product_requirements?.[key]) return product_requirements[key];
      if (mortgage_application?.[key]) return mortgage_application[key];
      if (lead?.[altKey]) return lead[altKey];
      return fallback || '-';
  };

  const displayVal = (val, suffix='') => val ? `${val} ${suffix}` : '-';
  const displayBool = (val) => (val === true || val === 'yes' || val === 'true') ? 'YES' : 'NO';
  const formatStr = (str) => str ? str.replace(/_/g, ' ').toUpperCase() : '-';

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans p-6 md:p-12 text-[#1a1a1a]">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <div><div className="text-gray-500 text-sm mb-2">My Applications / Details</div><h1 className="text-3xl font-bold text-gray-900">Application ID - {mortgage_application?.application_id || getAppId() || '---'}</h1></div>
          <button onClick={() => navigate('/my-applications')} className="bg-[#5c039b] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center hover:bg-[#4a027a] transition shadow-sm"><LayoutGrid size={16} className="mr-2" /> View My Applications</button>
        </div>
        
        {/* SUMMARY GRID (Top Bar) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 bg-transparent">
          <SummaryItem label="Loan type" value={formatStr(getData('purchase_type', 'lead_sub_type'))} />
          <SummaryItem label="Income type" value={formatStr(getData('primary_application_income_type', 'occupation'))} />
          <SummaryItem label="Property value" value={displayVal(Number(getData('property_value', 'price')).toLocaleString(), 'AED')} />
          <SummaryItem label="Loan preference" value={formatStr(getData('mortgage_type', 'mortgage_type'))} />
          <div className="flex flex-col items-start"><span className="text-gray-500 text-xs mb-1">Status</span><StatusBadge status={mortgage_application?.status} /></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full lg:max-w-[calc(100%-350px)]">
          {selectedProductId && <ApplicationReadyBanner />}
          
          <Card title="Select your product" subTitle="Hover over a product and click select..." icon={<CheckCircle size={20} />} isExpanded={expandedSections.products} toggleExpand={() => toggleSection('products')}>
              {loadingProducts ? <div className="flex justify-center py-6 text-gray-500"><Loader2 className="animate-spin mr-2"/> Loading offers...</div> : bankProducts.map((product) => <ProductOffer key={product._id} productData={product} isSelected={selectedProductId === product._id} onSelect={handleSelectOffer} isDetailsOpen={openDetailsId === product._id} onToggleDetails={toggleProductDetails} />)}
          </Card>

          <Card title="Upload your documents" subTitle={hasDocuments ? "Your uploaded documents" : "Upload documents required"} icon={<FileText size={20} />} onUpload={handleUploadClick} isExpanded={expandedSections.documents} toggleExpand={() => toggleSection('documents')}>
              {hasDocuments ? (
                <div className="space-y-1 animate-fade-in">
                    <div className="mb-6 pb-2 border-b border-gray-100"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Personal Documents</h4></div>
                    {documents.passport && <UploadedFileItem label="Passport" url={documents.passport} />}
                    {documents.visa && <UploadedFileItem label="Visa" url={documents.visa} />}
                    {documents.emiratesId && <UploadedFileItem label="Emirates ID" url={documents.emiratesId} />}
                    {documents.marriageCert && <UploadedFileItem label="Marriage Certificate" url={documents.marriageCert} />}
                    <div className="mb-6 pt-4 pb-2 border-b border-gray-100"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Income Documents</h4></div>
                    {documents.bankStatements?.length > 0 && <UploadedFileItem label="Bank Statements" url={documents.bankStatements} isArray />}
                    {documents.payslips?.length > 0 && <UploadedFileItem label="Payslips" url={documents.payslips} isArray />}
                    {documents.salaryCert && <UploadedFileItem label="Salary Certificate" url={documents.salaryCert} />}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 animate-fade-in">
                    <div className="w-16 h-16 mb-4 text-gray-300 bg-white rounded-full flex items-center justify-center shadow-sm"><Upload size={28} /></div>
                    <p className="text-gray-900 font-medium mb-1">No documents uploaded yet</p>
                    <button onClick={handleUploadClick} className="mt-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">Start Uploading</button>
                </div>
              )}
          </Card>

          <Card title={isEditingPersonal ? "Edit personal details" : "Personal details"} subTitle="Manage your personal information." icon={<User size={20} />} onEdit={handlePersonalDetailsAction} isEditing={isEditingPersonal} isSaving={isSavingPersonal} isExpanded={expandedSections.personal} toggleExpand={() => toggleSection('personal')}>
              {isEditingPersonal ? (
                  <div className="space-y-8 animate-fade-in py-2">
                      <div><h4 className="text-lg font-bold text-gray-900 mb-5">Basic Info</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Full Name" required value={personalDetails.name} onChange={(e) => handlePersonalChange('name', e.target.value)} /><FormInput label="Date of Birth" required type="date" value={personalDetails.dob} onChange={(e) => handlePersonalChange('dob', e.target.value)} /><FormSelect label="Gender" required options={["Male", "Female"]} value={personalDetails.gender} onChange={(e) => handlePersonalChange('gender', e.target.value)} /><FormSelect label="Marital Status" required options={["Single", "Married", "Divorced"]} value={personalDetails.marital} onChange={(e) => handlePersonalChange('marital', e.target.value)} /><FormInput label="Residence status" required value={personalDetails.residence} onChange={(e) => handlePersonalChange('residence', e.target.value)} /><FormInput label="Nationality" required value={personalDetails.nationality} onChange={(e) => handlePersonalChange('nationality', e.target.value)} /></div></div>
                      <div><h4 className="text-lg font-bold text-gray-900 mb-5 border-t pt-6">Detailed info</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Monthly Salary" required type="number" suffix="AED" value={personalDetails.salary} onChange={(e) => handlePersonalChange('salary', e.target.value)} /><FormInput label="Employer" required value={personalDetails.employer} onChange={(e) => handlePersonalChange('employer', e.target.value)} /><FormInput label="Passport Number" required value={personalDetails.passportNo} onChange={(e) => handlePersonalChange('passportNo', e.target.value)} /><FormSelect label="Passport Issuing Country" required options={["India", "UAE", "UK", "USA"]} value={personalDetails.passportCountry} onChange={(e) => handlePersonalChange('passportCountry', e.target.value)} /><FormInput label="Emirates ID#" value={personalDetails.emiratesId} onChange={(e) => handlePersonalChange('emiratesId', e.target.value)} /><FormInput label="Emirates Expiry Date" type="date" value={personalDetails.emiratesExpiry} onChange={(e) => handlePersonalChange('emiratesExpiry', e.target.value)} /></div></div>
                      <div><h4 className="text-lg font-bold text-gray-900 mb-5 border-t pt-6">Residential address</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Building name" value={personalDetails.building} onChange={(e) => handlePersonalChange('building', e.target.value)} /><FormInput label="Unit" value={personalDetails.unit} onChange={(e) => handlePersonalChange('unit', e.target.value)} /><FormInput label="Street address" value={personalDetails.street} onChange={(e) => handlePersonalChange('street', e.target.value)} /><FormSelect label="Country" options={["UAE", "India"]} value={personalDetails.country} onChange={(e) => handlePersonalChange('country', e.target.value)} /><FormInput label="City" value={personalDetails.city} onChange={(e) => handlePersonalChange('city', e.target.value)} /><FormInput label="Emirate/State" value={personalDetails.emirate} onChange={(e) => handlePersonalChange('emirate', e.target.value)} /></div></div>
                  </div>
              ) : (
                  <>
                      <div className="mb-8"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Basic Info</h4><DataRow label="Name" value={personalDetails.name} /><DataRow label="Email" value={personalDetails.email} /><DataRow label="Date of birth" value={personalDetails.dob} /><DataRow label="Gender" value={personalDetails.gender} /><DataRow label="Marital status" value={personalDetails.marital} /><DataRow label="Residence status" value={personalDetails.residence} /><DataRow label="Nationality" value={personalDetails.nationality} /></div>
                      <div className="mb-8"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Detailed Info</h4><DataRow label="Salary (AED)" value={personalDetails.salary} /><DataRow label="Employer" value={personalDetails.employer} /><DataRow label="Passport number" value={personalDetails.passportNo} /><DataRow label="Passport Country" value={personalDetails.passportCountry} /><DataRow label="Emirates ID#" value={personalDetails.emiratesId} /></div>
                      <div className="mb-2"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Address</h4><DataRow label="Address" value={`${personalDetails.unit ? '#' + personalDetails.unit + ', ' : ''}${personalDetails.building ? personalDetails.building + ', ' : ''}${personalDetails.street}`} /><DataRow label="City / Country" value={`${personalDetails.city}, ${personalDetails.country}`} /></div>
                  </>
              )}
          </Card>
          
          {/* 🔥 PRODUCT REQUIREMENTS - CONNECTED TO REAL DATA */}
          <Card title="Product requirements" subTitle="Review and update your loan requirements." icon={<LayoutGrid size={20} />} onEdit={handleEditRequirements} isEditing={false} isExpanded={expandedSections.requirements} toggleExpand={() => toggleSection('requirements')}>
              <div className="mb-8"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Loan Details</h4>
                  <DataRow label="Purchase type" value={formatStr(getData('purchase_type', 'lead_sub_type'))} />
                  <DataRow label="Has mortgage" value={displayBool(getData('existing_mortgage', 'has_existing_mortgage', 'no'))} />
                  <DataRow label="Found property" value={displayBool(getData('found_property', 'has_property', 'no'))} />
                  <DataRow label="Mortgage type" value={formatStr(getData('mortgage_type', 'mortgage_type'))} />
                  <DataRow label="Fixed term" value={formatStr(getData('fixed_term', 'fixed_term'))} />
                  <DataRow label="Loan type" value={formatStr(getData('loan_type', 'loan_type'))} />
                  <DataRow label="Loan period" value={displayVal(getData('loan_period', 'loan_period'), 'Years')} />
                  <DataRow label="Loan to value" value={displayVal(getData('loan_to_value', 'ltv'), '%')} />
              </div>
              <div className="mb-8"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Income</h4>
                  <DataRow label="Income type" value={formatStr(getData('primary_application_income_type', 'occupation', 'Salaried'))} />
                  <DataRow label="Income" value={displayVal(Number(getData('primary_application_income', 'monthly_income', 0)).toLocaleString(), 'AED')} />
                  <DataRow label="Age" value={displayVal(getData('primary_application_age', 'age'))} />
                  <DataRow label="Finance audit" value={displayBool(getData('primary_applicant_finance_audit', 'finance_audit', 'no'))} />
              </div>
              <div className="mb-2"><h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Property</h4>
                  <DataRow label="Property value" value={displayVal(Number(getData('property_value', 'price', 0)).toLocaleString(), 'AED')} />
                  <DataRow label="Property emirate" value={getData('property_emirate', 'emirate', 'Dubai')} />
                  <DataRow label="Property area" value={getData('property_area', 'area')} />
              </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - ADVISOR CARD */}
        <div className="w-full lg:w-80 flex-shrink-0 sticky top-6">
          <div className="bg-[#F3F5F7] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-200">
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" alt="Advisor" className="w-full h-full object-cover" />
                  </div>
                  <div><h3 className="font-bold text-gray-900 text-lg leading-tight">Syed Uddin</h3><p className="text-sm text-[#6B7280] font-medium">Assigned to help you</p></div>
              </div>
              <div className="space-y-3">
                  <a href="mailto:syed.salman@holo.ae" className="flex items-center bg-white px-4 py-3.5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group no-underline"><div className="text-gray-500 group-hover:text-[#5c039b] transition-colors"><Mail size={20} /></div><span className="text-gray-800 font-medium text-sm ml-4 truncate">syed.salman@holo.ae</span></a>
                  <a href="tel:+971566138560" className="flex items-center bg-white px-4 py-3.5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group no-underline"><div className="text-gray-500 group-hover:text-[#5c039b] transition-colors"><Phone size={20} /></div><span className="text-gray-800 font-medium text-sm ml-4">+971 56 613 8560</span></a>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageProduct;