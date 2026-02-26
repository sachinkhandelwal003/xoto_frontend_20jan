import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Divider,
  Space
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentSiteVisitDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data (replace with API later)
  const visit = {
    client: "Rahul Mehta",
    phone: "+91 9876543210",
    project: "Sky Tower",
    unit: "Unit 1204 - 2BHK",
    date: "22 Feb 2026",
    time: "4:00 PM",
    status: "Scheduled",
    notes: "Client is interested in 2BHK with marina view."
  };

  const isCompleted = visit.status === "Completed";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Title level={2} className="!mb-0">
            Site Visit Details
          </Title>
        </Space>

        <Tag
          color={isCompleted ? "green" : "blue"}
          icon={
            isCompleted
              ? <CheckCircleOutlined />
              : <ClockCircleOutlined />
          }
          className="px-4 py-1 rounded-full text-sm"
        >
          {visit.status}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>

        {/* LEFT SECTION */}
        <Col xs={24} lg={14}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={4}>Visit Information</Title>
            <Divider />

            <Row gutter={[16, 16]}>

              <Col span={12}>
                <Text type="secondary">Project</Text>
                <div className="font-medium text-base">
                  {visit.project}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Unit</Text>
                <div className="font-medium text-base">
                  {visit.unit}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Visit Date</Text>
                <div className="font-medium text-base">
                  {visit.date}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Visit Time</Text>
                <div className="font-medium text-base">
                  {visit.time}
                </div>
              </Col>

            </Row>

            <Divider />

            <Title level={5}>Client Notes</Title>
            <div className="bg-gray-100 p-4 rounded-xl text-gray-700">
              {visit.notes}
            </div>

          </Card>
        </Col>

        {/* RIGHT SECTION */}
        <Col xs={24} lg={10}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={4}>Client Details</Title>
            <Divider />

            <div className="space-y-4">

              <div>
                <Text type="secondary">Client Name</Text><br />
                <Text strong>{visit.client}</Text>
              </div>

              <div>
                <Text type="secondary">Contact Number</Text><br />
                <Text strong>{visit.phone}</Text>
              </div>

            </div>

            <Divider />

            <Button
              type="primary"
              size="large"
              block
              disabled={isCompleted}
              className="rounded-xl h-11"
            >
              {isCompleted
                ? "Visit Completed"
                : "Mark Visit Completed"}
            </Button>

          </Card>
        </Col>

      </Row>

    </div>
  );
}