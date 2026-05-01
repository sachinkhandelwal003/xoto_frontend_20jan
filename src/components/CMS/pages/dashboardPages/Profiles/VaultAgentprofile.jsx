import React, { useEffect, useState } from "react";
import {
  Avatar, Badge, Tag, Space, Row, Col,
  Typography, Button, Modal, Form, Input,
  message, Upload, Switch, Spin, Tooltip, Divider, Select
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, CrownOutlined,
  FileDoneOutlined, EditOutlined,
  CameraOutlined, LoadingOutlined, FilePdfOutlined, EyeOutlined,
  UploadOutlined, WhatsAppOutlined, MessageOutlined,
  BankOutlined, EnvironmentOutlined, IdcardOutlined,
  SafetyCertificateOutlined, StarOutlined, BellOutlined,
  TeamOutlined, CalendarOutlined, ManOutlined, HeartOutlined,
  GlobalOutlined, HomeOutlined, TrophyOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title } = Typography;
const { Option } = Select;

const THEME = "#5C039B";

// ── Nationality map ───────────────────────────────────────────────────
const NATIONALITY_MAP = {
  AE: "UAE National", IN: "Indian",    PK: "Pakistani", US: "American",
  GB: "British",      SA: "Saudi",     EG: "Egyptian",  JO: "Jordanian",
  LB: "Lebanese",     SY: "Syrian",    IQ: "Iraqi",     YE: "Yemeni",
  OM: "Omani",        QA: "Qatari",    KW: "Kuwaiti",   BH: "Bahraini",
};
const getNationalityLabel = (code) => NATIONALITY_MAP[code] || code || null;

// ── StatCard ──────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div
    style={{
      background: "#fff", border: "1px solid #f0e8ff", borderRadius: 16,
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 2px 12px rgba(92,3,155,0.06)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(92,3,155,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(92,3,155,0.06)"; }}
  >
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { style: { fontSize: 22, color } })}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1a0533", lineHeight: 1.1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: "#9b8ab0", marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// ── InfoRow ───────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, extra, isLast }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "13px 0",
    borderBottom: isLast ? "none" : "1px solid #f5f0ff",
  }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f0ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { style: { fontSize: 15, color: THEME } })}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "#a392b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#2d1045", fontWeight: 600, marginTop: 2, wordBreak: "break-word" }}>
        {value != null && value !== "" && value !== false
          ? value
          : <span style={{ color: "#c9b8dc", fontWeight: 400 }}>Not provided</span>
        }
      </div>
    </div>
    {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
  </div>
);

// ── NotifBadge ────────────────────────────────────────────────────────
const NotifBadge = ({ icon, label, active }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
    borderRadius: 20, border: `1.5px solid ${active ? THEME : "#e8dff5"}`,
    background: active ? "#f5f0ff" : "#faf8ff",
    color: active ? THEME : "#b8a8cc", fontSize: 13, fontWeight: 600,
  }}>
    {React.cloneElement(icon, { style: { fontSize: 14 } })}
    {label}
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "#22c55e" : "#d1c5e8", marginLeft: 2 }} />
  </div>
);

// ── DocCard ───────────────────────────────────────────────────────────
const DocCard = ({ icon, label, url, uploadField, onUpload, uploading }) => (
  <div style={{
    background: url ? "#f5f0ff" : "#faf8ff",
    border: `1.5px solid ${url ? "#d8c5ff" : "#ede5ff"}`,
    borderRadius: 14, padding: "14px 18px",
    display: "flex", alignItems: "center", gap: 12,
  }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: url ? `${THEME}20` : "#ede5ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { style: { fontSize: 20, color: url ? THEME : "#c0aad8" } })}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1045" }}>{label}</div>
      <div style={{ fontSize: 12, color: url ? "#7c3aed" : "#c0aad8", marginTop: 2 }}>
        {url ? "Uploaded ✓" : "Not uploaded"}
      </div>
    </div>
    <Space size={6}>
      {url && (
        <Tooltip title="View Document">
          <Button size="small" icon={<EyeOutlined />} href={url} target="_blank"
            style={{ borderColor: THEME, color: THEME, borderRadius: 8 }} />
        </Tooltip>
      )}
      <Upload showUploadList={false} customRequest={({ file }) => onUpload(file, uploadField)}>
        <Tooltip title="Upload New">
          <Button size="small" icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            style={{ borderRadius: 8, background: THEME, borderColor: THEME, color: "#fff" }} />
        </Tooltip>
      </Upload>
    </Space>
  </div>
);

// ── SectionHeader ─────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {React.cloneElement(icon, { style: { color: THEME, fontSize: 15 } })}
    </div>
    <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME }}>{title}</span>
  </div>
);

