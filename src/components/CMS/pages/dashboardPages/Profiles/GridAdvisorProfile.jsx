import { useState, useEffect, useRef } from "react";
import {
  Tabs, Form, Input, Select, Button, Progress, message, Spin, Tag, Tooltip,
} from "antd";
import {
  UserOutlined, BankOutlined, IdcardOutlined,
  HomeOutlined, LockOutlined, SaveOutlined,
  CameraOutlined, CheckCircleFilled, CloseCircleFilled,
  ClockCircleFilled, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, LoadingOutlined, UploadOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice"; // adjust path as needed

const { TextArea } = Input;
const { Option } = Select;

// ─── Theme ────────────────────────────────────────────────────────────────
const T = {
  primary: "#5c039b",
  primaryLight: "#f3e8ff",
  primaryMid: "#9333ea",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#b45309",
  warningLight: "#fef3c7",
  error: "#b91c1c",
  errorLight: "#fee2e2",
  gray: "#64748b",
  border: "#ede9fe",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  border: `1px solid ${T.border}`,
  boxShadow: "0 1px 4px rgba(92,3,155,0.06)",
  padding: "28px 32px",
};

// ─── Constants ─────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  "Apartment", "Villa", "Townhouse", "Penthouse", "Commercial",
  "Plot", "Retail", "Office", "Warehouse",
];
const LISTING_TYPES = ["Off-plan", "Secondary", "Rental", "Commercial"];
const UAE_AREAS = [
  "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "JVC", "Business Bay",
  "Arabian Ranches", "JBR", "DIFC", "Mirdif", "Al Barsha", "Jumeirah",
  "Deira", "Bur Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK",
];
const LANGUAGES = [
  "English", "Arabic", "Hindi", "Urdu", "French", "Russian",
  "Chinese", "German", "Spanish", "Tagalog", "Malayalam",
];
const NATIONALITIES = [
  "Emirati", "Indian", "Pakistani", "Filipino", "Egyptian", "British",
  "American", "Canadian", "Australian", "Lebanese", "Jordanian", "Syrian", "Other",
];

// ─── Upload Helper (using your existing S3 endpoint) ────────────────────────
const uploadToS3 = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const base = import.meta.env.VITE_API_BASE_URL || ""; // adjust if needed
 const data = await apiService.post("/upload", formData);
  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.file.url;
};

// ─── Image Upload Box Component ────────────────────────────────────────────
const ImageUploadBox = ({ label, value, onChange, hint }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      message.error("Only JPG, PNG, WEBP allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Max 5MB");
      return;
    }
    try {
      setUploading(true);
      const url = await uploadToS3(file);
      onChange(url);
      message.success("Uploaded ✓");
    } catch (err) {
      message.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{label}</div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: "100%",
          minHeight: 120,
          border: `2px dashed ${value ? T.primary : "#d1d5db"}`,
          borderRadius: 12,
          cursor: uploading ? "wait" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: value ? "#faf5ff" : "#f9fafb",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <>
            <LoadingOutlined style={{ fontSize: 24, color: T.primary }} spin />
            <span style={{ fontSize: 12, color: T.gray }}>Uploading...</span>
          </>
        ) : value ? (
          <>
            <img
              src={value}
              alt={label}
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                background: T.primary,
                color: "#fff",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Change
            </div>
          </>
        ) : (
          <>
            <UploadOutlined style={{ fontSize: 24, color: T.gray }} />
            <span style={{ fontSize: 12, color: T.gray }}>Click to upload</span>
            {hint && <span style={{ fontSize: 11, color: "#9ca3af" }}>{hint}</span>}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
      {value && (
        <div style={{ marginTop: 6, fontSize: 11, color: T.gray, wordBreak: "break-all", background: "#f9fafb", borderRadius: 6, padding: "4px 8px" }}>
          ✅ {value.length > 60 ? value.substring(0, 60) + "..." : value}
        </div>
      )}
    </div>
  );
};

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    verified: { icon: <CheckCircleFilled />, color: T.success, bg: T.successLight, label: "Verified" },
    pending: { icon: <ClockCircleFilled />, color: T.warning, bg: T.warningLight, label: "Pending Review" },
    rejected: { icon: <CloseCircleFilled />, color: T.error, bg: T.errorLight, label: "Rejected" },
    unverified: { icon: <ClockCircleFilled />, color: T.gray, bg: "#f1f5f9", label: "Not Submitted" },
  };
  const s = map[status] || map.unverified;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      background: s.bg,
      color: s.color,
    }}>
      {s.icon} {s.label}
    </span>
  );
};

