// src/components/Vault/AgentDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, User, Mail, Phone, MapPin, Globe, Calendar,
  CreditCard, FileText, Banknote, ShieldCheck, Heart, Users,
  Loader2, AlertCircle, Building2, CheckCircle, XCircle,
  Clock, Star, DollarSign, Percent, Verified, Info, AlertTriangle
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const PURPLE = "#5C039B";
const GREEN = "#10B981";
const RED = "#EF4444";

export default function VaultAgentdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState({ type: "", text: "" });

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/vault/agent/get/${id}`);
      const data = response?.data || response;
      setAgent(data?.data || data);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [id]);

  // Open modal
  const handleOpenVerifyModal = () => {
    if (agent?.isVerified) {
      setVerifyMessage({ type: "info", text: "Agent is already verified." });
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 3000);
      return;
    }
    setRejectMode(false);
    setRejectionReason("");
    setShowVerifyModal(true);
  };

  // Verify action → sends { status: "verified" }
  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await apiService.post(`/vault/agent/partner/verify/${id}`, {
        status: "verified",
      });
      setVerifyMessage({ type: "success", text: "Agent successfully verified!" });
      await fetchAgent();
      setShowVerifyModal(false);
    } catch (err) {
      setVerifyMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Verification failed",
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 5000);
    }
  };

  // Reject action → sends { status: "rejected", rejectionReason: "..." }
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setVerifyMessage({ type: "error", text: "Please provide a rejection reason." });
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 3000);
      return;
    }
    setActionLoading(true);
    try {
      await apiService.post(`/vault/agent/partner/verify/${id}`, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
      });
      setVerifyMessage({ type: "success", text: "Agent rejected successfully." });
      await fetchAgent();
      setShowVerifyModal(false);
      setRejectionReason("");
    } catch (err) {
      setVerifyMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Rejection failed",
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <Loader2 size={36} color={PURPLE} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading agent details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <AlertCircle size={44} color={RED} style={{ marginBottom: 12 }} />
        <p style={{ color: "#B91C1C", marginBottom: 16, fontSize: 14 }}>{error || "Agent not found"}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const firstName = agent.name?.first_name || agent.first_name || agent.firstName || "";
  const lastName = agent.name?.last_name || agent.last_name || agent.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const isActive = agent.isActive === true || agent.status === "active";
  const phoneNumber = agent.phone?.number || agent.phone_number || agent.phoneNumber;
  const phoneCode = agent.phone?.country_code || agent.country_code || agent.countryCode;

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
          >
            <ChevronLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Agent Details</h1>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>ID: {agent._id || id}</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            
          </div>
        </div>

        {/* Flash Message */}
        {verifyMessage.text && (
          <div style={{
            marginBottom: 16, padding: "10px 16px", borderRadius: 8,
            background: verifyMessage.type === "success" ? "#D1FAE5" : verifyMessage.type === "error" ? "#FEE2E2" : "#DBEAFE",
            color: verifyMessage.type === "success" ? "#065F46" : verifyMessage.type === "error" ? "#991B1B" : "#1E40AF",
            fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          }}>
            {verifyMessage.type === "success"
              ? <CheckCircle size={16} />
              : verifyMessage.type === "error"
              ? <AlertCircle size={16} />
              : <Info size={16} />}
            {verifyMessage.text}
          </div>
        )}

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: "1px solid #E5E7EB", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FAF5FF", border: "2px solid #E9D5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {agent.profilePic
              ? <img src={agent.profilePic} alt={fullName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <User size={32} color={PURPLE} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{fullName || "—"}</h2>
              <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626" }}>
                {isActive ? "Active" : "Inactive"}
              </span>
              {agent.isVerified && (
                <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#2563EB" }}>
                  <CheckCircle size={12} style={{ display: "inline", marginRight: 4 }} /> Verified
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
              <InfoChip icon={Mail} value={agent.email} />
              <InfoChip icon={Phone} value={phoneCode && phoneNumber ? `${phoneCode} ${phoneNumber}` : phoneNumber || "—"} />
              <InfoChip icon={Globe} value={agent.nationality} />
              <InfoChip icon={Calendar} value={agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString() : null} />
              <InfoChip icon={Star} value={`${agent.profileCompletionPercentage || 0}% Complete`} />
            </div>
          </div>
        </div>

        {/* Verification Status Row */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 24px", border: "1px solid #E5E7EB", marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <VerificationBadge label="Email" verified={agent.isEmailVerified} />
          <VerificationBadge label="Phone" verified={agent.isPhoneVerified} />
          <VerificationBadge label="Emirates ID" verified={agent.emiratesId?.verified} />
          <VerificationBadge label="Passport" verified={agent.passport?.verified} />
          <VerificationBadge label="Visa" verified={agent.visa?.verified} />
          <VerificationBadge label="Bank" verified={agent.bankDetails?.verified} />
        </div>

        {/* Personal Information */}
        <Section icon={User} title="Personal Information">
          <Grid columns={3}>
            <Detail label="First Name" value={firstName} />
            <Detail label="Last Name" value={lastName} />
            <Detail label="Gender" value={agent.gender} />
            <Detail label="Date of Birth" value={agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString() : null} />
            <Detail label="Nationality" value={agent.nationality} />
            <Detail label="Marital Status" value={agent.maritalStatus} />
            <Detail label="Number of Dependents" value={agent.numberOfDependents} />
            <Detail label="Language Preference" value={agent.languagePreference} />
            <Detail label="Communication Preference" value={agent.communicationPreference} />
          </Grid>
        </Section>

        {/* Dependents */}
        {agent.dependents && agent.dependents.length > 0 && (
          <Section icon={Users} title="Dependents">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {agent.dependents.map((dep, idx) => (
                <div key={idx} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 16px", border: "1px solid #E5E7EB" }}>
                  <Grid columns={4}>
                    <Detail label="Name" value={dep.name} />
                    <Detail label="Age" value={dep.age} />
                    <Detail label="Relationship" value={dep.relationship} />
                    <Detail label="Location" value={dep.location} />
                  </Grid>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Address */}
        {agent.address && (agent.address.building || agent.address.area || agent.address.city) && (
          <Section icon={MapPin} title="Address">
            <Grid columns={3}>
              <Detail label="Building" value={agent.address.building} />
              <Detail label="Apartment" value={agent.address.apartment} />
              <Detail label="Area" value={agent.address.area} />
              <Detail label="City" value={agent.address.city} />
              <Detail label="Country" value={agent.address.country} />
            </Grid>
          </Section>
        )}

        {/* Emergency Contact */}
        {agent.emergencyContact && (agent.emergencyContact.name || agent.emergencyContact.phone) && (
          <Section icon={Heart} title="Emergency Contact">
            <Grid columns={3}>
              <Detail label="Name" value={agent.emergencyContact.name} />
              <Detail label="Relationship" value={agent.emergencyContact.relationship} />
              <Detail label="Phone" value={agent.emergencyContact.phone} />
            </Grid>
          </Section>
        )}

        {/* Emirates ID */}
        <Section icon={CreditCard} title="Emirates ID">
          <Grid columns={3}>
            <Detail label="ID Number" value={agent.emiratesId?.number} />
            <Detail label="Issue Date" value={agent.emiratesId?.issuanceDate ? new Date(agent.emiratesId.issuanceDate).toLocaleDateString() : null} />
            <Detail label="Expiry Date" value={agent.emiratesId?.expiryDate ? new Date(agent.emiratesId.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified" value={agent.emiratesId?.verified ? "Yes" : "No"} />
          </Grid>
          {(agent.emiratesId?.frontImageUrl || agent.emiratesId?.backImageUrl) && (
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {agent.emiratesId.frontImageUrl && <DocImage label="Front" url={agent.emiratesId.frontImageUrl} />}
              {agent.emiratesId.backImageUrl && <DocImage label="Back" url={agent.emiratesId.backImageUrl} />}
            </div>
          )}
        </Section>

        {/* Passport */}
        <Section icon={FileText} title="Passport">
          <Grid columns={3}>
            <Detail label="Passport Number" value={agent.passport?.number} />
            <Detail label="Country of Issue" value={agent.passport?.countryOfIssue} />
            <Detail label="Issue Date" value={agent.passport?.issueDate ? new Date(agent.passport.issueDate).toLocaleDateString() : null} />
            <Detail label="Expiry Date" value={agent.passport?.expiryDate ? new Date(agent.passport.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified" value={agent.passport?.verified ? "Yes" : "No"} />
          </Grid>
          {agent.passport?.imageUrl && (
            <div style={{ marginTop: 14 }}>
              <DocImage label="Passport" url={agent.passport.imageUrl} />
            </div>
          )}
        </Section>

        {/* Visa */}
        <Section icon={Globe} title="Visa / Residency">
          <Grid columns={3}>
            <Detail label="Visa Number" value={agent.visa?.number} />
            <Detail label="Residency Status" value={agent.visa?.residencyStatus} />
            <Detail label="Sponsor" value={agent.visa?.sponsor} />
            <Detail label="Expiry Date" value={agent.visa?.expiryDate ? new Date(agent.visa.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified" value={agent.visa?.verified ? "Yes" : "No"} />
          </Grid>
          {agent.visa?.imageUrl && (
            <div style={{ marginTop: 14 }}>
              <DocImage label="Visa" url={agent.visa.imageUrl} />
            </div>
          )}
        </Section>

        {/* Bank Details */}
        <Section icon={Banknote} title="Bank Details">
          <Grid columns={3}>
            <Detail label="Beneficiary Name" value={agent.bankDetails?.beneficiaryName} />
            <Detail label="Bank Name" value={agent.bankDetails?.bankName} />
            <Detail label="Account Number" value={agent.bankDetails?.accountNumber} />
            <Detail label="IBAN" value={agent.bankDetails?.iban} />
            <Detail label="SWIFT Code" value={agent.bankDetails?.swiftCode} />
            <Detail label="Account Type" value={agent.bankDetails?.accountType} />
            <Detail label="Verified" value={agent.bankDetails?.verified ? "Yes" : "No"} />
          </Grid>
        </Section>

        {/* Agent Type & Affiliation */}
        <Section icon={Building2} title="Agent & Affiliation">
          <Grid columns={3}>
            <Detail label="Agent Type" value={agent.agentType} />
            <Detail label="Affiliation Status" value={agent.affiliationStatus} />
            <Detail label="Partner Company" value={agent.partnerId?.companyName} />
            <Detail label="Partner Status" value={agent.partnerId?.status} />
            <Detail label="Role" value={agent.role?.name} />
            <Detail label="Role Code" value={agent.role?.code} />
            {agent.affiliationRejectionReason && <Detail label="Rejection Reason" value={agent.affiliationRejectionReason} />}
          </Grid>
          <div style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>
            Affiliated on: {agent.affiliationVerifiedAt ? new Date(agent.affiliationVerifiedAt).toLocaleString() : "—"}
          </div>
        </Section>

        {/* Commission & Earnings */}
        <Section icon={DollarSign} title="Commission & Earnings">
          <Grid columns={3}>
            <Detail label="Commission Eligible" value={agent.commissionEligible ? "Yes" : "No"} />
            <Detail label="Total Commission Earned" value={`AED ${agent.earnings?.totalCommissionEarned?.toLocaleString() || 0}`} />
            <Detail label="Pending Commission" value={`AED ${agent.earnings?.pendingCommission?.toLocaleString() || 0}`} />
            <Detail label="Total Leads Submitted" value={agent.earnings?.totalLeadsSubmitted || 0} />
            <Detail label="Successful Disbursals" value={agent.earnings?.successfulDisbursals || 0} />
            <Detail label="Conversion Rate" value={`${agent.earnings?.conversionRate || 0}%`} />
            <Detail label="Leaderboard Rank" value={agent.earnings?.leaderboardRank || "—"} />
          </Grid>
        </Section>

        {/* Freelance Commission Rates */}
        {agent.freelanceCommission && (
          <Section icon={Percent} title="Freelance Commission Rates">
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: "#374151" }}>Referral Only</p>
              <Grid columns={2}>
                <Detail label="Below 5M" value={`${agent.freelanceCommission.referralOnly?.below5M}%`} />
                <Detail label="Above 5M" value={`${agent.freelanceCommission.referralOnly?.above5M}%`} />
              </Grid>
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: "#374151" }}>Referral + Documents</p>
              <Grid columns={2}>
                <Detail label="Below 5M" value={`${agent.freelanceCommission.referralPlusDocs?.below5M}%`} />
                <Detail label="Above 5M" value={`${agent.freelanceCommission.referralPlusDocs?.above5M}%`} />
              </Grid>
            </div>
          </Section>
        )}

        {/* System Information */}
        <Section icon={Clock} title="System Information">
          <Grid columns={2}>
            <Detail label="Created At" value={agent.createdAt ? new Date(agent.createdAt).toLocaleString() : null} />
            <Detail label="Last Updated" value={agent.updatedAt ? new Date(agent.updatedAt).toLocaleString() : null} />
            <Detail label="Suspended" value={agent.suspendedAt ? `Yes (${new Date(agent.suspendedAt).toLocaleDateString()})` : "No"} />
            {agent.suspensionReason && <Detail label="Suspension Reason" value={agent.suspensionReason} />}
          </Grid>
        </Section>

        {/* Verify / Reject Modal */}
        {showVerifyModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 450, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

              {/* Close button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button
                  onClick={() => { setShowVerifyModal(false); setRejectMode(false); setRejectionReason(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18, lineHeight: 1 }}
                >✕</button>
              </div>

              {!rejectMode ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FAF5FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <ShieldCheck size={28} color={PURPLE} />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Verify or Reject Agent</h2>
                    <p style={{ fontSize: 13, color: "#6B7280" }}>Confirm the agent's documents and information.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleVerify}
                      disabled={actionLoading}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: GREEN, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.6 : 1 }}
                    >
                      {actionLoading
                        ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        : <CheckCircle size={16} />}
                      Verify
                    </button>
                    <button
                      onClick={() => setRejectMode(true)}
                      disabled={actionLoading}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}
                    >
                      <XCircle size={16} color={RED} />
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertTriangle size={18} color={RED} />
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Reject Agent</h2>
                  </div>
                  <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                    Please provide a reason for rejection. This will be shared with the agent.
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Invalid Emirates ID, Passport expired, etc."
                    rows={4}
                    style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      onClick={() => { setRejectMode(false); setRejectionReason(""); }}
                      style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        color: "#fff", background: !rejectionReason.trim() ? "#FCA5A5" : RED,
                        cursor: !rejectionReason.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      {actionLoading
                        ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        : <XCircle size={14} />}
                      Confirm Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

const Section = ({ icon: I, title, children }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "22px 24px", border: "1px solid #E5E7EB", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FAF5FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I size={14} color={PURPLE} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{title}</span>
    </div>
    {children}
  </div>
);

const Grid = ({ children, columns = 3 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "14px 20px" }}>
    {children}
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{label}</p>
    <p style={{ fontSize: 14, fontWeight: 500, color: value && value !== "—" ? "#111827" : "#D1D5DB" }}>{value ?? "—"}</p>
  </div>
);

const InfoChip = ({ icon: I, value }) => value ? (
  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#6B7280" }}>
    <I size={13} color="#9CA3AF" />{value}
  </div>
) : null;

const DocImage = ({ label, url }) => (
  <div style={{ border: "1px solid #E5E7EB", borderRadius: 9, overflow: "hidden", maxWidth: 220 }}>
    <div style={{ padding: "6px 10px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
    <img src={url} alt={label} onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", maxHeight: 140, objectFit: "cover", display: "block" }} />
  </div>
);

const VerificationBadge = ({ label, verified }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {verified ? <CheckCircle size={14} color={GREEN} /> : <XCircle size={14} color={RED} />}
    <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{label}</span>
  </div>
);