import {
  Card, Typography, Button, Tag, Row, Col, Progress,
  Table, Modal, Space, Avatar
} from "antd";
import {
  CrownOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

export default function AgentSubscription() {
  const [open, setOpen] = useState(false);

  const plan = {
    name: "Pro Plan",
    status: "Active",
    validTill: "30 March 2026",
    daysLeft: 12,
    usage: 68
  };

  const billing = [
    { id: 1, invoice: "INV-1023", date: "01 Feb 2026", amount: "AED 199", status: "Paid" },
    { id: 2, invoice: "INV-0982", date: "01 Jan 2026", amount: "AED 199", status: "Paid" },
  ];

  const columns = [
    { title: "Invoice", dataIndex: "invoice" },
    { title: "Date", dataIndex: "date" },
    { title: "Amount", dataIndex: "amount" },
    {
      title: "Status",
      dataIndex: "status",
      render: s => <Tag color="green">{s}</Tag>
    },
    { title: "", render: () => <Button type="link">Download</Button> }
  ];

  return (
    <div className="p-6">
      
      {/* MAGIC FIX 1: Wrap everything in a vertical Space component 
        Ye automatically saare cards ke beech mein 24px ka perfect gap de dega 
      */}
      <Space direction="vertical" size={24} style={{ display: "flex", width: "100%" }}>

        {/* ===== HEADER CARD ===== */}
        <Card
          bordered={false}
          className="shadow-lg rounded-2xl"
          style={{
            background: "linear-gradient(135deg,#5c039b,#7b2ff7)",
            color: "#fff"
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space size={16} align="center">
                <Avatar
                  size={64}
                  icon={<CrownOutlined />}
                  style={{ background: "#fff", color: "#5c039b" }}
                />
                <div>
                  <Text style={{ color: "#ddd" }}>Current Plan</Text>
                  <Title level={3} style={{ margin: 0, color: "#fff" }}>
                    {plan.name}
                  </Title>
                  <Tag color="success" style={{ marginTop: '4px' }}>{plan.status}</Tag>
                </div>
              </Space>
            </Col>

            <Col>
              <Button
                size="large"
                style={{
                  background: "#fff",
                  color: "#5c039b",
                  border: "none",
                  fontWeight: 600
                }}
                onClick={() => setOpen(true)}
              >
                Upgrade Plan
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ===== STATS CARDS ===== */}
        {/* MAGIC FIX 2: Use gutter={[16, 16]} so vertical gap is also added on smaller screens */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm">
              <Space align="center" size={16}>
                <CalendarOutlined style={{ fontSize: 24, color: "#5c039b" }} />
                <div>
                  <Text type="secondary">Valid Till</Text><br />
                  <Text strong>{plan.validTill}</Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm">
              <Space align="center" size={16}>
                <ThunderboltOutlined style={{ fontSize: 24, color: "#5c039b" }} />
                <div>
                  <Text type="secondary">Days Remaining</Text><br />
                  <Text strong>{plan.daysLeft} days</Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm">
              <Space align="center" size={16}>
                <CreditCardOutlined style={{ fontSize: 24, color: "#5c039b" }} />
                <div>
                  <Text type="secondary">Payment Method</Text><br />
                  <Text strong>Visa **** 4242</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* ===== USAGE ===== */}
        <Card className="shadow-sm rounded-xl">
          <Title level={5} style={{ marginBottom: 16 }}>Monthly Usage</Title>
          
          <Progress
            percent={plan.usage}
            strokeColor="#5c039b"
            strokeWidth={10}
            style={{ marginBottom: '8px' }} // MAGIC FIX 3: Progress bar aur text ke beech thoda gap
          />

          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">
              {plan.usage}% of leads quota used this month
            </Text>
          </div>
        </Card>

        {/* ===== BILLING TABLE ===== */}
        <Card className="shadow-sm rounded-xl">
          <Title level={5} style={{ marginBottom: 16 }}>Billing History</Title>
          <Table
            columns={columns}
            dataSource={billing}
            rowKey="id"
            pagination={false}
          />
        </Card>

      </Space>

      {/* ===== MODAL ===== */}
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title="Upgrade Your Plan"
      >
        <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 16 }}>
          <Card className="rounded-xl border">
            <Title level={5}>Starter Plan</Title>
            <Text>10 Leads / month</Text><br />
            <Text>Basic Support</Text>
            <Button block className="mt-3">
              Choose Starter
            </Button>
          </Card>

          <Card
            className="rounded-xl border"
            style={{ borderColor: "#5c039b" }}
          >
            <Title level={5}>Pro Plan</Title>
            <Text>50 Leads / month</Text><br />
            <Text>Priority Support</Text>
            <Button
              block
              type="primary"
              style={{ background: "#5c039b", borderColor: "#5c039b", marginTop: 12 }}
            >
              Choose Pro
            </Button>
          </Card>
        </Space>
      </Modal>
    </div>
  );
}