// ─── Section Header ─────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: T.primaryLight,
        display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 16,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</span>
    </div>
    {subtitle && <p style={{ margin: "4px 0 0 46px", fontSize: 12, color: T.gray }}>{subtitle}</p>}
  </div>
);

// ─── Completion Bar ─────────────────────────────────────────────────────────
const CompletionBar = ({ profileCompletion }) => {
  const { percentage = 0, basicInfo, identity, bankDetails } = profileCompletion || {};
  const items = [
    { label: "Basic Info", done: basicInfo },
    { label: "Identity Verified", done: identity },
    { label: "Bank Details", done: bankDetails },
  ];
  return (
    <div style={{
      background: percentage === 100 ? T.successLight : T.primaryLight,
      border: `1px solid ${percentage === 100 ? "#bbf7d0" : T.border}`,
      borderRadius: 14, padding: "20px 24px", marginBottom: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: percentage === 100 ? T.success : T.primary }}>Profile Completion</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: percentage === 100 ? T.success : T.primary }}>{percentage}%</span>
      </div>
      <Progress
        percent={percentage}
        showInfo={false}
        strokeColor={percentage === 100 ? T.success : T.primary}
        trailColor={percentage === 100 ? "#bbf7d0" : "#ddd6fe"}
        strokeWidth={8}
        style={{ marginBottom: 12 }}
      />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            {item.done ? <CheckCircleFilled style={{ color: T.success }} /> : <CloseCircleFilled style={{ color: "#d1d5db" }} />}
            <span style={{ color: item.done ? T.success : T.gray, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Save Button ────────────────────────────────────────────────────────────
const SaveBtn = ({ onClick, loading }) => (
  <Button
    type="primary"
    icon={<SaveOutlined />}
    loading={loading}
    onClick={onClick}
    style={{ background: T.primary, borderColor: T.primary, borderRadius: 8, fontWeight: 600, height: 40, paddingInline: 28 }}
  >
    Save Changes
  </Button>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const AdvisorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advisor, setAdvisor] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Separate state for image URLs
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [passportUrl, setPassportUrl] = useState("");

  const avatarInputRef = useRef();

  const [personalForm] = Form.useForm();
  const [specialForm] = Form.useForm();
  const [identityForm] = Form.useForm();
  const [bankForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // ── Fetch profile data ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.get("/gridadvisor/me");
        const adv = res.advisor || res.data?.advisor;
        setAdvisor(adv);

        setProfilePhotoUrl(adv.profilePhotoUrl || "");
        setFrontUrl(adv.identity?.frontUrl || "");
        setBackUrl(adv.identity?.backUrl || "");
        setPassportUrl(adv.identity?.passportUrl || "");

        personalForm.setFieldsValue({
          firstName: adv.firstName,
          lastName: adv.lastName,
          email: adv.email,
          phone: adv.phone,
          countryCode: adv.countryCode || "+971",
          nationality: adv.nationality || undefined,
          location: adv.location,
          bio: adv.bio,
          languages: adv.languages || [],
        });
        specialForm.setFieldsValue({
          propertyTypes: adv.specialisation?.propertyTypes || [],
          locations: adv.specialisation?.locations || [],
          listingTypes: adv.specialisation?.listingTypes || [],
        });
        identityForm.setFieldsValue({
          type: adv.identity?.type || undefined,
          idNumber: adv.identity?.idNumber || "",
          expiryDate: adv.identity?.expiryDate?.substring(0, 10) || "",
        });
        bankForm.setFieldsValue({
          bankName: adv.bankDetails?.bankName || "",
          accountNumber: adv.bankDetails?.accountNumber || "",
          iban: adv.bankDetails?.iban || "",
          accountHolderName: adv.bankDetails?.accountHolderName || "",
        });
      } catch (err) {
        message.error("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Avatar upload (auto‑save) ───────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      message.error("Max 5MB");
      return;
    }
    try {
      setAvatarUploading(true);
      const url = await uploadToS3(file);
      setProfilePhotoUrl(url);
      await apiService.put("/gridadvisor/me", { profilePhotoUrl: url });
      setAdvisor((prev) => ({ ...prev, profilePhotoUrl: url }));
      message.success("Profile photo updated ✓");
    } catch (err) {
      message.error(err.message || "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = async (section, form) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      let payload = {};

      if (section === "personal") {
        payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          countryCode: values.countryCode,
          nationality: values.nationality,
          location: values.location,
          bio: values.bio,
          languages: values.languages,
          profilePhotoUrl,
        };
      } else if (section === "specialisation") {
        payload = { specialisation: values };
      } else if (section === "identity") {
        const docType = values.type;
        payload = {
          identity: {
            type: docType,
            idNumber: values.idNumber,
            expiryDate: values.expiryDate,
            ...(docType === "passport" ? { passportUrl } : { frontUrl, backUrl }),
          },
        };
      } else if (section === "bank") {
        payload = { bankDetails: values };
      } else if (section === "password") {
        await apiService.put("/gridadvisor/reset-password", {
          email: advisor.email,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        message.success("Password changed ✓");
        passwordForm.resetFields();
        return;
      }

      const res = await apiService.put("/gridadvisor/me", payload);
      const updated = res.data?.advisor || res.advisor;
      if (updated) setAdvisor(updated);
      message.success("Saved ✓");
    } catch (err) {
      if (err?.errorFields) {
        message.error("Please fix the errors first");
      } else {
        message.error(err?.response?.data?.message || err.message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Tab items ───────────────────────────────────────────────────────────
  const tabItems = [
    {
      key: "personal",
      label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><UserOutlined />Personal Info</span>,
      children: (
        <div style={cardStyle}>
          <SectionHeader icon={<UserOutlined />} title="Personal Information" subtitle="Update your details. Email is read-only." />
          <Form form={personalForm} layout="vertical" requiredMark={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <Form.Item label={<b style={{ fontSize: 13 }}>First Name</b>} name="firstName" rules={[{ required: true, message: "Required" }]}>
                <Input prefix={<UserOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="First name" />
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Last Name</b>} name="lastName" rules={[{ required: true, message: "Required" }]}>
                <Input prefix={<UserOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="Last name" />
              </Form.Item>
              <Form.Item label={<span style={{ fontWeight: 600, fontSize: 13 }}>Email <Tag style={{ fontSize: 10, marginLeft: 4, borderRadius: 10 }}>Read Only</Tag></span>} name="email">
                <Input prefix={<MailOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40, background: "#f9fafb" }} disabled />
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Phone</b>} style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Item name="countryCode" style={{ width: 100, marginBottom: 24 }}>
                    <Select style={{ height: 40 }}>
                      {["+971", "+91", "+1", "+44", "+92", "+20", "+962", "+966", "+974", "+965"].map((c) => (
                        <Option key={c} value={c}>{c}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="phone" style={{ flex: 1, marginBottom: 24 }} rules={[{ required: true, message: "Required" }]}>
                    <Input prefix={<PhoneOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="Phone number" />
                  </Form.Item>
                </div>
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Nationality</b>} name="nationality">
                <Select style={{ height: 40 }} placeholder="Select nationality" showSearch>
                  {NATIONALITIES.map((n) => <Option key={n} value={n}>{n}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Location</b>} name="location">
                <Input prefix={<EnvironmentOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="e.g. Dubai Marina" />
              </Form.Item>
            </div>
            <Form.Item label={<b style={{ fontSize: 13 }}>Languages</b>} name="languages">
              <Select mode="multiple" style={{ width: "100%" }} placeholder="Select languages">
                {LANGUAGES.map((l) => <Option key={l} value={l}>{l}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<b style={{ fontSize: 13 }}>Bio</b>} name="bio">
              <TextArea rows={4} style={{ borderRadius: 8 }} placeholder="Short bio about yourself..." maxLength={500} showCount />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={() => handleSave("personal", personalForm)} loading={saving} />
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "specialisation",
      label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><HomeOutlined />Specialisation</span>,
      children: (
        <div style={cardStyle}>
          <SectionHeader icon={<HomeOutlined />} title="Specialisation" subtitle="Affects which leads are assigned to you." />
          <Form form={specialForm} layout="vertical" requiredMark={false}>
            <Form.Item label={<b style={{ fontSize: 13 }}>Property Types</b>} name="propertyTypes">
              <Select mode="multiple" placeholder="Select property types" style={{ width: "100%" }}>
                {PROPERTY_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<b style={{ fontSize: 13 }}>Listing Types</b>} name="listingTypes">
              <Select mode="multiple" placeholder="Select listing types" style={{ width: "100%" }}>
                {LISTING_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<b style={{ fontSize: 13 }}>Locations / Areas You Serve</b>} name="locations">
              <Select mode="tags" style={{ width: "100%" }} placeholder="Select or type UAE areas" tokenSeparators={[","]}>
                {UAE_AREAS.map((a) => <Option key={a} value={a}>{a}</Option>)}
              </Select>
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={() => handleSave("specialisation", specialForm)} loading={saving} />
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "identity",
      label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><IdcardOutlined />Identity</span>,
      children: (
        <div style={cardStyle}>
          <SectionHeader icon={<IdcardOutlined />} title="Identity Documents" subtitle="Upload Emirates ID or Passport. Admin verifies." />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: T.primaryLight, borderRadius: 10, padding: "12px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>Verification Status</span>
            <StatusBadge
              status={
                advisor?.identity?.isVerified ? "verified" :
                advisor?.identity?.idNumber ? "pending" : "unverified"
              }
            />
          </div>
          <Form form={identityForm} layout="vertical" requiredMark={false}>
            <Form.Item label={<b style={{ fontSize: 13 }}>Document Type</b>} name="type">
              <Select style={{ height: 40 }} placeholder="Select document type">
                <Option value="emirates_id">Emirates ID</Option>
                <Option value="passport">Passport</Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
              {({ getFieldValue }) => {
                const docType = getFieldValue("type");
                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                      <Form.Item label={<b style={{ fontSize: 13 }}>{docType === "passport" ? "Passport Number" : "ID Number"}</b>} name="idNumber">
                        <Input style={{ borderRadius: 8, height: 40 }} placeholder="Document number" />
                      </Form.Item>
                      <Form.Item label={<b style={{ fontSize: 13 }}>Expiry Date</b>} name="expiryDate">
                        <Input type="date" style={{ borderRadius: 8, height: 40 }} />
                      </Form.Item>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      {docType === "passport" ? (
                        <ImageUploadBox label="Passport Image" value={passportUrl} onChange={setPassportUrl} hint="JPG / PNG / WEBP · Max 5MB" />
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                          <ImageUploadBox label="Emirates ID — Front" value={frontUrl} onChange={setFrontUrl} hint="Front side" />
                          <ImageUploadBox label="Emirates ID — Back" value={backUrl} onChange={setBackUrl} hint="Back side" />
                        </div>
                      )}
                    </div>
                  </>
                );
              }}
            </Form.Item>
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: T.warning }}>
              ⚠️ Documents will be reviewed by admin. Verification takes 1–2 business days.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={() => handleSave("identity", identityForm)} loading={saving} />
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "bank",
      label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BankOutlined />Bank Details</span>,
      children: (
        <div style={cardStyle}>
          <SectionHeader icon={<BankOutlined />} title="Bank Details" subtitle="Used for salary and commission payouts." />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: T.primaryLight, borderRadius: 10, padding: "12px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>Verification Status</span>
            <StatusBadge
              status={
                advisor?.bankDetails?.isVerified ? "verified" :
                advisor?.bankDetails?.bankName ? "pending" : "unverified"
              }
            />
          </div>
          <Form form={bankForm} layout="vertical" requiredMark={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <Form.Item label={<b style={{ fontSize: 13 }}>Bank Name</b>} name="bankName">
                <Input prefix={<BankOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="e.g. Emirates NBD" />
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Account Holder Name</b>} name="accountHolderName">
                <Input prefix={<UserOutlined style={{ color: T.gray }} />} style={{ borderRadius: 8, height: 40 }} placeholder="Full name on account" />
              </Form.Item>
              <Form.Item label={<b style={{ fontSize: 13 }}>Account Number</b>} name="accountNumber">
                <Input style={{ borderRadius: 8, height: 40 }} placeholder="Account number" />
              </Form.Item>
              <Form.Item
                label={<b style={{ fontSize: 13 }}>IBAN</b>}
                name="iban"
                rules={[{ pattern: /^AE\d{21}$/, message: "Format: AE + 21 digits" }]}
              >
                <Input style={{ borderRadius: 8, height: 40 }} placeholder="AE000000000000000000000" />
              </Form.Item>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={() => handleSave("bank", bankForm)} loading={saving} />
            </div>
          </Form>
        </div>
      ),
    },
    {
      key: "password",
      label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><LockOutlined />Password</span>,
      children: (
        <div style={cardStyle}>
          <SectionHeader icon={<LockOutlined />} title="Change Password" subtitle="Minimum 8 characters." />
          <Form form={passwordForm} layout="vertical" requiredMark={false} style={{ maxWidth: 460 }}>
            <Form.Item label={<b style={{ fontSize: 13 }}>Current Password</b>} name="oldPassword" rules={[{ required: true, message: "Required" }]}>
              <Input.Password style={{ borderRadius: 8, height: 40 }} placeholder="Current password" />
            </Form.Item>
            <Form.Item label={<b style={{ fontSize: 13 }}>New Password</b>} name="newPassword"
              rules={[{ required: true, message: "Required" }, { min: 8, message: "Min 8 characters" }]}>
              <Input.Password style={{ borderRadius: 8, height: 40 }} placeholder="New password" />
            </Form.Item>
            <Form.Item
              label={<b style={{ fontSize: 13 }}>Confirm New Password</b>}
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password style={{ borderRadius: 8, height: 40 }} placeholder="Confirm new password" />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={() => handleSave("password", passwordForm)} loading={saving} />
            </div>
          </Form>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", background: "#faf5ff", minHeight: "100vh" }}>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.primary }}>My Profile</h2>
          <p style={{ margin: 0, fontSize: 12, color: T.gray }}>Manage your info, documents and account settings</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div style={{
        ...cardStyle, display: "flex", alignItems: "center", gap: 24, marginBottom: 24,
        background: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%", background: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, fontWeight: 800, color: "#fff",
            border: "3px solid #fff", boxShadow: "0 4px 12px rgba(92,3,155,0.25)", overflow: "hidden",
          }}>
            {avatarUploading ? (
              <LoadingOutlined style={{ fontSize: 28, color: "#fff" }} spin />
            ) : profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              `${advisor?.firstName?.[0] || ""}${advisor?.lastName?.[0] || ""}`
            )}
          </div>
          <Tooltip title="Change profile photo">
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%",
                background: T.primary, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(92,3,155,0.3)",
              }}
            >
              <CameraOutlined style={{ color: "#fff", fontSize: 13 }} />
            </div>
          </Tooltip>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarUpload} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 800, color: "#111827" }}>
            {advisor?.firstName} {advisor?.lastName}
          </h3>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: T.gray }}>
            {advisor?.email}{advisor?.employeeId && ` · ${advisor.employeeId}`}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {advisor?.department && <Tag color="purple" style={{ borderRadius: 20, fontSize: 11 }}>{advisor.department}</Tag>}
            <Tag color={advisor?.status === "active" ? "green" : "orange"} style={{ borderRadius: 20, fontSize: 11, textTransform: "capitalize" }}>
              {advisor?.status}
            </Tag>
            {advisor?.specialisation?.propertyTypes?.slice(0, 2).map((t) => (
              <Tag key={t} style={{ borderRadius: 20, fontSize: 11, background: T.primaryLight, borderColor: T.border, color: T.primary }}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>

      <CompletionBar profileCompletion={advisor?.profileCompletion} />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabBarStyle={{ marginBottom: 20, borderBottom: `1px solid ${T.border}` }}
        tabBarGutter={8}
      />
    </div>
  );
};

export default AdvisorProfile;