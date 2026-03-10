import React, { useState, useEffect } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Table,
  Tag,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Input,
  Select,
  Avatar,
  Divider,
  DatePicker,
  TimePicker,
  Form,
  message,
  Badge
} from "antd";

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  EyeOutlined,
  MessageOutlined,
  PropertySafetyOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BellOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [viewModal, setViewModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [requestsListModal, setRequestsListModal] = useState(false); // Naya modal pending requests ke liye
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [form] = Form.useForm();

  // ================= FETCH LEADS =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/agent/lead/get-all-leads");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setLeads(list);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ================= STATUS TAG =================
  const getStatusTag = (status) => {
    const colors = {
      lead: "blue",
      visit: "purple",
      deal: "orange",
      booking: "cyan",
      closed: "green",
      lost: "red"
    };
    return (
      <Tag color={colors[status] || "default"}>
        {status?.toUpperCase() || "UNKNOWN"}
      </Tag>
    );
  };

  // ================= TABLE DATA =================
  const tableData = leads.map((l) => ({
    ...l,
    key: l._id,
    leadName: `${l?.name?.first_name || ""} ${l?.name?.last_name || ""}`,
    email: l?.email,
    phone: l?.phone_number,
    agentName: `${l?.agent?.first_name || ""} ${l?.agent?.last_name || ""}`,
    createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
    
    // YAHAN LOGIC CHANGE KIYA HAI:
    // Agar status "visit" hai aur visit_date abhi tak set nahi hui hai, toh isko pending request maano.
    visit_requested: l?.status === "visit" && !l?.visit_date 
  }));
  // Pending requests filter
  const pendingVisitRequests = tableData.filter((l) => l.visit_requested);

  // ================= HANDLE SCHEDULE SUBMIT =================
  const onScheduleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        visit_date: values.visit_date.format("YYYY-MM-DD"),
        visit_time: values.visit_time.format("HH:mm"),
        status: "visit",
        visit_requested: false // Schedule hone ke baad request false karni hogi taaki list se hat jaye
      };

      await apiService.put(`/agent/lead/update-lead/${selectedLead._id}`, payload);
      
      message.success("Site visit scheduled successfully!");
      setScheduleModal(false);
      form.resetFields();
      
      // Agar main requests list modal open hai, toh fetch hone ke baad wo auto-update ho jayega
      fetchLeads(); 
      
    } catch (error) {
      console.log(error);
      message.error("Failed to schedule site visit.");
    } finally {
      setLoading(false);
    }
  };

  // ================= MAIN TABLE COLUMNS =================
  const columns = [
    {
      title: "Lead Details",
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{r.leadName}</Text>
            <br />
            <Text type="secondary">{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      render: (text) => <Tag color="geekblue">{text}</Tag>
    },
    {
      title: "Property Type",
      render: (record) => (
        <Text strong>
          <CompassOutlined /> {record.property_type || "-"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Date",
      dataIndex: "createdAtFormatted",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLead(record);
            setViewModal(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // ================= REQUESTS LIST MODAL COLUMNS =================
  const requestColumns = [
    {
      title: "Lead Name",
      dataIndex: "leadName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Property",
      dataIndex: "property_type",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CalendarOutlined />}
          onClick={() => {
            setSelectedLead(record);
            setScheduleModal(true);
          }}
        >
          Schedule
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Lead Management</Title>
          <Text type="secondary">
            Track user inquiries, schedule visits, and monitor agent performance.
          </Text>
        </div>
        
        {/* TOP BUTTON WITH BADGE FOR PENDING REQUESTS */}
        <div>
          <Badge count={pendingVisitRequests.length} offset={[-5, 5]}>
            <Button 
              type="primary" 
              icon={<BellOutlined />} 
              size="large"
              onClick={() => setRequestsListModal(true)}
            >
              Visit Requests
            </Button>
          </Badge>
        </div>
      </div>

      {/* PIPELINE STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Leads"
              value={leads.length}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="Site Visits"
              value={leads.filter((l) => l.status === "visit").length}
              prefix={<CompassOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="Deals"
              value={leads.filter((l) => l.status === "deal").length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false}>
            <Statistic
              title="Closed"
              value={leads.filter((l) => l.status === "closed").length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* LEAD TABLE */}
      <Card bordered={false} className="shadow-md">
        <div className="mb-4 flex gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search Lead..."
            style={{ width: 250 }}
          />
          <Select defaultValue="all" style={{ width: 150 }}>
            <Option value="all">All Status</Option>
            <Option value="lead">Lead</Option>
            <Option value="visit">Visit</Option>
            <Option value="deal">Deal</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* MODAL 1: VIEW PENDING VISIT REQUESTS LIST */}
      <Modal
        title={
          <Space>
            <BellOutlined style={{ color: '#faad14' }} />
            Pending Visit Requests
          </Space>
        }
        open={requestsListModal}
        onCancel={() => setRequestsListModal(false)}
        footer={[
          <Button key="close" onClick={() => setRequestsListModal(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        <Table
          columns={requestColumns}
          dataSource={pendingVisitRequests}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>

      {/* MODAL 2: SCHEDULE VISIT MODAL */}
      <Modal
        title={`Schedule Visit for ${selectedLead?.leadName || "Lead"}`}
        open={scheduleModal}
        onCancel={() => setScheduleModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onScheduleSubmit}>
          <Form.Item
            name="visit_date"
            label="Visit Date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="visit_time"
            label="Visit Time"
            rules={[{ required: true, message: "Please select a time!" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={() => setScheduleModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Confirm Schedule
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL 3: VIEW FULL LEAD DETAILS */}
      <Modal
        title="Lead Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Close
          </Button>,
        ]}
        width={650}
      >
        {selectedLead && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Lead Name</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {selectedLead.leadName}
                </Text>
              </Col>
              <Col span={12} className="text-right">
                {getStatusTag(selectedLead.status)}
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">
                  <MailOutlined /> Email
                </Text>
                <br />
                <Text>{selectedLead.email}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  <PhoneOutlined /> Phone
                </Text>
                <br />
                <Text>{selectedLead.phone}</Text>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>
              <PropertySafetyOutlined /> Property & Visit Details
            </Title>

            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Text type="secondary">Property Type:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.property_type}</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Bedrooms:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.bedrooms} BHK</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Budget:</Text>
              </Col>
              <Col span={12}>
                <Text strong>AED {selectedLead.budget}</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Preferred Location:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.preferred_location}</Text>
              </Col>

              {/* Dynamic field for scheduled visits */}
              {selectedLead.visit_date && (
                <>
                  <Col span={12}>
                    <Text type="secondary">Scheduled Visit Date:</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong style={{ color: "green" }}>
                      {selectedLead.visit_date} {selectedLead.visit_time && `at ${selectedLead.visit_time}`}
                    </Text>
                  </Col>
                </>
              )}

              <Col span={12}>
                <Text type="secondary">Source:</Text>
              </Col>
              <Col span={12}>
                <Tag color="blue">{selectedLead.source}</Tag>
              </Col>

              <Col span={12}>
                <Text type="secondary">Created At:</Text>
              </Col>
              <Col span={12}>
                <Text>
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default LeadManagement;