// src/pages/Advisor/VaultCreateadvisor.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Form, Input, Select, DatePicker, Button, Row, Col, Typography,
  message, Spin, Divider
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FlagOutlined,
  TeamOutlined,
  IdcardOutlined,
  BankOutlined,
  SaveOutlined,
  CloseOutlined,      
  LockOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Option } = Select;

// Brand tokens – consistent with VaultPartnerProfile
const P = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";
const GN = "#22C55E";
const RD = "#EF4444";

// Section header component (reused)
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 12,
      background: `linear-gradient(135deg, ${P}10, ${PL})`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {React.cloneElement(icon, { style: { fontSize: 16, color: P } })}
    </div>
    <span style={{
      fontSize: 14, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.05em", color: P
    }}>
      {title}
    </span>
  </div>
);

const VaultCreateadvisor = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
        joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
        maxLeadsCapacity: values.maxLeadsCapacity ? Number(values.maxLeadsCapacity) : undefined,
        phone_number: values.phone_number?.replace(/\s/g, ""),
      };
      await apiService.post("/vault/advisor/create", payload);
      message.success("Advisor created! Login credentials sent via email.");
      setTimeout(() => navigate("/advisor/list"), 1500);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to create advisor");
    } finally {
      setLoading(false);
    }
  };

  const NATIONALITIES = [
    "United Arab Emirates", "Saudi Arabia", "India", "Pakistan", "Egypt", "Jordan",
    "Lebanon", "Philippines", "United Kingdom", "United States", "Other"
  ];

  const DEPARTMENTS = [
    "Mortgage Advisory", "Sales", "Operations", "Compliance", "Customer Service"
  ];

  const COUNTRY_CODES = ["+971", "+966", "+91", "+44", "+1", "+20", "+962", "+961"];

  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`
        .vpp .ant-input,
        .vpp .ant-select-selector,
        .vpp .ant-picker {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
        }
        .vpp .ant-input:focus,
        .vpp .ant-select-focused .ant-select-selector,
        .vpp .ant-picker-focused {
          border-color: ${P} !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important;
        }
        .vpp .ant-form-item-label > label {
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #6b4f9a !important;
        }
        .vpp .ant-divider-inner-text {
          font-size: 10px !important;
          font-weight: 800 !important;
          letter-spacing: .08em !important;
          color: ${P} !important;
          text-transform: uppercase !important;
        }
      `}</style>

      <div className="vpp">
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ color: "#1a0533", fontWeight: 800, margin: 0 }}>
            Create New Advisor
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Add a new Xoto mortgage advisor. Login credentials will be sent via email automatically.
          </Text>
        </div>

        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: "0 8px 24px rgba(92,3,155,0.08)",
            border: "1px solid #ede4ff",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ country_code: "+971" }}
          >
            {/* ── Section 1: Personal Information ── */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0e8ff" }}>
              <SectionHeader icon={<UserOutlined />} title="Personal Information" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="e.g. Ahmed" prefix={<UserOutlined style={{ color: P }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="e.g. Al Mansouri" prefix={<UserOutlined style={{ color: P }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Required" },
                      { type: "email", message: "Invalid email" }
                    ]}
                  >
                    <Input placeholder="ahmed@xoto.ae" prefix={<MailOutlined style={{ color: P }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Required" },
                      { min: 8, message: "Min 8 characters" }
                    ]}
                  >
                    <Input.Password placeholder="Min 8 chars" prefix={<LockOutlined style={{ color: P }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Phone Number" required>
                    <Input.Group compact>
                      <Form.Item
                        name="country_code"
                        noStyle
                        rules={[{ required: true }]}
                      >
                        <Select style={{ width: "30%" }}>
                          {COUNTRY_CODES.map(code => (
                            <Option key={code} value={code}>{code}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="phone_number"
                        noStyle
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input style={{ width: "70%" }} placeholder="50 123 4567" prefix={<PhoneOutlined style={{ color: P }} />} />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="nationality" label="Nationality">
                    <Select placeholder="Select nationality" allowClear>
                      {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Gender">
                    <Select placeholder="Select gender" allowClear>
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* ── Section 2: Employment Details ── */}
            <div style={{ padding: "24px 28px" }}>
              <SectionHeader icon={<BankOutlined />} title="Employment Details" />
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="department" label="Department">
                    <Select placeholder="Select department" allowClear>
                      {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="designation" label="Designation">
                    <Input placeholder="e.g. Senior Mortgage Advisor" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="joinDate" label="Join Date">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maxLeadsCapacity" label="Max Leads Capacity">
                    <Input type="number" min={1} max={100} placeholder="e.g. 25" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="profilePic" label="Profile Photo URL">
                    <Input placeholder="https://cdn.xoto.ae/employees/photo.jpg" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: "16px 28px",
              background: "#faf8ff",
              borderTop: "1px solid #ede4ff",
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}>
              <Button
                icon={<CloseOutlined />}
                onClick={() => navigate("/advisor/list")}
                style={{ borderRadius: 30 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{
                  background: P,
                  borderColor: P,
                  borderRadius: 30,
                  fontWeight: 600,
                }}
              >
                Create Advisor
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default VaultCreateadvisor;