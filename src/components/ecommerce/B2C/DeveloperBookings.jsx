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
  Button,
  Modal,
  Avatar,
  Divider,
  DatePicker,
  TimePicker,
  Form,
  message
} from "antd";

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  PropertySafetyOutlined,
  CompassOutlined,
  CalendarOutlined,
  BellOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DeveloperBookings = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [viewModal, setViewModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  
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

  // ================= FILTER PENDING REQUESTS =================
  // Sirf wo leads jinka status "visit" hai aur visit_date abhi tak assign nahi hui hai
  const pendingVisitRequests = leads
    .filter((l) => l?.status === "visit" && !l?.visit_date)
    .map((l) => ({
      ...l,
      key: l._id,
      leadName: `${l?.name?.first_name || ""} ${l?.name?.last_name || ""}`,
      email: l?.email,
      phone: l?.phone_number,
      agentName: `${l?.agent?.first_name || ""} ${l?.agent?.last_name || ""}`,
    }));

  // ================= HANDLE SCHEDULE SUBMIT =================
  const onScheduleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        visit_date: values.visit_date.format("YYYY-MM-DD"),
        visit_time: values.visit_time.format("HH:mm"),
        status: "visit",
      };

      await apiService.put(`/agent/lead/update-lead/${selectedLead._id}`, payload);
      
      message.success("Site visit scheduled successfully!");
      setScheduleModal(false);
      form.resetFields();
      
      // List ko refresh karne ke liye taaki schedule hui request hat jaye
      fetchLeads(); 
      
    } catch (error) {
      console.log(error);
      message.error("Failed to schedule site visit.");
    } finally {
      setLoading(false);
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Client Details",
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Text strong>{r.leadName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (text) => <Text><PhoneOutlined className="mr-1 text-gray-400"/> {text}</Text>
    },
    {
      title: "Property Type",
      render: (record) => (
        <Text strong>
          <CompassOutlined className="text-purple-500 mr-1"/> {record.property_type || "-"}
        </Text>
      ),
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      render: (text) => <Tag color="geekblue">{text}</Tag>
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLead(record);
              setViewModal(true);
            }}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CalendarOutlined />}
            style={{ background: "#faad14", borderColor: "#faad14" }}
            onClick={() => {
              setSelectedLead(record);
              setScheduleModal(true);
            }}
          >
            Schedule
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <BellOutlined className="mr-2 text-yellow-500" /> 
            Pending Visit Requests
          </Title>
          <Text type="secondary">
            Manage and schedule upcoming site visits requested by agents.
          </Text>
        </div>
        <Tag color="orange" className="text-lg py-1 px-3 rounded-full">
          Total Pending: {pendingVisitRequests.length}
        </Tag>
      </div>

      {/* REQUESTS TABLE */}
      <Card bordered={false} className="shadow-md rounded-xl">
        <Table
          columns={columns}
          dataSource={pendingVisitRequests}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL 1: SCHEDULE VISIT MODAL */}
      <Modal
        title={`Schedule Visit for ${selectedLead?.leadName || "Client"}`}
        open={scheduleModal}
        onCancel={() => setScheduleModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onScheduleSubmit} className="mt-4">
          <Form.Item
            name="visit_date"
            label="Visit Date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker style={{ width: "100%" }} size="large" />
          </Form.Item>

          <Form.Item
            name="visit_time"
            label="Visit Time"
            rules={[{ required: true, message: "Please select a time!" }]}
          >
            <TimePicker format="hh:mm A" use12Hours style={{ width: "100%" }} size="large" />
          </Form.Item>

          <Form.Item className="text-right mb-0 mt-6">
            <Space>
              <Button onClick={() => setScheduleModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: "#faad14", borderColor: "#faad14" }}>
                Confirm Schedule
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL 2: VIEW FULL REQUEST DETAILS */}
      <Modal
        title="Visit Request Details"
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
          <div className="mt-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Client Name</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {selectedLead.leadName}
                </Text>
              </Col>
              <Col span={12} className="text-right">
                <Tag color="orange">PENDING SCHEDULE</Tag>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">
                  <MailOutlined className="mr-1" /> Email
                </Text>
                <br />
                <Text>{selectedLead.email || "N/A"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  <PhoneOutlined className="mr-1" /> Phone
                </Text>
                <br />
                <Text>{selectedLead.phone || "N/A"}</Text>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>
              <PropertySafetyOutlined className="mr-2" /> Property Preferences
            </Title>

            <Row gutter={[8, 16]} className="mt-3 bg-gray-50 p-4 rounded-lg">
              <Col span={12}>
                <Text type="secondary">Property Type:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.property_type || "N/A"}</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Bedrooms:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.bedrooms ? `${selectedLead.bedrooms} BHK` : "N/A"}</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Budget:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.budget ? `AED ${selectedLead.budget}` : "N/A"}</Text>
              </Col>

              <Col span={12}>
                <Text type="secondary">Preferred Location:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{selectedLead.preferred_location || "N/A"}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DeveloperBookings;