// src/pages/Advisor/VaultAdvisorlist.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Table, Avatar, Tag, Button, Input, Select, Row, Col, Space,
  Typography, message, Spin, Tooltip, Progress, Modal, Form, Popconfirm,
} from "antd";
import {
  UserOutlined, SearchOutlined, PlusOutlined, EyeOutlined,
  StopOutlined, ReloadOutlined, CheckCircleOutlined,
  DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Brand tokens ────────────────────────────────────────────────────────────
const P   = "#5C039B";
const PM  = "#7C3AED";
const PL  = "#F5F0FF";
const GN  = "#22C55E";
const RD  = "#EF4444";
const OR  = "#F97316";   // orange — used for Suspend
// ─────────────────────────────────────────────────────────────────────────────

const VaultMortgagelist = () => {
  const navigate = useNavigate();

  const [advisors, setAdvisors]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [limit]                   = useState(10);

  // Filters
  const [search, setSearch]         = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus]         = useState("");

  // ── Suspend modal state ──────────────────────────────────────────────────
  const [suspendModal, setSuspendModal]     = useState(false);
  const [suspendTarget, setSuspendTarget]   = useState(null);   // { id, name }
  const [suspendReason, setSuspendReason]   = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);

  // ── Action loading map (key = advisorId, value = true while busy) ────────
  const [actionLoading, setActionLoading] = useState({});

  // ─────────────────────────────────────────────────────────────────────────

  const fetchAdvisors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/vault/ops/all", {
        params: { page, limit, search, department, status },
      });
      const data = res?.data?.data || res?.data || [];
      setAdvisors(Array.isArray(data) ? data : data?.advisors || []);
      setTotal(res?.data?.total || data?.total || 0);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to load advisors");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, department, status]);

  useEffect(() => {
    fetchAdvisors();
  }, [fetchAdvisors]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setOne = (id, val) =>
    setActionLoading((prev) => ({ ...prev, [id]: val }));

  const fullName = (r) => `${r.first_name || ""} ${r.last_name || ""}`.trim();

  // ── Open suspend modal ────────────────────────────────────────────────────
  const openSuspend = (record) => {
    setSuspendTarget({ id: record._id || record.id, name: fullName(record) });
    setSuspendReason("");
    setSuspendModal(true);
  };

  // ── Confirm suspend ───────────────────────────────────────────────────────
  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspendLoading(true);
    try {
      await apiService.post(`/vault/ops/suspend/${suspendTarget.id}`, {
        suspensionReason: suspendReason.trim(),
      });
      message.success(`Advisor "${suspendTarget.name}" suspended`);
      setSuspendModal(false);
      fetchAdvisors();
    } catch (err) {
      message.error(err?.response?.data?.message || "Suspension failed");
    } finally {
      setSuspendLoading(false);
    }
  };

  // ── Activate ──────────────────────────────────────────────────────────────
  const handleActivate = async (record) => {
    const id   = record._id || record.id;
    const name = fullName(record);
    setOne(id, true);
    try {
      await apiService.post(`/vault/ops/activate/${id}`);
      message.success(`Advisor "${name}" activated`);
      fetchAdvisors();
    } catch (err) {
      message.error(err?.response?.data?.message || "Activation failed");
    } finally {
      setOne(id, false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (record) => {
    const id   = record._id || record.id;
    const name = fullName(record);
    setOne(id, true);
    try {
      await apiService.delete(`/vault/ops/delete/${id}`);
      message.success(`Advisor "${name}" deleted`);
      fetchAdvisors();
    } catch (err) {
      message.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setOne(id, false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Advisor",
      dataIndex: "first_name",
      key: "name",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            src={record.profilePic}
            icon={<UserOutlined />}
            style={{ background: `linear-gradient(135deg, ${P}, ${PM})` }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#1a0533" }}>
              {record.first_name} {record.last_name}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ID: {record._id?.slice(-6) || "—"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 13, marginBottom: 2 }}>{record.email}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.country_code} {record.phone_number}
          </Text>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept) => dept || <Text type="secondary">—</Text>,
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      render: (desig) => desig || <Text type="secondary">—</Text>,
    },
    {
      title: "Leads Capacity",
      key: "capacity",
      render: (_, record) => {
        const current = record.currentLeads || 0;
        const max     = record.maxLeadsCapacity || 0;
        const percent = max ? Math.min((current / max) * 100, 100) : 0;
        return (
          <div>
            <div style={{ fontWeight: 600, color: P }}>
              {current} / {max || "—"}
            </div>
            {max > 0 && (
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor={P}
                trailColor="#ede4ff"
                style={{ width: 60 }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive, record) => {
        if (record.isSuspended) {
          return (
            <Tag color="warning" style={{ borderRadius: 20, fontWeight: 600 }}>
              Suspended
            </Tag>
          );
        }
        return (
          <Tag
            color={isActive !== false ? "success" : "error"}
            style={{ borderRadius: 20, fontWeight: 600 }}
          >
            {isActive !== false ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => {
        const id      = record._id || record.id;
        const busy    = actionLoading[id];
        const active  = record.isActive !== false;
        const suspended = record.isSuspended;

        return (
          <Space size={4}>
            {/* ── View ── */}
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/dashboard/vault/mortgage/${id}`)}
                style={{ color: P }}
              />
            </Tooltip>

            {/* ── Suspend  (only when active & not already suspended) ── */}
            {active && !suspended && (
              <Tooltip title="Suspend Advisor">
                <Button
                  type="text"
                  size="small"
                  loading={busy}
                  icon={<PauseCircleOutlined />}
                  onClick={() => openSuspend(record)}
                  style={{ color: OR }}
                />
              </Tooltip>
            )}

            {/* ── Activate  (when inactive OR suspended) ── */}
            {(!active || suspended) && (
              <Tooltip title="Activate Advisor">
                <Button
                  type="text"
                  size="small"
                  loading={busy}
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleActivate(record)}
                  style={{ color: GN }}
                />
              </Tooltip>
            )}

            {/* ── Delete ── */}
            <Popconfirm
              title="Delete Advisor"
              description={
                <span>
                  Permanently delete <strong>{fullName(record)}</strong>?
                  <br />
                  This action <strong>cannot be undone</strong>.
                </span>
              }
              icon={<ExclamationCircleOutlined style={{ color: RD }} />}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: busy }}
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Delete Advisor">
                <Button
                  type="text"
                  size="small"
                  loading={busy}
                  icon={<DeleteOutlined />}
                  style={{ color: RD }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const DEPARTMENTS = [
    "Mortgage Advisory", "Sales", "Operations",
    "Compliance", "Customer Service",
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`
        .vpp .ant-input,
        .vpp .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
        }
        .vpp .ant-input:focus,
        .vpp .ant-select-focused .ant-select-selector {
          border-color: ${P} !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important;
        }
        .vpp .ant-table { background: transparent; }
        .vpp .ant-table-thead > tr > th {
          background: #faf8ff !important;
          color: ${P} !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #ede4ff !important;
        }
        .vpp .ant-table-tbody > tr:hover > td { background: #f5f0ff !important; }
        .vpp .ant-pagination-item-active { border-color: ${P} !important; }
        .vpp .ant-pagination-item-active a { color: ${P} !important; }
      `}</style>

      <div className="vpp">
        {/* ── Page Header ── */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ color: "#1a0533", fontWeight: 800, margin: 0 }}>
              All Mortgage Ops
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {total} advisor{total !== 1 ? "s" : ""} found
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/advisor/create")}
              style={{
                background: `linear-gradient(135deg, ${P}, ${PM})`,
                border: "none",
                borderRadius: 30,
                fontWeight: 600,
                height: 40,
                padding: "0 24px",
              }}
            >
              Create Advisor
            </Button>
          </Col>
        </Row>

        {/* ── Filters Card ── */}
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(92,3,155,0.06)",
            border: "1px solid #f0e8ff",
            marginBottom: 24,
          }}
          bodyStyle={{ padding: "16px 20px" }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by name or email"
                prefix={<SearchOutlined style={{ color: P }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={5}>
              <Select
                placeholder="Department"
                value={department || undefined}
                onChange={setDepartment}
                allowClear
                style={{ width: "100%" }}
              >
                {DEPARTMENTS.map((d) => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Status"
                value={status || undefined}
                onChange={setStatus}
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setStatus("");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ── Table Card ── */}
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(92,3,155,0.06)",
            border: "1px solid #f0e8ff",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={advisors}
            rowKey={(record) => record._id || record.id}
            loading={loading}
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} advisors`,
              style: { padding: "16px 24px" },
            }}
            scroll={{ x: 1100 }}
          />
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Suspend Modal
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        open={suspendModal}
        onCancel={() => !suspendLoading && setSuspendModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PauseCircleOutlined style={{ color: OR, fontSize: 20 }} />
            <span style={{ color: "#1a0533", fontWeight: 700 }}>
              Suspend Advisor
            </span>
          </div>
        }
        footer={[
          <Button
            key="cancel"
            onClick={() => setSuspendModal(false)}
            disabled={suspendLoading}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={suspendLoading}
            onClick={handleSuspend}
            icon={<PauseCircleOutlined />}
          >
            Confirm Suspension
          </Button>,
        ]}
        centered
        width={480}
        styles={{
          header: { borderBottom: "1px solid #f0e8ff", paddingBottom: 12 },
          body: { paddingTop: 20 },
        }}
      >
        <div
          style={{
            background: "#fff8f0",
            border: "1px solid #fed7aa",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 18,
            fontSize: 13,
            color: "#92400e",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <ExclamationCircleOutlined style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            You are about to suspend{" "}
            <strong>{suspendTarget?.name}</strong>. They will lose access
            until reactivated.
          </span>
        </div>

        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#1a0533",
            marginBottom: 6,
            fontSize: 13,
          }}
        >
          Suspension Reason{" "}
          <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
        </label>
        <TextArea
          rows={3}
          placeholder="e.g. Under compliance review, awaiting documentation…"
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          maxLength={300}
          showCount
          style={{ borderRadius: 10 }}
        />
      </Modal>
    </div>
  );
};

export default VaultMortgagelist;