// ── SectionCard ───────────────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <div style={{
    background: "#fff", borderRadius: 20, border: "1px solid #f0e8ff",
    boxShadow: "0 2px 16px rgba(92,3,155,0.06)", overflow: "hidden",
    padding: "24px 28px", ...style,
  }}>
    {children}
  </div>
);

// ── StatusRow ─────────────────────────────────────────────────────────
const StatusRow = ({ label, active, color }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 16px", borderRadius: 12,
    background: active ? `${color}0d` : "#f9f7ff",
    border: `1px solid ${active ? `${color}30` : "#ede8ff"}`,
  }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#1a0533" : "#b8a8cc" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? color : "#d1c5e8" }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: active ? color : "#d1c5e8" }}>
        {active ? "Active" : "Pending"}
      </span>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
const VaultAgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats]     = useState({ totalLeads: 0, closedDeals: 0, activeCases: 0, commissionEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [form] = Form.useForm();

  // ── fetch profile ─────────────────────────────────────────────────
  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("profile/get-profile-data");

      // ✅ Response: { data: { ...agentFields } }
      const data =
        response?.data ||
        response?.data?.agent ||
        response?.data?.profile ||
        response?.data ||
        response;

      setProfile(data);

      // ✅ Stats from earnings object
      setStats({
        totalLeads:       data?.earnings?.totalLeadsSubmitted   ?? 0,
        closedDeals:      data?.earnings?.successfulDisbursals  ?? 0,
        activeCases:      data?.earnings?.leaderboardRank       ?? 0,
        commissionEarned: data?.earnings?.totalCommissionEarned ?? 0,
      });

    } catch {
      message.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getProfile(); }, []);

  // ── file upload ───────────────────────────────────────────────────
 const handleFileUpload = async (file, fieldName) => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  formData.append("targetField", fieldName);

  setImageUploading(true);
  try {
    const res = await apiService.post(
      "profile/update-profile-picture",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    

    // ✅ dynamic field fix
    const newUrl = res?.data?.data?.[fieldName];

    if (newUrl) {
      setProfile((prev) => ({
        ...prev,
        [fieldName]: newUrl,
      }));
    }

    message.success(`${fieldName} updated!`);
    await getProfile();

  } catch (err) {
    
    message.error("Upload failed.");
  } finally {
    setImageUploading(false);
  }
};

  // ── update profile ────────────────────────────────────────────────
