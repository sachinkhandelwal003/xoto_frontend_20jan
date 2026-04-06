// src/components/Vault/AgentDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, User, Mail, Phone, MapPin, Globe, Calendar,
  CreditCard, FileText, Banknote, ShieldCheck, Heart, Users,
  Loader2, AlertCircle, Building2
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const PURPLE = "#5C039B";

export default function VaultAgentdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/vault/agent/get/${id}`);
        const data = response?.data || response;
        setAgent(data?.agent || data);
      } catch (err) {
        setError(err?.message || "Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <Loader2 size={36} color={PURPLE} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading agent details...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
        <p style={{ color: "#B91C1C", marginBottom: 16, fontSize: 14 }}>{error || "Agent not found"}</p>
        <button onClick={() => navigate(-1)}
          style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Go Back
        </button>
      </div>
    );
  }

  const fullName = `${agent.first_name || agent.firstName || ""} ${agent.last_name || agent.lastName || ""}`.trim();
  const isActive = agent.status === "active" || agent.isActive === true || agent.status === "Active";

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Back + Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: "1.5px solid #E5E7EB", borderRadius: 9, background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            <ChevronLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Agent Details</h1>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>ID: {id}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: "1px solid #E5E7EB", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FAF5FF", border: `2px solid #E9D5FF`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={28} color={PURPLE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{fullName || "—"}</h2>
              <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626" }}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
              <InfoChip icon={Mail} value={agent.email} />
              <InfoChip icon={Phone} value={`${agent.country_code || agent.countryCode || ""} ${agent.phone_number || agent.phoneNumber || "N/A"}`} />
              <InfoChip icon={Globe} value={agent.nationality} />
              <InfoChip icon={Calendar} value={agent.dateOfBirth} />
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Section icon={User} title="Personal Information">
          <Grid>
            <Detail label="First Name" value={agent.first_name || agent.firstName} />
            <Detail label="Last Name" value={agent.last_name || agent.lastName} />
            <Detail label="Gender" value={agent.gender} />
            <Detail label="Date of Birth" value={agent.dateOfBirth} />
            <Detail label="Nationality" value={agent.nationality} />
            <Detail label="Marital Status" value={agent.maritalStatus} />
            <Detail label="No. of Dependents" value={agent.numberOfDependents} />
          </Grid>
          {agent.dependents?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Dependents</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {agent.dependents.map((d, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", border: "1px solid #E5E7EB" }}>
                    <Detail label="Name" value={d.name} />
                    <Detail label="Age" value={d.age} />
                    <Detail label="Relationship" value={d.relationship} />
                    <Detail label="Location" value={d.location} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Address */}
        <Section icon={MapPin} title="Address">
          <Grid>
            <Detail label="Building" value={agent.address?.building} />
            <Detail label="Apartment" value={agent.address?.apartment} />
            <Detail label="Area" value={agent.address?.area} />
            <Detail label="City" value={agent.address?.city} />
            <Detail label="Country" value={agent.address?.country} />
          </Grid>
        </Section>

        {/* Emergency Contact */}
        <Section icon={ShieldCheck} title="Emergency Contact">
          <Grid>
            <Detail label="Name" value={agent.emergencyContact?.name} />
            <Detail label="Relationship" value={agent.emergencyContact?.relationship} />
            <Detail label="Phone" value={agent.emergencyContact?.phone} />
          </Grid>
        </Section>

        {/* Emirates ID */}
        <Section icon={CreditCard} title="Emirates ID">
          <Grid>
            <Detail label="ID Number" value={agent.emiratesIdNumber} />
            <Detail label="Expiry Date" value={agent.emiratesIdExpiryDate} />
          </Grid>
          {(agent.emiratesIdFrontImage || agent.emiratesIdBackImage) && (
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              {agent.emiratesIdFrontImage && <DocImage label="Front" url={agent.emiratesIdFrontImage} />}
              {agent.emiratesIdBackImage && <DocImage label="Back" url={agent.emiratesIdBackImage} />}
            </div>
          )}
        </Section>

        {/* Passport */}
        <Section icon={FileText} title="Passport">
          <Grid>
            <Detail label="Passport Number" value={agent.passportNumber} />
            <Detail label="Expiry Date" value={agent.passportExpiryDate} />
          </Grid>
          {agent.passportImage && (
            <div style={{ marginTop: 14 }}>
              <DocImage label="Passport" url={agent.passportImage} />
            </div>
          )}
        </Section>

        {/* Visa */}
        <Section icon={Globe} title="Visa">
          <Grid>
            <Detail label="Visa Number" value={agent.visaNumber} />
            <Detail label="Expiry Date" value={agent.visaExpiryDate} />
          </Grid>
          {agent.visaImage && (
            <div style={{ marginTop: 14 }}>
              <DocImage label="Visa" url={agent.visaImage} />
            </div>
          )}
        </Section>

        {/* Bank Details */}
        <Section icon={Banknote} title="Bank Details">
          <Grid>
            <Detail label="Beneficiary Name" value={agent.beneficiaryName} />
            <Detail label="Bank Name" value={agent.bankName} />
            <Detail label="Account Number" value={agent.accountNumber} />
            <Detail label="IBAN" value={agent.iban} />
            <Detail label="SWIFT Code" value={agent.swiftCode} />
            <Detail label="Account Type" value={agent.accountType} />
          </Grid>
        </Section>

      </div>
    </div>
  );
}

/* ── helper components ── */
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

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 20px" }}>
    {children}
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{label}</p>
    <p style={{ fontSize: 14, fontWeight: 500, color: value ? "#111827" : "#D1D5DB" }}>{value ?? "—"}</p>
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