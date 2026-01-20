import React, { useState, useEffect } from 'react';
import { Plus, Info, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://xoto.ae"; 

// --- Sub-Components ---

const DetailItem = ({ label, value, isManager }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500 text-sm w-1/3">{label}</span>
    <div className="w-2/3 flex justify-start">
        {isManager && value ? (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-2">
                {/* Avatar Placeholder */}
                <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`} 
                        alt="manager" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="text-gray-700 text-sm font-medium">{value}</span>
            </div>
        ) : (
            <span className="text-gray-900 font-medium text-sm">{value || '-'}</span>
        )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
    // Helper for status colors
    const getStatusStyle = (s) => {
        if (!s) return "bg-gray-100 text-gray-600 border-gray-200";
        const lower = s.toLowerCase();
        if (lower.includes('progress')) return "bg-[#FFF8E1] text-[#9A6B16] border-[#FFE082]/30";
        if (lower.includes('approv')) return "bg-green-50 text-green-700 border-green-200";
        if (lower.includes('reject')) return "bg-red-50 text-red-700 border-red-200";
        return "bg-gray-100 text-gray-600 border-gray-200";
    };

    return (
        <span className={`text-xs px-3 py-1 rounded-md font-medium border ${getStatusStyle(status)} capitalize`}>
            {status ? status.replace(/_/g, ' ') : 'Pending'}
        </span>
    );
};

const ApplicationCard = ({ data, onContinue }) => {
  // Date Formatting
  const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
      });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl animate-fade-in">
      {/* Card Header */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{data.application_id || "ID Pending"}</h3>
          <p className="text-gray-500 text-xs mt-1">Submit: {formatDate(data.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={data.status} />
          <button 
            onClick={onContinue}
            className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Warning/Info Strip */}
      <div className="px-6 mb-6">
        <div className="bg-[#FFFBE6] border border-[#FFE58F] text-[#595959] text-sm px-4 py-3 rounded-md flex items-center gap-2">
          <Info size={16} className="text-[#FAAD14]" fill="currentColor" color="white" />
          <span>Complete the requirements to get your mortgage</span>
        </div>
      </div>

      {/* --- BANK SECTION REMOVED AS REQUESTED --- */}

      {/* Details Grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {/* Left Column */}
            <div>
                <DetailItem label="Loan type" value={data.loan_type} />
                <DetailItem label="Income type" value={data.income_type} />
                <DetailItem label="Property value" value={data.property_value ? `${data.property_value} AED` : '-'} />
                <DetailItem label="Loan Amount" value={data.loan_amount ? `${data.loan_amount} AED` : '-'} />
            </div>

            {/* Right Column */}
            <div>
                <DetailItem label="Mortgage Manager" value={data.mortgage_manager} isManager={true} />
                <DetailItem label="Mortgage type" value={data.mortgage_type} />
                <DetailItem label="Loan preference" value={data.loan_preference} />
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const MyApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null);
  const [error, setError] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchApplications = async () => {
        try {
            const leadId = localStorage.getItem("mortgage_lead_id");
            
            if (!leadId) {
                // If no ID is found, just stop loading (empty state)
                setLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/api/mortgages/get-lead-data?lead_id=${leadId}`);
            const result = await response.json();

            if (result.success && result.data && result.data.mortgage_application) {
                setAppData(result.data.mortgage_application);
            } else {
               // Handle case where API works but data structure is different or empty
               console.log("No application data found in response");
            }

        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Could not load applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    fetchApplications();
  }, []);

  const handleCreateNew = () => {
      navigate('/mortgages'); // Redirect to Wizard start
  };

  const handleContinue = () => {
      navigate('/mortgages-product'); // Redirect to Details page
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans p-8 md:p-12 text-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Applications</h1>
          
          <button 
            onClick={handleCreateNew}
            className="bg-[#D1D5DB] text-white px-4 py-2.5 rounded-md text-sm font-medium flex items-center hover:bg-gray-400 transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" /> Create a new application
          </button>
        </div>

        {/* Section Title */}
        <h2 className="text-gray-500 text-lg font-medium mb-4">Active</h2>

        {/* Application List */}
        <div className="space-y-6">
            {error ? (
                <div className="bg-white p-8 rounded-lg text-center border border-red-200">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3"/>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : appData ? (
                // If data exists, show the card
                <ApplicationCard data={appData} onContinue={handleContinue} />
            ) : (
                // Empty State
                <div className="bg-white p-12 rounded-lg text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">You don't have any active applications yet.</p>
                    <button onClick={handleCreateNew} className="text-blue-600 hover:underline font-medium">Start a new application</button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default MyApplications;