const handleUpdate = async (values) => {
  setUpdating(true);
  try {
   const payload = {
  first_name: values.first_name,
  last_name: values.last_name,
  country_code: values.country_code,
  phone_number: values.phone_number,

  gender: values.gender,
  dateOfBirth: values.dateOfBirth,
  maritalStatus: values.maritalStatus,
  nationality: values.nationality,
  numberOfDependents: values.numberOfDependents,
  specialization: values.specialization,
  operating_city: values.operating_city,
  country: values.country,
  notificationSettings_email: values.notificationSettings_email,
  notificationSettings_whatsapp: values.notificationSettings_whatsapp,
  notificationSettings_sms: values.notificationSettings_sms,
};

    await apiService.put("profile/update-profile", payload);

    message.success("Profile updated successfully!");
    setIsModalVisible(false);

    await getProfile(); // 👈 correct

  } catch (err) {
    
    message.error("Update failed.");
  } finally {
    setUpdating(false);
  }
};

  // ── open edit modal with correct field mapping ────────────────────
  const openEdit = () => {
    form.setFieldsValue({
      // ✅ name is nested: name.first_name / name.last_name
      first_name:  profile?.name?.first_name  || "",
      last_name:   profile?.name?.last_name   || "",
      gender:              profile?.gender,
      dateOfBirth:         profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      maritalStatus:       profile?.maritalStatus,
      nationality:         profile?.nationality,
      numberOfDependents:  profile?.numberOfDependents,
      specialization:      profile?.specialization,
      // ✅ phone is nested: phone.country_code / phone.number
      country_code:        profile?.phone?.country_code || "",
      phone_number:        profile?.phone?.number       || "",
      operating_city:      profile?.operating_city,
      country:             profile?.country || "UAE",
      notificationSettings_email:    profile?.notificationSettings_email    || false,
      notificationSettings_whatsapp: profile?.notificationSettings_whatsapp || false,
      notificationSettings_sms:      profile?.notificationSettings_sms      || false,
    });
    setIsModalVisible(true);
  };

  // ── format date ───────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  };

  // ── loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ✅ name is nested
  const fullName = `${profile?.name?.first_name || ""} ${profile?.name?.last_name || ""}`.trim() || "—";
  const agentId  = `#${(profile?._id || "000000").slice(-6).toUpperCase()}`;

  // ── render ────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .vap-page { box-sizing: border-box; }
        .vap-page *, .vap-page *::before, .vap-page *::after { box-sizing: border-box; }
      `}</style>

      <div className="vap-page" style={{ background: "#f7f3ff", minHeight: "100vh", padding: "28px 24px" }}>

        {/* ══ HERO BANNER ══════════════════════════════════════════ */}
        <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 24, boxShadow: "0 8px 40px rgba(92,3,155,0.18)" }}>

          {/* gradient bar */}
          <div style={{ height: 160, background: "linear-gradient(135deg, #5C039B 0%, #3a0266 45%, #7c3aed 100%)", position: "relative" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -60, left: "35%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", top: 20, right: 20 }}>
              <Button icon={<EditOutlined />} onClick={openEdit}
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10 }}>
                Edit Profile
              </Button>
            </div>
          </div>

          {/* avatar + identity */}
          <div style={{ background: "#fff", padding: "0 32px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -52, flexWrap: "wrap" }}>

              {/* avatar */}
              <div style={{ flexShrink: 0 }}>
                <Badge dot status={profile?.isVerified ? "success" : "warning"} offset={[-8, 88]}>
                 <Upload
  showUploadList={false}
  customRequest={({ file }) =>
    handleFileUpload(file, "profilePic") // ✅ FIXED
  }
>
                    <div style={{ position: "relative", cursor: "pointer", borderRadius: "50%", border: "4px solid #fff", boxShadow: "0 4px 20px rgba(92,3,155,0.2)", display: "inline-block" }}>
                      {imageUploading && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
                          <LoadingOutlined style={{ color: "#fff", fontSize: 20 }} spin />
                        </div>
                      )}
                      {/* ✅ profilePic — correct field from backend */}
                   <Avatar
  size={104}
  icon={<UserOutlined />}
  src={profile?.profilePic || null}
/>
                      <div
                        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.35)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                      >
                        <CameraOutlined style={{ color: "#fff", fontSize: 22 }} />
                      </div>
                    </div>
                  </Upload>
                </Badge>
              </div>

              {/* name + tags */}
              <div style={{ flex: 1, paddingBottom: 4, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Title level={3} style={{ margin: 0, color: "#1a0533", fontWeight: 800 }}>{fullName}</Title>
                  {profile?.isVerified && (
                    <Tooltip title="Verified Agent">
                      <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                    </Tooltip>
                  )}
                </div>
                
              </div>

              {/* agent ID chip */}
            
            </div>
          </div>
        </div>

        {/* ══ STATS ROW ════════════════════════════════════════════ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            { icon: <FileDoneOutlined />,       label: "Total Leads",        value: stats.totalLeads,       color: "#7c3aed" },
            { icon: <TrophyOutlined />,          label: "Successful Disbursals", value: stats.closedDeals,   color: "#f59e0b" },
            { icon: <BankOutlined />,            label: "Leaderboard Rank",   value: stats.activeCases || "—", color: "#3b82f6" },
            { icon: <SafetyCertificateOutlined />, label: "Commission Earned",
              value: `AED ${Number(stats.commissionEarned || 0).toLocaleString()}`, color: "#10b981" },
          ].map((s) => (
            <Col xs={24} sm={12} md={6} key={s.label}>
              <StatCard {...s} />
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]}>

          {/* ══ LEFT COLUMN ════════════════════════════════════════ */}
          <Col xs={24} lg={14}>

            {/* Personal Info */}
            <SectionCard style={{ marginBottom: 20 }}>
              <SectionHeader icon={<UserOutlined />} title="Personal Information" />

              <InfoRow
                icon={<MailOutlined />} label="Email Address" value={profile?.email}
                extra={profile?.isEmailVerified && <Tag color="success" style={{ borderRadius: 20, fontSize: 11 }}>Verified</Tag>}
              />
              {/* ✅ phone is nested */}
              <InfoRow
                icon={<PhoneOutlined />} label="Mobile Number"
                value={profile?.phone?.number
                  ? `${profile.phone?.country_code || ""} ${profile.phone.number}`.trim()
                  : null}
                extra={profile?.isPhoneVerified && <Tag color="success" style={{ borderRadius: 20, fontSize: 11 }}>Verified</Tag>}
              />
              <InfoRow icon={<GlobalOutlined />}   label="Nationality"    value={getNationalityLabel(profile?.nationality)} />
              <InfoRow icon={<CalendarOutlined />}  label="Date of Birth"  value={formatDate(profile?.dateOfBirth)} />
              <InfoRow icon={<ManOutlined />}       label="Gender"         value={profile?.gender} />
              <InfoRow icon={<HeartOutlined />}     label="Marital Status" value={profile?.maritalStatus} />
              <InfoRow
                icon={<TeamOutlined />} label="Number of Dependents"
                value={profile?.numberOfDependents != null
                  ? `${profile.numberOfDependents} ${profile.numberOfDependents === 1 ? "Dependent" : "Dependents"}`
                  : null}
              />
              <InfoRow icon={<EnvironmentOutlined />} label="Operating City"  value={profile?.operating_city} />
              <InfoRow icon={<BankOutlined />}         label="Country"         value={profile?.country || "UAE"} />
              <InfoRow icon={<StarOutlined />}         label="Specialization"  value={profile?.specialization} />
              <InfoRow icon={<GlobalOutlined />}       label="Language"        value={profile?.languagePreference} />
              <InfoRow icon={<MessageOutlined />}      label="Communication"   value={profile?.communicationPreference} isLast />
            </SectionCard>

            {/* Partner Info — only for affiliated agents */}
            {profile?.agentType === "PartnerAffiliatedAgent" && (
              <SectionCard style={{ marginBottom: 20 }}>
                <SectionHeader icon={<HomeOutlined />} title="Partner Information" />
                <InfoRow icon={<BankOutlined />}   label="Partner Company" value={profile?.partnerId?.companyName || profile?.partnerCompany} />
                <InfoRow icon={<IdcardOutlined />} label="Partner ID"
                  value={profile?.partnerId?._id ? `#${profile.partnerId._id.slice(-6).toUpperCase()}` : null}
                  isLast
                />
              </SectionCard>
            )}

         
          </Col>

          {/* ══ RIGHT COLUMN ═══════════════════════════════════════ */}
          <Col xs={24} lg={10}>

            {/* Documents — ✅ fields from backend schema */}
            <SectionCard style={{ marginBottom: 20 }}>
              <SectionHeader icon={<FileDoneOutlined />} title="Documents" />
              <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <DocCard icon={<IdcardOutlined />}         label="Emirates ID (Front)"  url={profile?.emiratesId?.frontImageUrl}  uploadField="emiratesId_front"    onUpload={handleFileUpload} uploading={imageUploading} />
                <DocCard icon={<IdcardOutlined />}         label="Emirates ID (Back)"   url={profile?.emiratesId?.backImageUrl}   uploadField="emiratesId_back"     onUpload={handleFileUpload} uploading={imageUploading} />
                <DocCard icon={<FilePdfOutlined />}        label="Passport"             url={profile?.passport?.imageUrl}         uploadField="passport_image"      onUpload={handleFileUpload} uploading={imageUploading} />
                <DocCard icon={<FilePdfOutlined />}        label="Visa Copy"            url={profile?.visa?.imageUrl}            uploadField="visa_image"          onUpload={handleFileUpload} uploading={imageUploading} />
              </Space>
            </SectionCard>

            {/* Bank Details */}
            <SectionCard style={{ marginBottom: 20 }}>
              <SectionHeader icon={<BankOutlined />} title="Bank Details" />
              <InfoRow icon={<UserOutlined />}   label="Beneficiary Name" value={profile?.bankDetails?.beneficiaryName} />
              <InfoRow icon={<BankOutlined />}   label="Bank Name"        value={profile?.bankDetails?.bankName} />
              <InfoRow icon={<IdcardOutlined />} label="Account Number"   value={profile?.bankDetails?.accountNumber} />
              <InfoRow icon={<IdcardOutlined />} label="IBAN"             value={profile?.bankDetails?.iban} />
              <InfoRow icon={<GlobalOutlined />} label="SWIFT Code"       value={profile?.bankDetails?.swiftCode} />
              <InfoRow icon={<BankOutlined />}   label="Account Type"     value={profile?.bankDetails?.accountType} isLast />
            </SectionCard>

          
          </Col>
        </Row>
      </div>

      {/* ══ EDIT MODAL ═══════════════════════════════════════════════ */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EditOutlined style={{ color: THEME }} />
            </div>
            <span style={{ fontWeight: 700, color: "#1a0533" }}>Edit Profile</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
        styles={{ body: { padding: "24px 28px", maxHeight: "75vh", overflowY: "auto" } }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>

          {/* Personal */}
          <Divider orientation="left" orientationMargin={0}>
            <Text style={{ fontSize: 11, color: THEME, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Personal Information</Text>
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                <Input prefix={<UserOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                <Input prefix={<UserOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select" style={{ borderRadius: 10 }} allowClear>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Date of Birth">
                <Input type="date" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select placeholder="Select" style={{ borderRadius: 10 }} allowClear>
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Divorced">Divorced</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nationality" label="Nationality">
                <Select placeholder="Select" showSearch optionFilterProp="label" style={{ borderRadius: 10 }} allowClear>
                  {Object.entries(NATIONALITY_MAP).map(([code, label]) => (
                    <Option key={code} value={code} label={label}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="numberOfDependents" label="Dependents">
                <Select placeholder="Select" style={{ borderRadius: 10 }} allowClear>
                  {Array.from({ length: 11 }, (_, i) => (
                    <Option key={i} value={i}>{i === 0 ? "None" : i === 1 ? "1 Dependent" : `${i} Dependents`}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="specialization" label="Specialization">
                <Input prefix={<StarOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Contact */}
          <Divider orientation="left" orientationMargin={0}>
            <Text style={{ fontSize: 11, color: THEME, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact & Location</Text>
          </Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="country_code" label="Code">
                <Input style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item name="phone_number" label="Phone Number">
                <Input prefix={<PhoneOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operating_city" label="Operating City">
                <Input prefix={<EnvironmentOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input prefix={<BankOutlined style={{ color: "#c0aad8" }} />} style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Documents */}
          <Divider orientation="left" orientationMargin={0}>
            <Text style={{ fontSize: 11, color: THEME, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Documents</Text>
          </Divider>
          <Row gutter={12}>
            {[
              { field: "emiratesId_front",  label: "Emirates ID (Front)", icon: <IdcardOutlined /> },
              { field: "emiratesId_back",   label: "Emirates ID (Back)",  icon: <IdcardOutlined /> },
              { field: "passport_image",    label: "Passport",            icon: <FilePdfOutlined /> },
              { field: "visa_image",        label: "Visa Copy",           icon: <FilePdfOutlined /> },
              { field: "rera_certificate",  label: "RERA Certificate",    icon: <SafetyCertificateOutlined /> },
            ].map(({ field, label, icon }) => (
              <Col span={12} key={field} style={{ marginBottom: 10 }}>
                <div style={{ background: "#f9f7ff", borderRadius: 12, padding: "12px 14px", border: "1px solid #ede8ff" }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: "#1a0533", display: "block", marginBottom: 8 }}>
                    {React.cloneElement(icon, { style: { marginRight: 6, color: THEME } })} {label}
                  </Text>
                  <Upload showUploadList={false} customRequest={({ file }) => handleFileUpload(file, field)}>
                    <Button icon={<UploadOutlined />} block style={{ borderRadius: 8, borderColor: THEME, color: THEME }}>
                      Upload
                    </Button>
                  </Upload>
                </div>
              </Col>
            ))}
          </Row>

          {/* Notifications */}
          <Divider orientation="left" orientationMargin={0}>
            <Text style={{ fontSize: 11, color: THEME, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notification Preferences</Text>
          </Divider>
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Form.Item name="notificationSettings_email" label={<><MailOutlined style={{ marginRight: 4 }} /> Email</>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notificationSettings_whatsapp" label={<><WhatsAppOutlined style={{ marginRight: 4 }} /> WhatsApp</>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notificationSettings_sms" label={<><MessageOutlined style={{ marginRight: 4 }} /> SMS</>} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #f0e8ff" }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ borderRadius: 10 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}
              style={{ background: THEME, borderColor: THEME, borderRadius: 10, paddingInline: 28, fontWeight: 600 }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default VaultAgentProfile;