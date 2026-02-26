import {
  Card,
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Breadcrumb,
  Space,
  Tag,
  Segmented,
  message
} from "antd";
import { PercentageOutlined, DollarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DeveloperCommissionScheme() {
  const [form] = Form.useForm();

  const type = Form.useWatch("type", form);
  const value = Form.useWatch("value", form);
  const bonus = Form.useWatch("bonus", form);

  const onFinish = (values) => {
    console.log(values);
    message.success("Commission scheme saved successfully");
  };

  return (
    <div
      style={{
        padding: 24,
        background: "#f6f8fb",
        minHeight: "100vh"
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 18 }}>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Commission</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 20,
          background:
            "linear-gradient(135deg, #5c039b 0%, #7b2cbf 100%)",
          color: "white",
          border: "none"
        }}
        bodyStyle={{ padding: 26 }}
      >
        <Title level={3} style={{ color: "white", marginBottom: 4 }}>
          Commission Scheme Setup
        </Title>

        <Text style={{ color: "rgba(255,255,255,0.85)" }}>
          Define how agents will earn commission for this project.
        </Text>

        <div style={{ marginTop: 12 }}>
          <Tag color="gold">Finance Configuration</Tag>
        </div>
      </Card>

      <Row gutter={20}>
        {/* LEFT FORM */}
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: 14,
              boxShadow: "0 6px 22px rgba(0,0,0,0.05)"
            }}
          >
            <Form layout="vertical" form={form} onFinish={onFinish}>

              <Title level={5}>Commission Type</Title>

              <Form.Item
                name="type"
                rules={[{ required: true, message: "Select commission type" }]}
              >
                <Segmented
                  size="large"
                  style={{ width: "100%" }}
                  options={[
                    {
                      label: (
                        <Space>
                          <PercentageOutlined /> Percentage
                        </Space>
                      ),
                      value: "percentage"
                    },
                    {
                      label: (
                        <Space>
                          <DollarOutlined /> Fixed Amount
                        </Space>
                      ),
                      value: "fixed"
                    }
                  ]}
                />
              </Form.Item>

              <Divider />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Commission Value"
                    name="value"
                    rules={[{ required: true, message: "Enter value" }]}
                  >
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      addonAfter={type === "percentage" ? "%" : "₹"}
                      placeholder="Enter commission"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Bonus After Booking" name="bonus">
                    <InputNumber
                      size="large"
                      style={{ width: "100%" }}
                      addonAfter="%"
                      placeholder="Optional"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row justify="end">
                <Space>
                  <Button size="large" onClick={() => form.resetFields()}>
                    Reset
                  </Button>

                  <Button type="primary" size="large" htmlType="submit">
                    Save Commission Scheme
                  </Button>
                </Space>
              </Row>

            </Form>
          </Card>
        </Col>

        {/* RIGHT LIVE PREVIEW PANEL */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 14,
              position: "sticky",
              top: 20,
              boxShadow: "0 6px 22px rgba(0,0,0,0.05)"
            }}
          >
            <Title level={5}>Live Preview</Title>

            <Text type="secondary">
              This is how commission will be calculated.
            </Text>

            <Divider />

            <div style={{ fontSize: 16 }}>
              <p>
                <strong>Type:</strong>{" "}
                {type ? type.toUpperCase() : "—"}
              </p>

              <p>
                <strong>Commission:</strong>{" "}
                {value ? (
                  type === "percentage"
                    ? `${value}%`
                    : `₹ ${value}`
                ) : "—"}
              </p>

              <p>
                <strong>Bonus:</strong>{" "}
                {bonus ? `${bonus}%` : "None"}
              </p>
            </div>

            <Divider />

            <Text type="secondary">
              Example: If property price is ₹1 Cr, commission will be calculated automatically based on this configuration.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}