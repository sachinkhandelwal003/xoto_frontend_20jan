// src/components/Vault/PartnerDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, User, Users, MapPin, CreditCard, Percent, FileText, KeyRound,
  ChevronLeft, Mail, Phone, AlertCircle, Loader2, Globe, Calendar, Briefcase,
  Home, DollarSign, Shield, Award, FileCheck, Clock, Copy, Check
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchPartner();
  }, [id]);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiService.get(`/vault/partner/get/${id}`);
      const data = res?.data || res;
      setPartner(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const show = (val) => val || "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-700 mx-auto mb-4" />
          <p className="text-gray-500">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || "Partner not found"}</p>
        <button
          onClick={() => navigate(`/dashboard/${"vault-admin"}/partners`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Back button */}
      <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-1 text-gray-600 hover:text-[#5C039B] text-sm mb-4"
>
  <ChevronLeft size={16} />
  Back
</button>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="p-3 bg-purple-100 rounded-2xl">
          <Building2 className="w-8 h-8 text-purple-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{partner.companyName}</h1>
        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
          {partner.legalEntityType || "LLC"}
        </span>
        {partner.isActive === false && (
          <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* Stats summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Calendar size={18} className="text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">Since</p><p className="font-semibold">{show(new Date(partner.createdAt).toLocaleDateString())}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Briefcase size={18} className="text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">Branches</p><p className="font-semibold">{show(partner.numberOfBranches)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Award size={18} className="text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">License</p><p className="font-semibold text-sm">{show(partner.tradeLicenseNumber)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Globe size={18} className="text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">Website</p><p className="font-semibold truncate">{partner.website ? <a href={`https://${partner.website}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">{partner.website}</a> : "—"}</p></div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Building2 size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Company Details</h2>
          </div>
          <div className="p-6 space-y-3">
            <DetailRow label="Trade License" value={partner.tradeLicenseNumber} copy />
            <DetailRow label="Issue Date" value={partner.tradeLicenseIssueDate?.split("T")[0]} />
            <DetailRow label="Expiry Date" value={partner.tradeLicenseExpiryDate?.split("T")[0]} />
            <DetailRow label="TRN" value={partner.taxRegistrationNumber} copy />
            <DetailRow label="DBA / Trade Name" value={partner.dbaName} />
            <DetailRow label="Year Established" value={partner.yearEstablished} />
          </div>
        </div>

        {/* Primary Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <User size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Primary Contact</h2>
          </div>
          <div className="p-6 space-y-3">
            <DetailRow label="Name" value={partner.primaryContact?.name} />
            <DetailRow label="Designation" value={partner.primaryContact?.designation} />
            <DetailRow label="Email" value={partner.primaryContact?.email} copy icon={<Mail size={14} />} />
            <DetailRow label="Phone" value={`${partner.primaryContact?.countryCode || ""} ${partner.primaryContact?.phone || ""}`.trim()} copy icon={<Phone size={14} />} />
            <DetailRow label="WhatsApp" value={partner.primaryContact?.whatsappNumber} />
            <DetailRow label="Emirates ID" value={partner.primaryContact?.emiratesId} />
          </div>
        </div>

        {/* Secondary Contact (if exists) */}
        {partner.secondaryContact?.name && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              <h2 className="font-bold text-gray-800">Secondary Contact</h2>
            </div>
            <div className="p-6 space-y-3">
              <DetailRow label="Name" value={partner.secondaryContact.name} />
              <DetailRow label="Designation" value={partner.secondaryContact.designation} />
              <DetailRow label="Email" value={partner.secondaryContact.email} copy icon={<Mail size={14} />} />
              <DetailRow label="Phone" value={`${partner.secondaryContact.countryCode || ""} ${partner.secondaryContact.phone || ""}`.trim()} copy icon={<Phone size={14} />} />
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <MapPin size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Billing Address</h2>
          </div>
          <div className="p-6 space-y-2">
            <p>{[partner.billingAddress?.buildingName, partner.billingAddress?.floorUnit].filter(Boolean).join(", ") || "—"}</p>
            <p>{[partner.billingAddress?.area, partner.billingAddress?.city].filter(Boolean).join(", ") || "—"}</p>
            <p>PO Box: {show(partner.billingAddress?.poBox)} | {show(partner.billingAddress?.country)}</p>
          </div>
          {partner.shippingAddress && JSON.stringify(partner.shippingAddress) !== JSON.stringify(partner.billingAddress) && (
            <>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <MapPin size={14} className="text-purple-500" />
                <span className="text-sm font-semibold text-gray-600">Shipping Address</span>
              </div>
              <div className="p-6 pt-0 space-y-2">
                <p>{[partner.shippingAddress?.buildingName, partner.shippingAddress?.floorUnit].filter(Boolean).join(", ") || "—"}</p>
                <p>{[partner.shippingAddress?.area, partner.shippingAddress?.city].filter(Boolean).join(", ") || "—"}</p>
              </div>
            </>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <CreditCard size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Bank Details</h2>
          </div>
          <div className="p-6 space-y-3">
            <DetailRow label="Beneficiary" value={partner.bankDetails?.beneficiaryName} copy />
            <DetailRow label="Bank Name" value={partner.bankDetails?.bankName} />
            <DetailRow label="Account Number" value={partner.bankDetails?.accountNumber} copy />
            <DetailRow label="IBAN" value={partner.bankDetails?.iban} copy />
            <DetailRow label="SWIFT Code" value={partner.bankDetails?.swiftCode} copy />
            <DetailRow label="Account Type" value={partner.bankDetails?.accountType} />
          </div>
        </div>

        {/* Commission Configuration */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Percent size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Commission Tiers</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-purple-800">Tier 1</p>
              <p className="text-sm">Up to {show(partner.commissionConfiguration?.tier1?.loanAmountMax)} AED → {show(partner.commissionConfiguration?.tier1?.commissionPercentage)}%</p>
              <p className="text-xs text-gray-500">{partner.commissionConfiguration?.tier1?.description}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-purple-800">Tier 2</p>
              <p className="text-sm">Min {show(partner.commissionConfiguration?.tier2?.loanAmountMin)} AED → {show(partner.commissionConfiguration?.tier2?.commissionPercentage)}%</p>
              <p className="text-xs text-gray-500">{partner.commissionConfiguration?.tier2?.description}</p>
            </div>
            <DetailRow label="Payment Terms" value={partner.commissionConfiguration?.paymentTerms} />
            <DetailRow label="Calculation Basis" value={partner.commissionConfiguration?.calculationBasis} />
          </div>
        </div>

        {/* Agreement Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <FileText size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Agreement</h2>
          </div>
          <div className="p-6 space-y-3">
            <DetailRow label="Type" value={partner.agreementDetails?.agreementType} />
            <DetailRow label="Start Date" value={partner.agreementDetails?.startDate?.split("T")[0]} />
            <DetailRow label="End Date" value={partner.agreementDetails?.endDate?.split("T")[0]} />
            <DetailRow label="Signed by Xoto" value={partner.agreementDetails?.signedByXoto} />
            <DetailRow label="Signed by Partner" value={partner.agreementDetails?.signedByPartner} />
            <DetailRow label="Auto Renew" value={partner.agreementDetails?.autoRenew ? "Yes" : "No"} />
            {partner.agreementDetails?.documentUrl && (
              <div className="pt-2">
                <a href={partner.agreementDetails.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-purple-600 hover:underline text-sm">
                  <FileCheck size={14} /> View Agreement Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <KeyRound size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800">Login Credentials</h2>
          </div>
          <div className="p-6 space-y-3">
            <DetailRow label="Username" value={partner.username} copy />
            <DetailRow label="Password" value="••••••••" copy={false} />
            <DetailRow label="Account Created" value={new Date(partner.createdAt).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail rows with copy functionality
const DetailRow = ({ label, value, copy = false, icon = null }) => {
  const [copied, setCopied] = useState(false);
  const displayValue = value || "—";

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between py-1 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 text-sm min-w-[120px]">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-800 text-sm break-all text-right flex-1 justify-end">
        {displayValue}
        {copy && value && (
          <button onClick={handleCopy} className="text-gray-400 hover:text-purple-600 transition" title="Copy">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};