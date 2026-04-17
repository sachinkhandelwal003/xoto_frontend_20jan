// src/components/Vault/AgentDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, User, Mail, Phone, MapPin, Globe, Calendar,
  CreditCard, FileText, Banknote, ShieldCheck, Heart, Users,
  Loader2, AlertCircle, Building2, CheckCircle, XCircle,
  Clock, Star, DollarSign, Percent, Info, AlertTriangle,
  BadgeCheck, Activity, TrendingUp, Wallet, UserCheck
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#FAF5FF";
const PURPLE_BORDER = "#E9D5FF";
const GREEN = "#10B981";
const RED = "#EF4444";
const GRAY = "#6B7280";

export default function VaultAgentdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => { fetchAgent(); }, [id]);

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

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await apiService.post(`/vault/agent/partner/verify/${id}`, { status: "verified" });
      setVerifyMessage({ type: "success", text: "Agent successfully verified!" });
      await fetchAgent();
      setShowVerifyModal(false);
    } catch (err) {
      setVerifyMessage({ type: "error", text: err?.response?.data?.message || err?.message || "Verification failed" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 5000);
    }
  };

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
      setVerifyMessage({ type: "error", text: err?.response?.data?.message || err?.message || "Rejection failed" });
    } finally {
      setActionLoading(false);
      setTimeout(() => setVerifyMessage({ type: "", text: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Loader2 size={36} color={PURPLE} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: GRAY, fontSize: 14 }}>Loading agent details...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <AlertCircle size={44} color={RED} style={{ marginBottom: 12 }} />
        <p style={{ color: "#B91C1C", marginBottom: 16, fontSize: 14 }}>{error || "Agent not found"}</p>
        <button onClick={() => navigate(-1)} style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Go Back
        </button>
      </div>
    );
  }

  // ── Data extraction (handles all API field shapes) ──
  const firstName  = agent.name?.first_name || agent.first_name  || agent.firstName  || "";
  const lastName   = agent.name?.last_name  || agent.last_name   || agent.lastName   || "";
  const fullName   = `${firstName} ${lastName}`.trim();
  const isActive   = agent.isActive === true || agent.status === "active";
  const phoneCode  = agent.phone?.country_code || agent.country_code || agent.countryCode || "";
  const phoneNum   = agent.phone?.number       || agent.phone_number || agent.phoneNumber  || "";
  const phoneStr   = phoneCode && phoneNum ? `${phoneCode} ${phoneNum}` : phoneNum || null;

  // Verification status
  const agentVerificationStatus = agent.isVerified
    ? "verified"
    : agent.rejectionReason
    ? "rejected"
    : "pending";

  const statusColors = {
    verified: { bg: "#ECFDF5", color: "#059669", label: "Verified" },
    rejected: { bg: "#FEF2F2", color: "#DC2626", label: "Rejected" },
    pending:  { bg: "#FFF7ED", color: "#D97706", label: "Pending Verification" },
  };
  const vs = statusColors[agentVerificationStatus];

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* ── Header ── */}
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

          {/* ── Verify / Reject Button ── */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {!agent.isVerified && (
              <button
                onClick={handleOpenVerifyModal}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", background: PURPLE, color: "#fff",
                  border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <ShieldCheck size={15} /> Verify Agent
              </button>
            )}
            {agent.isVerified && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#ECFDF5", color: "#059669", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "1px solid #A7F3D0" }}>
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>
        </div>

        {/* ── Flash Message ── */}
        {verifyMessage.text && (
          <div style={{
            marginBottom: 16, padding: "10px 16px", borderRadius: 8,
            background: verifyMessage.type === "success" ? "#D1FAE5" : verifyMessage.type === "error" ? "#FEE2E2" : "#DBEAFE",
            color: verifyMessage.type === "success" ? "#065F46" : verifyMessage.type === "error" ? "#991B1B" : "#1E40AF",
            fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          }}>
            {verifyMessage.type === "success" ? <CheckCircle size={16} /> : verifyMessage.type === "error" ? <AlertCircle size={16} /> : <Info size={16} />}
            {verifyMessage.text}
          </div>
        )}

        {/* ── Profile Card ── */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: "1px solid #E5E7EB", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: PURPLE_LIGHT, border: `2px solid ${PURPLE_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {agent.profilePic
              ? <img src={agent.profilePic} alt={fullName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <User size={32} color={PURPLE} />}
          </div>

          {/* Main info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 21, fontWeight: 700, color: "#111827" }}>{fullName || "—"}</h2>
              <Pill bg={isActive ? "#ECFDF5" : "#FEF2F2"} color={isActive ? "#059669" : "#DC2626"}>
                {isActive ? "Active" : "Inactive"}
              </Pill>
              <Pill bg={vs.bg} color={vs.color}>{vs.label}</Pill>
              {agent.agentType && (
                <Pill bg="#F0F9FF" color="#0369A1">{agent.agentType.replace(/([A-Z])/g, ' $1').trim()}</Pill>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px" }}>
              <InfoChip icon={Mail}     value={agent.email} />
              <InfoChip icon={Phone}    value={phoneStr} />
              <InfoChip icon={Globe}    value={agent.nationality} />
              <InfoChip icon={Calendar} value={agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null} />
              <InfoChip icon={Star}     value={`${agent.profileCompletionPercentage ?? 0}% Profile Complete`} />
            </div>
          </div>

          {/* Profile completion bar */}
          <div style={{ minWidth: 160 }}>
            <p style={{ fontSize: 11, color: GRAY, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Profile Completion</p>
            <div style={{ background: "#F3F4F6", borderRadius: 99, height: 8, marginBottom: 4 }}>
              <div style={{ width: `${agent.profileCompletionPercentage ?? 0}%`, background: agent.profileCompletionPercentage >= 80 ? GREEN : agent.profileCompletionPercentage >= 40 ? "#F59E0B" : RED, height: "100%", borderRadius: 99, transition: "width .4s" }} />
            </div>
            <p style={{ fontSize: 12, color: GRAY }}>{agent.profileCompletionPercentage ?? 0}% complete</p>
            <p style={{ fontSize: 11, color: agent.isProfileComplete ? "#059669" : "#D97706", marginTop: 4, fontWeight: 600 }}>
              {agent.isProfileComplete ? "✓ Profile Complete" : "⚠ Incomplete"}
            </p>
          </div>
        </div>

        {/* ── Verification Status Row ── */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 24px", border: "1px solid #E5E7EB", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Verification Status</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <VerificationBadge label="Email"       verified={agent.isEmailVerified} />
            <VerificationBadge label="Phone"       verified={agent.isPhoneVerified} />
            <VerificationBadge label="Emirates ID" verified={agent.emiratesId?.verified} />
            <VerificationBadge label="Passport"    verified={agent.passport?.verified} />
            <VerificationBadge label="Visa"        verified={agent.visa?.verified} />
            <VerificationBadge label="Bank"        verified={agent.bankDetails?.verified} />
            <VerificationBadge label="Agent"       verified={agent.isVerified} />
          </div>
          {agent.rejectionReason && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", fontSize: 13, color: "#991B1B", display: "flex", gap: 8 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>Rejection Reason:</strong> {agent.rejectionReason}</span>
            </div>
          )}
        </div>

        {/* ── Quick Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
          <StatCard icon={TrendingUp}  label="Total Commission"    value={`AED ${(agent.earnings?.totalCommissionEarned ?? 0).toLocaleString()}`} color="#7C3AED" />
          <StatCard icon={Wallet}      label="Pending Commission"  value={`AED ${(agent.earnings?.pendingCommission ?? 0).toLocaleString()}`}     color="#D97706" />
          <StatCard icon={Activity}    label="Leads Submitted"     value={agent.earnings?.totalLeadsSubmitted ?? 0}                               color="#0891B2" />
          <StatCard icon={CheckCircle} label="Successful Disbursals" value={agent.earnings?.successfulDisbursals ?? 0}                            color={GREEN} />
          <StatCard icon={Percent}     label="Conversion Rate"     value={`${agent.earnings?.conversionRate ?? 0}%`}                              color="#DB2777" />
          <StatCard icon={Star}        label="Leaderboard Rank"    value={agent.earnings?.leaderboardRank ?? "—"}                                 color="#EA580C" />
        </div>

        {/* ── Personal Information ── */}
        <Section icon={User} title="Personal Information">
          <Grid columns={3}>
            <Detail label="First Name"                value={firstName} />
            <Detail label="Last Name"                 value={lastName} />
            <Detail label="Gender"                    value={agent.gender} />
            <Detail label="Date of Birth"             value={agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null} />
            <Detail label="Nationality"               value={agent.nationality} />
            <Detail label="Marital Status"            value={agent.maritalStatus} />
            <Detail label="Number of Dependents"      value={agent.numberOfDependents ?? 0} />
            <Detail label="Language Preference"       value={agent.languagePreference} />
            <Detail label="Communication Preference"  value={agent.communicationPreference} />
          </Grid>
        </Section>

        {/* ── Dependents ── */}
        {agent.dependents && agent.dependents.length > 0 ? (
          <Section icon={Users} title={`Dependents (${agent.dependents.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {agent.dependents.map((dep, idx) => (
                <div key={idx} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 16px", border: "1px solid #E5E7EB" }}>
                  <Grid columns={4}>
                    <Detail label="Name"         value={dep.name} />
                    <Detail label="Age"          value={dep.age} />
                    <Detail label="Relationship" value={dep.relationship} />
                    <Detail label="Location"     value={dep.location} />
                  </Grid>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section icon={Users} title="Dependents">
            <EmptyRow message="No dependents added" />
          </Section>
        )}

        {/* ── Address ── */}
        <Section icon={MapPin} title="Address">
          {agent.address && (agent.address.building || agent.address.area || agent.address.city) ? (
            <Grid columns={3}>
              <Detail label="Building"  value={agent.address.building} />
              <Detail label="Apartment" value={agent.address.apartment} />
              <Detail label="Area"      value={agent.address.area} />
              <Detail label="City"      value={agent.address.city} />
              <Detail label="Country"   value={agent.address.country} />
            </Grid>
          ) : (
            <EmptyRow message="No address on record" />
          )}
        </Section>

        {/* ── Emergency Contact ── */}
        <Section icon={Heart} title="Emergency Contact">
          {agent.emergencyContact && (agent.emergencyContact.name || agent.emergencyContact.phone) ? (
            <Grid columns={3}>
              <Detail label="Name"         value={agent.emergencyContact.name} />
              <Detail label="Relationship" value={agent.emergencyContact.relationship} />
              <Detail label="Phone"        value={agent.emergencyContact.phone} />
            </Grid>
          ) : (
            <EmptyRow message="No emergency contact added" />
          )}
        </Section>

        {/* ── Emirates ID ── */}
        <Section icon={CreditCard} title="Emirates ID">
          <Grid columns={3}>
            <Detail label="ID Number"    value={agent.emiratesId?.number} />
            <Detail label="Issue Date"   value={agent.emiratesId?.issuanceDate ? new Date(agent.emiratesId.issuanceDate).toLocaleDateString() : null} />
            <Detail label="Expiry Date"  value={agent.emiratesId?.expiryDate ? new Date(agent.emiratesId.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified"     value={agent.emiratesId?.verified ? "Yes" : "No"} highlight={agent.emiratesId?.verified} />
            <Detail label="Verified At"  value={agent.emiratesId?.verifiedAt ? new Date(agent.emiratesId.verifiedAt).toLocaleDateString() : null} />
          </Grid>
          {(agent.emiratesId?.frontImageUrl || agent.emiratesId?.backImageUrl) ? (
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {agent.emiratesId.frontImageUrl && <DocImage label="Front" url={agent.emiratesId.frontImageUrl} />}
              {agent.emiratesId.backImageUrl  && <DocImage label="Back"  url={agent.emiratesId.backImageUrl} />}
            </div>
          ) : (
            <div style={{ marginTop: 12 }}><EmptyRow message="No Emirates ID documents uploaded" /></div>
          )}
        </Section>

        {/* ── Passport ── */}
        <Section icon={FileText} title="Passport">
          <Grid columns={3}>
            <Detail label="Passport Number"   value={agent.passport?.number} />
            <Detail label="Country of Issue"  value={agent.passport?.countryOfIssue} />
            <Detail label="Issue Date"        value={agent.passport?.issueDate ? new Date(agent.passport.issueDate).toLocaleDateString() : null} />
            <Detail label="Expiry Date"       value={agent.passport?.expiryDate ? new Date(agent.passport.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified"          value={agent.passport?.verified ? "Yes" : "No"} highlight={agent.passport?.verified} />
            <Detail label="Verified At"       value={agent.passport?.verifiedAt ? new Date(agent.passport.verifiedAt).toLocaleDateString() : null} />
          </Grid>
          {agent.passport?.imageUrl ? (
            <div style={{ marginTop: 14 }}><DocImage label="Passport" url={agent.passport.imageUrl} /></div>
          ) : (
            <div style={{ marginTop: 12 }}><EmptyRow message="No passport document uploaded" /></div>
          )}
        </Section>

        {/* ── Visa / Residency ── */}
        <Section icon={Globe} title="Visa / Residency">
          <Grid columns={3}>
            <Detail label="Visa Number"       value={agent.visa?.number} />
            <Detail label="Residency Status"  value={agent.visa?.residencyStatus} />
            <Detail label="Sponsor"           value={agent.visa?.sponsor} />
            <Detail label="Expiry Date"       value={agent.visa?.expiryDate ? new Date(agent.visa.expiryDate).toLocaleDateString() : null} />
            <Detail label="Verified"          value={agent.visa?.verified ? "Yes" : "No"} highlight={agent.visa?.verified} />
            <Detail label="Verified At"       value={agent.visa?.verifiedAt ? new Date(agent.visa.verifiedAt).toLocaleDateString() : null} />
          </Grid>
          {agent.visa?.imageUrl ? (
            <div style={{ marginTop: 14 }}><DocImage label="Visa" url={agent.visa.imageUrl} /></div>
          ) : (
            <div style={{ marginTop: 12 }}><EmptyRow message="No visa document uploaded" /></div>
          )}
        </Section>

        {/* ── Bank Details ── */}
        <Section icon={Banknote} title="Bank Details">
          <Grid columns={3}>
            <Detail label="Beneficiary Name" value={agent.bankDetails?.beneficiaryName} />
            <Detail label="Bank Name"        value={agent.bankDetails?.bankName} />
            <Detail label="Account Number"   value={agent.bankDetails?.accountNumber} />
            <Detail label="IBAN"             value={agent.bankDetails?.iban} />
            <Detail label="SWIFT Code"       value={agent.bankDetails?.swiftCode} />
            <Detail label="Account Type"     value={agent.bankDetails?.accountType} />
            <Detail label="Verified"         value={agent.bankDetails?.verified ? "Yes" : "No"} highlight={agent.bankDetails?.verified} />
            <Detail label="Verified At"      value={agent.bankDetails?.verifiedAt ? new Date(agent.bankDetails.verifiedAt).toLocaleDateString() : null} />
          </Grid>
        </Section>

        {/* ── Agent & Affiliation ── */}
        <Section icon={Building2} title="Agent & Affiliation">
          <Grid columns={3}>
            <Detail label="Agent Type"         value={agent.agentType?.replace(/([A-Z])/g, ' $1').trim()} />
            <Detail label="Affiliation Status" value={agent.affiliationStatus}
              badge={{ verified: { bg: "#ECFDF5", color: "#059669" }, rejected: { bg: "#FEF2F2", color: "#DC2626" }, pending: { bg: "#FFF7ED", color: "#D97706" } }[agent.affiliationStatus?.toLowerCase()]} />
            <Detail label="Partner Company"    value={agent.partnerId?.companyName} />
            <Detail label="Partner Status"     value={agent.partnerId?.status} />
            <Detail label="Partner ID"         value={agent.partnerId?._id} />
            <Detail label="Role"               value={agent.role?.name} />
            <Detail label="Role Code"          value={agent.role?.code} />
            <Detail label="Commission Eligible" value={agent.commissionEligible ? "Yes" : "No"} highlight={agent.commissionEligible} />
            {agent.commissionEligibilityReason && <Detail label="Eligibility Reason" value={agent.commissionEligibilityReason} />}
            {agent.affiliationRejectionReason  && <Detail label="Rejection Reason"   value={agent.affiliationRejectionReason} />}
          </Grid>
          <div style={{ marginTop: 12, fontSize: 12, color: GRAY, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span>Affiliation verified at: <strong style={{ color: "#374151" }}>{agent.affiliationVerifiedAt ? new Date(agent.affiliationVerifiedAt).toLocaleString() : "—"}</strong></span>
            {agent.affiliationVerifiedBy && <span>Verified by: <strong style={{ color: "#374151" }}>{agent.affiliationVerifiedBy}</strong></span>}
          </div>
        </Section>

        {/* ── Commission & Earnings ── */}
        <Section icon={DollarSign} title="Commission & Earnings">
          <Grid columns={3}>
            <Detail label="Commission Eligible"    value={agent.commissionEligible ? "Yes" : "No"} highlight={agent.commissionEligible} />
            <Detail label="Total Commission Earned" value={`AED ${(agent.earnings?.totalCommissionEarned ?? 0).toLocaleString()}`} />
            <Detail label="Pending Commission"      value={`AED ${(agent.earnings?.pendingCommission ?? 0).toLocaleString()}`} />
            <Detail label="Total Leads Submitted"   value={agent.earnings?.totalLeadsSubmitted ?? 0} />
            <Detail label="Successful Disbursals"   value={agent.earnings?.successfulDisbursals ?? 0} />
            <Detail label="Conversion Rate"         value={`${agent.earnings?.conversionRate ?? 0}%`} />
            <Detail label="Leaderboard Rank"        value={agent.earnings?.leaderboardRank ?? "—"} />
          </Grid>
        </Section>

        {/* ── Freelance Commission Rates ── */}
        {agent.freelanceCommission && (
          <Section icon={Percent} title="Freelance Commission Rates">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Referral Only */}
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 18px", border: "1px solid #E5E7EB" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7C3AED", display: "inline-block" }} />
                  Referral Only
                </p>
                <Grid columns={2}>
                  <Detail label="Below AED 5M" value={`${agent.freelanceCommission.referralOnly?.below5M ?? "—"}%`} />
                  <Detail label="Above AED 5M" value={`${agent.freelanceCommission.referralOnly?.above5M ?? "—"}%`} />
                </Grid>
              </div>
              {/* Referral + Docs */}
              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 18px", border: "1px solid #E5E7EB" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                  Referral + Documents
                </p>
                <Grid columns={2}>
                  <Detail label="Below AED 5M" value={`${agent.freelanceCommission.referralPlusDocs?.below5M ?? "—"}%`} />
                  <Detail label="Above AED 5M" value={`${agent.freelanceCommission.referralPlusDocs?.above5M ?? "—"}%`} />
                </Grid>
              </div>
            </div>
          </Section>
        )}

        {/* ── System Information ── */}
        <Section icon={Clock} title="System Information">
          <Grid columns={2}>
            <Detail label="Agent ID"    value={agent._id} />
            <Detail label="Version"     value={agent.__v !== undefined ? `v${agent.__v}` : null} />
            <Detail label="Created At"  value={agent.createdAt ? new Date(agent.createdAt).toLocaleString() : null} />
            <Detail label="Updated At"  value={agent.updatedAt ? new Date(agent.updatedAt).toLocaleString() : null} />
            <Detail label="Verified At" value={agent.verifiedAt ? new Date(agent.verifiedAt).toLocaleString() : null} />
            <Detail label="Verified By" value={agent.verifiedBy ?? null} />
            <Detail label="Deleted"     value={agent.isDeleted ? "Yes" : "No"} />
            <Detail label="Suspended"   value={agent.suspendedAt ? `Yes — ${new Date(agent.suspendedAt).toLocaleDateString()}` : "No"} />
            {agent.suspensionReason && <Detail label="Suspension Reason" value={agent.suspensionReason} />}
            {agent.suspendedBy      && <Detail label="Suspended By"      value={agent.suspendedBy} />}
          </Grid>
        </Section>

        {/* ── Verify / Reject Modal ── */}
        {showVerifyModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 450, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button onClick={() => { setShowVerifyModal(false); setRejectMode(false); setRejectionReason(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>
              {!rejectMode ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: PURPLE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <ShieldCheck size={28} color={PURPLE} />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Verify or Reject Agent</h2>
                    <p style={{ fontSize: 13, color: GRAY }}>Review the agent's documents and confirm your action.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={handleVerify} disabled={actionLoading}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: GREEN, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.6 : 1 }}>
                      {actionLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={16} />}
                      Verify
                    </button>
                    <button onClick={() => setRejectMode(true)} disabled={actionLoading}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                      <XCircle size={16} color={RED} /> Reject
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
                  <p style={{ fontSize: 13, color: GRAY, marginBottom: 12 }}>Provide a reason for rejection. This will be shared with the agent.</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Invalid Emirates ID, Passport expired, etc."
                    rows={4}
                    style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={() => { setRejectMode(false); setRejectionReason(""); }}
                      style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>
                      Back
                    </button>
                    <button onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: !rejectionReason.trim() ? "#FCA5A5" : RED, cursor: !rejectionReason.trim() ? "not-allowed" : "pointer" }}>
                      {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={14} />}
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
  <div style={{ background: "#fff", borderRadius: 12, padding: "22px 24px", border: "1px solid #E5E7EB", marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FAF5FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I size={14} color="#5C039B" />
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

// badge = optional { bg, color } for status pills inside Detail
const Detail = ({ label, value, highlight, badge }) => (
  <div>
    <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{label}</p>
    {badge && value && value !== "—" ? (
      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>
        {value}
      </span>
    ) : (
      <p style={{ fontSize: 14, fontWeight: 500, color: highlight ? "#059669" : (value !== null && value !== undefined && value !== "—") ? "#111827" : "#D1D5DB" }}>
        {value ?? "—"}
      </p>
    )}
  </div>
);

const Pill = ({ children, bg, color }) => (
  <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color }}>
    {children}
  </span>
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
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: verified ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${verified ? "#A7F3D0" : "#FECACA"}` }}>
    {verified ? <CheckCircle size={13} color="#059669" /> : <XCircle size={13} color="#EF4444" />}
    <span style={{ fontSize: 12, fontWeight: 600, color: verified ? "#059669" : "#DC2626" }}>{label}</span>
  </div>
);

const StatCard = ({ icon: I, label, value, color }) => (
  <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #E5E7EB" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I size={14} color={color} />
      </div>
      <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
    </div>
    <p style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{value}</p>
  </div>
);

const EmptyRow = ({ message }) => (
  <div style={{ padding: "12px 0", color: "#9CA3AF", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
    <Info size={14} /> {message}
  </div>
);