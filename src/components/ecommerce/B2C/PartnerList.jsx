// src/components/Vault/PartnerList.jsx
import { useState, useEffect } from "react";
import { Eye, Building2, Mail, Phone, MapPin, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../CMS/pages/custom/CustomTable";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPartners, setTotalPartners] = useState(0);
  const navigate = useNavigate();

  const fetchPartners = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/vault/partner/all?page=${page}&limit=${itemsPerPage}`);
      const data = response?.data || response;

      let partnersList = [];
      let total = 0;

      if (Array.isArray(data)) {
        partnersList = data;
        total = data.length;
      } else if (data?.partners) {
        partnersList = data.partners;
        total = data.total || data.partners.length;
      } else if (data?.data) {
        partnersList = data.data;
        total = data.total || data.data.length;
      } else if (data?.docs) {
        partnersList = data.docs;
        total = data.totalDocs || data.docs.length;
      }

      setPartners(partnersList);
      setTotalPartners(total);
    } catch (err) {
      setError(err.message || "Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(currentPage);
  }, [currentPage, itemsPerPage]);

  // CustomTable expects: { key, title, render }
  const columns = [
    {
      key: "companyName",
      title: "Company",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{row.companyName || "—"}</p>
            <p className="text-xs text-gray-400">{row.legalEntityType || "LLC"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (_, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={13} className="text-gray-400 flex-shrink-0" />
          <span>{row.primaryContact?.email || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (_, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={13} className="text-gray-400 flex-shrink-0" />
          <span>{row.primaryContact?.phone || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (_, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
          <span>{row.billingAddress?.city || row.billingAddress?.area || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/dashboard/vault-admin/partner-details/${row._id || row.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
        >
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchPartners(currentPage)}
          className="px-5 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Partners</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalPartners} partner{totalPartners !== 1 ? "s" : ""} registered
          </p>
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={partners}
        loading={loading}
        // Server-side pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalPartners}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
      />
    </div>
  );
} 