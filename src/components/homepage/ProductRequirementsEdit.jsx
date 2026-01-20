import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://xoto.ae";

// --- HELPERS ---
const getLeadId = () => localStorage.getItem("mortgage_lead_id");

// --- UI COMPONENTS ---
const FormInput = ({ label, value, onChange, type = "text", suffix, showClear, onClear }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative flex items-center">
      <input
        type={type}
        value={value || ''} // Shows empty if undefined/null
        onChange={onChange}
        className={`w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-shadow ${suffix ? 'rounded-r-none border-r-0' : ''}`}
      />
      {showClear && value && (
        <button onClick={onClear} className="absolute right-3 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      )}
      {suffix && (
        <div className="bg-white border border-l-0 border-gray-300 rounded-r-md px-3 py-2.5 text-gray-500 text-sm font-medium min-w-[3rem] flex justify-center items-center">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <select
        value={value || ''} // Shows "Select option" if empty
        onChange={onChange}
        className={`w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white ${!value ? 'text-gray-400' : ''}`}
      >
        <option value="" disabled>Select option</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-gray-900">{opt}</option>
        ))}
      </select>
      <div className="absolute right-3 top-2.5 flex items-center pointer-events-none">
         <ChevronDown size={14} className="text-gray-500" />
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ProductRequirementsEdit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Store IDs for Submission
  const [currentIds, setCurrentIds] = useState({ appId: null, customerId: null, leadId: null });

  // Form State
  const [formData, setFormData] = useState({
    purchaseType: "",
    hasMortgage: "",
    foundProperty: "",
    applicant: "",
    mortgageType: "",
    fixedTerm: "",
    loanType: "",
    loanPeriod: "",
    ltv: "",
    
    // Income
    incomeType: "",
    income: "",
    age: "",
    financeAudit: "",

    // Property
    propertyValue: "",
    propertyEmirate: "",
    propertyArea: ""
  });

  // --- 1. FETCH DATA ON LOAD (UPDATED PROPERTY MAPPING) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leadId = getLeadId();
        if (!leadId) { setIsLoading(false); return; }

        console.log("Fetching for Lead ID:", leadId);
        const response = await fetch(`${BASE_URL}/api/mortgages/get-lead-data?lead_id=${leadId}`);
        const json = await response.json();

        console.log("🔥 API Data:", json);

        if (json.success && json.data) {
            const data = json.data;
            const product = data.product_selected || {}; 
            const app = data.mortgage_application || {}; 
            const lead = data.lead || {};
            
            // Capture IDs
            setCurrentIds({
                appId: app.application_id,
                customerId: app.customerId,
                leadId: app.lead_id
            });

            // --- HELPERS ---
            const formatYesNo = (val) => {
                if (val === "yes" || val === true) return "Yes";
                if (val === "no" || val === false) return "No";
                return ""; 
            };

            const formatCapitalize = (val) => {
                if (!val || val === "-") return "";
                return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
            };

            const formatNumber = (val) => {
                if (!val || val === 0 || val === "0" || val === "-") return "";
                return val;
            };

            // Map API Data
            setFormData({
                // Loan Information
                purchaseType: product.purchase_type === "home_loan" ? "New purchase" : (product.purchase_type === "refinance" ? "Refinance" : ""),
                hasMortgage: formatYesNo(product.existing_mortgage),
                foundProperty: formatYesNo(product.found_property),
                applicant: product.applicant === "joint" ? "Joint Applicant" : (product.applicant === "single" ? "Single Applicant" : ""),
                
                mortgageType: formatCapitalize(product.mortgage_type),
                fixedTerm: product.fixed_term ? product.fixed_term.replace('_', ' ').replace('years', 'Years') : "",
                loanType: formatCapitalize(product.loan_type),
                
                loanPeriod: formatNumber(product.loan_period),
                ltv: formatNumber(product.loan_to_value),

                // Income Information
                incomeType: product.primary_application_income_type || "",
                income: formatNumber(product.primary_application_income),
                age: formatNumber(product.primary_application_age),
                financeAudit: formatYesNo(product.primary_applicant_finance_audit),

                // --- 🔥 PROPERTY INFORMATION (UPDATED) ---
                // Priority: Product > App > Lead
                propertyValue: formatNumber(product.property_value || app.property_value || lead.price),
                
                propertyEmirate: product.property_emirate || app.property_emirate || lead.emirate || lead.city || "",
                
                propertyArea: product.property_area || app.property_area || lead.property_area || lead.area || ""
            });
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleClear = (field) => setFormData(prev => ({ ...prev, [field]: "" }));

  // --- 2. SUBMIT DATA ---
  const handleSubmit = async () => {
    if (!currentIds.appId) { alert("Application ID missing. Please refresh."); return; }
    
    setIsSaving(true);

    const queryParams = new URLSearchParams({
        customerId: currentIds.customerId,
        application_id: currentIds.appId,
        lead_id: currentIds.leadId
    }).toString();

    // Map Payload
    const payload = {
        purchase_type: formData.purchaseType === "New purchase" ? "home_loan" : (formData.purchaseType === "Refinance" ? "refinance" : null),
        existing_mortgage: formData.hasMortgage ? formData.hasMortgage.toLowerCase() : null,
        found_property: formData.foundProperty ? formData.foundProperty.toLowerCase() : null,
        applicant: formData.applicant === "Joint Applicant" ? "joint" : (formData.applicant === "Single Applicant" ? "single" : null),
        
        mortgage_type: formData.mortgageType ? formData.mortgageType.toLowerCase() : null,
        fixed_term: formData.fixedTerm ? formData.fixedTerm.toLowerCase().replace(" ", "_") : null,
        
        loan_type: formData.loanType ? formData.loanType.toLowerCase() : null,
        loan_period: Number(formData.loanPeriod) || 0,
        loan_to_value: Number(formData.ltv) || 0,
        
        primary_application_income_type: formData.incomeType || null,
        primary_application_income: Number(formData.income) || 0,
        primary_application_age: Number(formData.age) || 0,
        primary_applicant_finance_audit: formData.financeAudit ? formData.financeAudit.toLowerCase() : null,
        
        property_value: Number(formData.propertyValue) || 0,
        property_emirate: formData.propertyEmirate || null,
        property_area: formData.propertyArea || null
    };

    try {
        const response = await fetch(`${BASE_URL}/api/mortgages/edit-product-requirements?${queryParams}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            navigate('/mortgages-product');
        } else {
            console.error("Error:", result);
            alert("Update failed: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Network error.");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#5c039b] w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans p-6 md:p-12 text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 animate-fade-in">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-4 transition-colors">
             <ArrowLeft size={18} className="mr-2"/> Back
          </button>
          <div className="text-gray-500 text-sm mb-2">My Applications / Details / Product Requirement</div>
          <h1 className="text-4xl font-bold text-gray-900">Edit product requirements</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          <div className="mb-10">
             <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Loan Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect label="Purchase type" value={formData.purchaseType} onChange={(e) => handleChange('purchaseType', e.target.value)} options={["New purchase", "Refinance"]}/>
                <FormSelect label="Do you have an existing mortgage?" value={formData.hasMortgage} onChange={(e) => handleChange('hasMortgage', e.target.value)} options={["Yes", "No"]}/>
                <FormSelect label="Found property?" value={formData.foundProperty} onChange={(e) => handleChange('foundProperty', e.target.value)} options={["Yes", "No"]}/>
                <FormSelect label="Applicant Type" value={formData.applicant} onChange={(e) => handleChange('applicant', e.target.value)} options={["Single Applicant", "Joint Applicant"]}/>
                <FormSelect label="Mortgage type" value={formData.mortgageType} onChange={(e) => handleChange('mortgageType', e.target.value)} options={["Fixed", "Variable"]}/>
                <FormSelect label="Fixed term preference" value={formData.fixedTerm} onChange={(e) => handleChange('fixedTerm', e.target.value)} options={["1 Year", "3 Years", "5 Years"]}/>
                <FormSelect label="Loan type" value={formData.loanType} onChange={(e) => handleChange('loanType', e.target.value)} options={["Islamic", "Conventional"]}/>
                <FormInput label="Loan period (Years)" value={formData.loanPeriod} onChange={(e) => handleChange('loanPeriod', e.target.value)} type="number"/>
                <FormInput label="Loan To Value (LTV)" value={formData.ltv} onChange={(e) => handleChange('ltv', e.target.value)} suffix="%" type="number"/>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Income Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormSelect label="Income Type" value={formData.incomeType} onChange={(e) => handleChange('incomeType', e.target.value)} options={["Salaried", "Self Employed"]}/>
                <FormInput label="Monthly Income" value={formData.income} onChange={(e) => handleChange('income', e.target.value)} suffix="AED" type="number"/>
                <FormInput label="Applicant Age" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} type="number"/>
                <FormSelect label="Finance Audit available?" value={formData.financeAudit} onChange={(e) => handleChange('financeAudit', e.target.value)} options={["Yes", "No"]}/>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput label="Property Value" value={formData.propertyValue} onChange={(e) => handleChange('propertyValue', e.target.value)} suffix="AED" type="number"/>
                <FormSelect label="Property Emirate" value={formData.propertyEmirate} onChange={(e) => handleChange('propertyEmirate', e.target.value)} options={["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"]}/>
                <FormInput label="Property Area" value={formData.propertyArea} onChange={(e) => handleChange('propertyArea', e.target.value)} showClear onClear={() => handleClear('propertyArea')}/>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4">
            <button onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="bg-[#5c039b] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#4a027a] transition-colors flex items-center shadow-lg disabled:opacity-70">{isSaving ? <><Loader2 className="animate-spin mr-2" size={18}/> Saving...</> : <><Save className="mr-2" size={18}/> Save Changes</>}</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductRequirementsEdit;