import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Modal,
  Button,
  Tag,
  Image,
  Divider,
  Input
} from "antd";

import {
  EyeOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  BankOutlined,
  HomeOutlined
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const THEME = { primary: "#7c3aed", success: "#10b981" };

const AdminPropertyList = () => {

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [searchText, setSearchText] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // NEW STATES
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // ================= FETCH PROPERTIES =================

  const fetchAllProperties = useCallback(async (page, limit, search) => {

    setLoading(true);

    try {

      const resData = await apiService.get("/property/get-all-properties", {
        page,
        limit,
        search: search || undefined,
        admin: true
      });

      const list = resData?.data || resData || [];

      setProperties(Array.isArray(list) ? list : []);
      setTotal(resData?.pagination?.total || list.length);

    } catch (err) {

      message.error("Failed to load properties list.");

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    const timer = setTimeout(() => {
      fetchAllProperties(currentPage, pageSize, searchText);
    }, 500);

    return () => clearTimeout(timer);

  }, [searchText, currentPage, pageSize, fetchAllProperties]);

  // ================= UPDATE STATUS =================

  const updateStatus = async (id, status, reason = "") => {

    try {

      await apiService.put(`/property/update-status/${id}`, {
        status,
        reason
      });

      message.success(`Property ${status}`);

      fetchAllProperties(currentPage, pageSize, searchText);

    } catch (error) {

      console.log(error);

      message.error("Status update failed");

    }

  };

  const openModal = (record) => {
    setSelectedProperty(record);
    setViewModal(true);
  };

  // ================= TABLE COLUMNS =================

  const columns = [

    {
      title: "Image",
      width: 100,
      render: (_, r) => (
        <Image
          width={80}
          height={60}
          src={r.photos?.[0] || r.mainLogo}
          fallback="https://via.placeholder.com/80"
          preview={false}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      )
    },

    {
      title: "Property",
      render: (_, r) => (
        <div>
          <Text strong>{r.propertyName}</Text>
          <br />
          <Text type="secondary">
            <BankOutlined /> {r.developer?.name || "No Developer"}
          </Text>
        </div>
      )
    },

    {
      title: "Price",
      render: (_, r) => (
        <Text strong style={{ color: THEME.primary }}>
          {r.currency} {r.price_min?.toLocaleString()} - {r.price_max?.toLocaleString()}
        </Text>
      )
    },

    {
      title: "Location",
      render: (_, r) => (
        <Text type="secondary">
          <EnvironmentOutlined /> {r.area}, {r.city}
        </Text>
      )
    },

    {
      title: "Approval Status",
      render: (_, r) => {

        if (r.approvalStatus === "approved")
          return <Tag color="green">Approved</Tag>;

        if (r.approvalStatus === "rejected")
          return <Tag color="red">Rejected</Tag>;

        return <Tag color="orange">Pending</Tag>;
      }
    },

    {
      title: "Action",
      width: 180,
      render: (_, record) => (

        <Space direction="vertical" size="small" style={{ width: "100%" }}>

          {record.approvalStatus === "pending" && (

            <Space>

              <Button
                type="primary"
                size="small"
                style={{ background: "#10b981", borderColor: "#10b981" }}
                onClick={() => updateStatus(record._id, "approved")}
              >
                Approve
              </Button>

              <Button
                danger
                size="small"
                onClick={() => {
                  setSelectedId(record._id);
                  setRejectModal(true);
                }}
              >
                Reject
              </Button>

            </Space>

          )}

          <Button
            icon={<EyeOutlined />}
            size="small"
            block
            onClick={() => openModal(record)}
          >
            View
          </Button>

        </Space>

      )
    }

  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">

      <Row gutter={[16, 16]} className="mb-6">

        <Col xs={24} sm={16}>
          <Title level={3}>Property Approval Requests</Title>
          <Text type="secondary">
            Review and approve developer submitted properties
          </Text>
        </Col>

        <Col xs={24} sm={8} className="sm:text-right">
          <Statistic title="Total Requests" value={total} prefix={<HomeOutlined />} />
        </Col>

      </Row>

      <Card className="mb-6">

        <Input
          prefix={<SearchOutlined />}
          placeholder="Search property..."
          size="large"
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />

      </Card>

      <Card>

        <Table
          columns={columns}
          dataSource={properties}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            onChange: (p) => setCurrentPage(p),
            responsive: true
          }}
        />

      </Card>

      {/* VIEW MODAL */}

      <Modal
        title="Property Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={900}
      >

        {selectedProperty && (

          <>
            <Image.PreviewGroup>

              <Row gutter={[12, 12]}>

                {selectedProperty.photos?.map((img, i) => (
                  <Col xs={12} sm={8} md={6} key={i}>
                    <Image src={img} style={{ borderRadius: 8 }} />
                  </Col>
                ))}

              </Row>

            </Image.PreviewGroup>

            <Divider />

            <Title level={4}>{selectedProperty.propertyName}</Title>

            <Paragraph>
              {selectedProperty.description || "No description provided"}
            </Paragraph>

            <Text strong>
              Price: {selectedProperty.currency} {selectedProperty.price_min}
            </Text>

            <br />

            <Text>
              Location: {selectedProperty.area}, {selectedProperty.city}
            </Text>

            <br />

            <Text>
              Handover: {selectedProperty.handover
                ? dayjs(selectedProperty.handover).format("MMM YYYY")
                : "Ready"}
            </Text>

          </>

        )}

      </Modal>

      {/* REJECT MODAL */}

      {/* VIEW MODAL */}

<Modal
  title="Property Details"
  open={viewModal}
  onCancel={() => setViewModal(false)}
>
....
</Modal>


{/* REJECT MODAL */}
<Modal
  title="Reject Property"
  open={rejectModal}
  onCancel={() => setRejectModal(false)}
  onOk={() => {
    updateStatus(selectedId, "rejected", rejectReason);
    setRejectModal(false);
    setRejectReason("");
  }}
>
  <Input.TextArea
    rows={4}
    placeholder="Enter rejection reason"
    value={rejectReason}
    onChange={(e) => setRejectReason(e.target.value)}
  />
</Modal>

    </div>
  );

};

export default AdminPropertyList;