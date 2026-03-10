import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Divider,
  Space,
  Spin,
  Descriptions,
  message
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; // Apne path ke hisaab se adjust kar lena
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function AgentSiteVisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ================= 1. FETCH SITE VISIT DETAILS =================
 // ================= 1. FETCH SITE VISIT DETAILS =================
  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      
      // DHYAN DEIN: Agar backend mein route ka naam alag hai, toh yahan change karein
      // Jaise ki: /agent/lead/get-site-visit/${id}
      const res = await apiService.get(`/agent/lead/site-visit/${id}`); 
      
      // 1. Console lagao taaki browser console me dikhe ki data kya aa raha hai
      console.log("Single Visit API Response:", res); 

      // 2. Data ko safe tarike se extract karo
      // Agar axois standard response hai toh res.data.data chalega
      // Agar custom interceptor hai toh res.data chalega
      const fetchedVisit = res?.data?.data || res?.data || res;

      if (!fetchedVisit) {
        message.warning("No data found in API response.");
      }

      setVisit(fetchedVisit);
      
    } catch (error) {
      console.error("Fetch Visit Error:", error);
      message.error("Failed to load site visit details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchVisitDetails();
    }
  }, [id]);

  // ================= 2. MARK AS COMPLETED =================
  const handleMarkCompleted = async () => {
    try {
      setActionLoading(true);
      // Backend mein status update karne ka route
      await apiService.post(`/agent/lead/update-site-visit/${id}`, {
        status: "completed"
      });
      message.success("Site visit marked as completed!");
      fetchVisitDetails(); // Refresh data
    } catch (error) {
      console.error(error);
      message.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Loading Visit Details..." />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <Title level={4}>Visit not found</Title>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const isCompleted = visit.status?.toLowerCase() === "completed";
  const isScheduled = visit.status?.toLowerCase() === "scheduled";

  // Status Badge Helper
  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case "requested": return <Tag color="orange" icon={<ClockCircleOutlined />}>Requested</Tag>;
      case "scheduled": return <Tag color="blue" icon={<CalendarOutlined />}>Scheduled</Tag>;
      case "completed": return <Tag color="green" icon={<CheckCircleOutlined />}>Completed</Tag>;
      case "cancelled": return <Tag color="red">Cancelled</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  return (
    <div className="p-8 bg-[#f6f7fb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="border-none shadow-sm"
          >
            Back
          </Button>

          <Title level={3} className="!mb-0 ml-2">
            Site Visit Details
          </Title>
        </Space>

        <div className="text-lg">
          {getStatusTag(visit.status)}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT SECTION - Visit & Property Data */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-2xl mb-6">
            <Title level={4} className="!mb-4">Schedule & Property Info</Title>
            <Divider className="my-3" />

            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered size="middle">
              <Descriptions.Item label="Property Name">
                <Text strong className="text-blue-600">{visit?.property?.propertyName || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Developer">
                {visit?.developer?.name || visit?.developer || "N/A"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Requested Date">
                {visit?.requestedDate ? dayjs(visit.requestedDate).format("DD MMM YYYY") : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Requested Time">
                {visit?.visitTime || "N/A"}
              </Descriptions.Item>

              {/* Agar admin ne schedule approve kar diya ho to dikhao */}
              {visit?.scheduledDate && (
                <Descriptions.Item label="Confirmed Scheduled Date" span={2}>
                  <Text type="success" strong>
                    {dayjs(visit.scheduledDate).format("DD MMM YYYY, hh:mm A")}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Lead/Requirement Details */}
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <Title level={4} className="!mb-4">Lead Requirements</Title>
            <Divider className="my-3" />
            
            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
              <Descriptions.Item label="Property Type">{visit?.lead?.property_type || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Bedrooms">{visit?.lead?.bedrooms ? `${visit.lead.bedrooms} BHK` : "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Budget">{visit?.lead?.budget ? `${visit.lead.budget.toLocaleString()} AED` : "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Preferred Location">{visit?.lead?.preferred_location || "N/A"}</Descriptions.Item>
            </Descriptions>

            {visit?.lead?.requirement_description && (
              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Text type="secondary" className="block mb-1">Additional AI/Client Notes</Text>
                <Text>{visit.lead.requirement_description}</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* RIGHT SECTION - Client Details & Actions */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-2xl mb-6">
            <Title level={4} className="!mb-4">Client Contact</Title>
            <Divider className="my-3" />

            <div className="space-y-4">
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider">Client Name</Text><br />
                <Text strong className="text-base">{visit?.clientName}</Text>
              </div>

              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider">Contact Number</Text><br />
                <Text strong className="text-base">{visit?.clientPhone}</Text>
              </div>

              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider">Email (Lead Profile)</Text><br />
                <Text>{visit?.lead?.email || "Not Provided"}</Text>
              </div>
            </div>
          </Card>

         {/* Action Card */}
          <Card bordered={false} className="shadow-sm rounded-2xl bg-blue-50/50">
            <Title level={5} className="!mb-4">Actions</Title>
            
            <Button
              type="primary"
              size="large"
              block
              // Button tabhi enable hoga jab status "scheduled" ho.
              // Agar "requested" ya "completed" hai, toh disable rahega.
              disabled={isCompleted || !isScheduled} 
              loading={actionLoading}
              onClick={handleMarkCompleted}
              className={`rounded-xl h-12 font-medium ${
                isCompleted 
                  ? 'bg-green-500 hover:!bg-green-500' // Completed hone par green
                  : !isScheduled 
                    ? 'bg-gray-400 cursor-not-allowed' // Scheduled nahi hai toh grey
                    : 'bg-[#7c3aed]' // Scheduled hai toh purple (actionable)
              }`}
            >
              {isCompleted ? "Visit Completed" : "Mark Visit Completed"}
            </Button>
            
            {/* Messages based on Status */}
            {visit?.status?.toLowerCase() === "requested" && (
              <Text type="danger" className="block text-center mt-3 text-xs font-medium">
                Waiting for Admin to schedule this visit. You can mark it complete once it's scheduled.
              </Text>
            )}

            {isScheduled && (
              <Text type="secondary" className="block text-center mt-3 text-xs">
                Marking this as complete will record the visit in the client's timeline.
              </Text>
            )}
          </Card>
        </Col>

      </Row>
    </div>
  );
}