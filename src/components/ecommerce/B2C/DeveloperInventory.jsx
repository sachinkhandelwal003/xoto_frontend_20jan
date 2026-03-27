import React, { useEffect, useState, useCallback } from "react";
import {
  Card, Typography, Tag, Button, Row, Col,
  Select, Input, Upload, message, Space, Popconfirm,
  Modal, Form, InputNumber, Divider, Switch, Empty, Spin, Pagination
} from "antd";
import {
  SearchOutlined, UploadOutlined, FileAddOutlined,
  EditOutlined, ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const UNIT_TYPES    = ["apartment","villa","townhouse","duplex","penthouse"];
const BEDROOM_TYPES = ["studio","1bed","2bed","3bed","4bed","5bed","6bed","7bed","8plus"];
const VIEW_TYPES    = ["sea","city","garden","landmark","pool","park"];
const FURNISHING    = ["furnished","semi_furnished","unfurnished"];
const AREA_UNITS    = ["sqft","sqm"];
const CURRENCIES    = ["AED","USD","EUR"];

const STATUS_CONFIG = {
  available: { color: "#27500A", bg: "#EAF3DE", label: "Available" },
  reserved:  { color: "#3C3489", bg: "#EEEDFE", label: "Reserved"  },
  booked:    { color: "#633806", bg: "#FAEEDA", label: "Booked"    },
  sold:      { color: "#0C447C", bg: "#E6F1FB", label: "Sold"      },
};

const toLabel = (str) =>
  str ? str.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase()) : "—";

const fmt = (n, currency = "") =>
  n ? `${currency} ${Number(n).toLocaleString()}`.trim() : "—";

// ── Vertical field row inside a card ────────────────────────
const Field = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "5px 0",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  }}>
    <Text style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", textAlign: "right", maxWidth: "60%" }}>
      {value || "—"}
    </Text>
  </div>
);

// ── Single inventory card ────────────────────────────────────
const InventoryCard = ({ unit, onEdit, onAction, onView }) => {
  const sc     = STATUS_CONFIG[unit.status] || STATUS_CONFIG.available;
  const status = unit.status?.toLowerCase();

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}>
        <div>
          <Text style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", display: "block" }}>
            {unit.unitNumber}
          </Text>
          <Text style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {[unit.buildingName, unit.floorNumber != null && `Floor ${unit.floorNumber}`]
              .filter(Boolean).join(" · ") || "—"}
          </Text>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: "3px 10px",
          borderRadius: 20, background: sc.bg, color: sc.color,
        }}>
          {sc.label}
        </span>
      </div>

      {/* Body — all fields vertical */}
      <div style={{ padding: "10px 16px" }}>
        <Field label="Unit type"     value={toLabel(unit.unitType)} />
        <Field label="Bedroom"       value={toLabel(unit.bedroomType)} />
        <Field label="Bathrooms"     value={unit.bathrooms} />
        <Field label="Area"          value={unit.area ? `${Number(unit.area).toLocaleString()} ${unit.areaUnit || "sqft"}` : "—"} />
        <Field label="Price"
          value={
            <span style={{ color: "#6d28d9", fontWeight: 500 }}>
              {fmt(unit.price, unit.currency || "AED")}
            </span>
          }
        />
        <Field label="View"
          value={unit.viewType?.length
            ? unit.viewType.map(v => toLabel(v)).join(", ")
            : "—"}
        />
        <Field label="Furnishing"    value={toLabel(unit.furnishing)} />
        <Field label="Parking"       value={unit.parkingSpaces ?? "—"} />

        {unit.downPayment > 0 && (
          <Field label="Down payment" value={fmt(unit.downPayment, unit.currency)} />
        )}
        {unit.paymentPlan && (
          <Field label="Payment plan" value={unit.paymentPlan} />
        )}
        {unit.commissionAmount > 0 && (
          <Field label="Commission"   value={fmt(unit.commissionAmount, unit.currency)} />
        )}

        {/* Status-specific date fields */}
        {unit.reservedAt && (
          <Field label="Reserved on"
            value={new Date(unit.reservedAt).toLocaleDateString("en-AE", { day:"2-digit", month:"short", year:"numeric" })} />
        )}
        {unit.bookedAt && (
          <Field label="Booked on"
            value={new Date(unit.bookedAt).toLocaleDateString("en-AE", { day:"2-digit", month:"short", year:"numeric" })} />
        )}
        {unit.soldAt && (
          <Field label="Sold on"
            value={new Date(unit.soldAt).toLocaleDateString("en-AE", { day:"2-digit", month:"short", year:"numeric" })} />
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "10px 16px",
        display: "flex", gap: 8,
        borderTop: "0.5px solid var(--color-border-tertiary)",
      }}>
        <button
          onClick={() => onEdit(unit)}
          style={{
            flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
          }}
        >
          Edit
        </button>

        {status === "available" && (
          <>
            <button
              onClick={() => onAction(unit.key, "reserve", "Unit reserved")}
              style={{
                flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
                borderRadius: "var(--border-radius-md)",
                background: "#6d28d9", color: "#fff", border: "none",
              }}
            >
              Reserve
            </button>
            <Popconfirm title="Delete this unit?" onConfirm={() => onAction(unit.key, "delete")}>
              <button style={{
                flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
                color: "var(--color-text-danger)",
              }}>
                Delete
              </button>
            </Popconfirm>
          </>
        )}

        {status === "reserved" && (
          <>
            <button
              onClick={() => onAction(unit.key, "book", "Unit booked")}
              style={{
                flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
                borderRadius: "var(--border-radius-md)",
                background: "#6d28d9", color: "#fff", border: "none",
              }}
            >
              Book
            </button>
            <button
              onClick={() => onAction(unit.key, "release", "Unit released")}
              style={{
                flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent", color: "var(--color-text-danger)",
              }}
            >
              Release
            </button>
          </>
        )}

        {(status === "booked" || status === "sold") && (
          <button
            onClick={() => onView(unit.key)}
            style={{
              flex: 1, fontSize: 12, padding: "6px 0", cursor: "pointer",
              borderRadius: "var(--border-radius-md)",
              background: "#6d28d9", color: "#fff", border: "none",
            }}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

// ── Shared form fields ───────────────────────────────────────
const InventoryFormFields = ({ isEdit = false, selectedUnit = null }) => (
  <>
    <Divider orientation="left" style={{ fontSize: 13 }}>Unit Identity</Divider>
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item name="unitNumber" label="Unit Number" rules={[{ required: true }]}>
          <Input placeholder="e.g. T1-1001" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="buildingName" label="Building Name">
          <Input placeholder="e.g. Tower A" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="floorNumber" label="Floor Number">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Divider orientation="left" style={{ fontSize: 13 }}>Unit Type</Divider>
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
          <Select placeholder="Select">
            {UNIT_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="bedroomType" label="Bedroom Type" rules={[{ required: true }]}>
          <Select placeholder="Select">
            {BEDROOM_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={4}>
        <Form.Item name="bedrooms" label="Bedrooms">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={4}>
        <Form.Item name="bathrooms" label="Bathrooms">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Divider orientation="left" style={{ fontSize: 13 }}>Dimensions & Price</Divider>
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item name="area" label="Area" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={4}>
        <Form.Item name="areaUnit" label="Unit" initialValue="sqft">
          <Select>{AREA_UNITS.map(u => <Option key={u} value={u}>{u}</Option>)}</Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }}
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={v => v.replace(/,/g, "")} />
        </Form.Item>
      </Col>
      <Col xs={24} md={4}>
        <Form.Item name="currency" label="Currency" initialValue="AED">
          <Select>{CURRENCIES.map(c => <Option key={c} value={c}>{c}</Option>)}</Select>
        </Form.Item>
      </Col>
    </Row>

    <Divider orientation="left" style={{ fontSize: 13 }}>View & Features</Divider>
    <Row gutter={16}>
      <Col xs={24} md={4}>
        <Form.Item name="hasView" label="Has View" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="viewType" label="View Types">
          <Select mode="multiple" placeholder="Select view types" allowClear>
            {VIEW_TYPES.map(v => <Option key={v} value={v}>{toLabel(v)}</Option>)}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={4}>
        <Form.Item name="parkingSpaces" label="Parking">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="furnishing" label="Furnishing" initialValue="unfurnished">
          <Select>{FURNISHING.map(f => <Option key={f} value={f}>{toLabel(f)}</Option>)}</Select>
        </Form.Item>
      </Col>
    </Row>

    <Divider orientation="left" style={{ fontSize: 13 }}>Payment</Divider>
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item name="paymentPlan" label="Payment Plan">
          <Input placeholder="e.g. 50/50" />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="downPayment" label="Down Payment">
          <InputNumber min={0} style={{ width: "100%" }}
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={v => v.replace(/,/g, "")} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="commissionAmount" label="Commission Amount">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    {isEdit && (
      <>
        <Divider orientation="left" style={{ fontSize: 13 }}>Status</Divider>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="status" label="Unit Status">
              <Select>
                {["available","reserved","booked"].map(s => (
                  <Option key={s} value={s}>{toLabel(s)}</Option>
                ))}
                <Option value="sold" disabled={selectedUnit?.status !== "booked"}>Sold</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    )}
  </>
);

// ── Main component ───────────────────────────────────────────
export default function DeveloperInventory() {
  const navigate = useNavigate();

  const [projects, setProjects]             = useState([]);
  const [projectId, setProjectId]           = useState(
    () => localStorage.getItem("selectedProject") || null
  );
  const [units, setUnits]                   = useState([]);
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(false);
  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState(null);
  const [unitTypeFilter, setUnitTypeFilter] = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [pageSize]                          = useState(12);
  const [totalItems, setTotalItems]         = useState(0);
  const [createModal, setCreateModal]       = useState(false);
  const [editModal, setEditModal]           = useState(false);
  const [selectedUnit, setSelectedUnit]     = useState(null);
  const [createForm]                        = Form.useForm();
  const [editForm]                          = Form.useForm();
  const [saving, setSaving]                 = useState(false);

  // ── Fetch projects ─────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      const res  = await apiService.get("/properties/developer/property/offplan");
      const list = res?.data || [];
      const opts = (Array.isArray(list) ? list : [])
        .filter(p => p.approvalStatus === "approved")
        .map(p => ({ label: p.propertyName, value: p._id }));
      setProjects(opts);
      if (opts.length > 0 && !projectId) setProjectId(opts[0].value);
    } catch (err) {
      console.error(err);
      message.error("Failed to load projects");
    }
  }, []);

  // ── Fetch inventory ────────────────────────────────────────
  const fetchInventory = useCallback(async (pid, page = 1, limit = 12) => {
    if (!pid || pid === "new") return;
    setLoading(true);
    try {
      let url = `/properties/developer/inventory/${pid}?page=${page}&limit=${limit}`;
      if (statusFilter)   url += `&status=${statusFilter}`;
      if (unitTypeFilter) url += `&unitType=${unitTypeFilter}`;

      const res  = await apiService.get(url);
      const raw  = res?.data || [];
      const list = (Array.isArray(raw) ? raw : raw.units || []).map(item => ({
        key:              item._id,
        _id:              item._id,
        unitNumber:       item.unitNumber,
        buildingName:     item.buildingName,
        floorNumber:      item.floorNumber,
        unitType:         item.unitType,
        bedroomType:      item.bedroomType,
        bedrooms:         item.bedrooms,
        bathrooms:        item.bathrooms,
        area:             item.area,
        areaUnit:         item.areaUnit         || "sqft",
        price:            item.price,
        currency:         item.currency         || "AED",
        hasView:          item.hasView          || false,
        viewType:         item.viewType         || [],
        parkingSpaces:    item.parkingSpaces    || 0,
        furnishing:       item.furnishing       || "unfurnished",
        status:           item.status,
        paymentPlan:      item.paymentPlan      || "",
        downPayment:      item.downPayment      || 0,
        commissionAmount: item.commissionAmount || 0,
        bookedAt:         item.bookedAt,
        reservedAt:       item.reservedAt,
        soldAt:           item.soldAt,
      }));

      setUnits(list);
      setStats(res?.counts || res?.stats || null);
      setTotalItems(res?.pagination?.totalItems || list.length);
      setCurrentPage(res?.pagination?.currentPage || page);
    } catch (err) {
      console.error(err);
      message.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, unitTypeFilter]);

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (values) => {
    if (!projectId) { message.error("Select a project first"); return; }
    setSaving(true);
    try {
      await apiService.post("/properties/developer/inventory/create", {
        propertyId: projectId,
        units: [{
          unitNumber:      values.unitNumber,
          buildingName:    values.buildingName    || "",
          floorNumber:     values.floorNumber     || 0,
          unitType:        values.unitType,
          bedroomType:     values.bedroomType,
          bedrooms:        values.bedrooms        || 0,
          bathrooms:       values.bathrooms       || 0,
          area:            values.area,
          areaUnit:        values.areaUnit        || "sqft",
          price:           values.price,
          currency:        values.currency        || "AED",
          hasView:         values.hasView         || false,
          viewType:        values.viewType        || [],
          parkingSpaces:   values.parkingSpaces   || 0,
          furnishing:      values.furnishing      || "unfurnished",
          paymentPlan:     values.paymentPlan     || "",
          downPayment:     values.downPayment     || 0,
          commissionAmount: values.commissionAmount || 0,
        }],
      });
      message.success("Unit created");
      setCreateModal(false);
      createForm.resetFields();
      fetchInventory(projectId, currentPage, pageSize);
    } catch (err) {
      message.error(err?.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (values) => {
    setSaving(true);
    try {
      await apiService.put(
        `/properties/developer/inventory/${selectedUnit._id}`,
        {
          unitNumber:      values.unitNumber,
          buildingName:    values.buildingName,
          floorNumber:     values.floorNumber,
          unitType:        values.unitType,
          bedroomType:     values.bedroomType,
          bedrooms:        values.bedrooms,
          bathrooms:       values.bathrooms,
          area:            values.area,
          areaUnit:        values.areaUnit,
          price:           values.price,
          currency:        values.currency,
          hasView:         values.hasView         || false,
          viewType:        values.viewType        || [],
          parkingSpaces:   values.parkingSpaces   || 0,
          furnishing:      values.furnishing,
          paymentPlan:     values.paymentPlan,
          downPayment:     values.downPayment     || 0,
          commissionAmount: values.commissionAmount || 0,
          status:          values.status,
        }
      );
      message.success("Unit updated");
      setEditModal(false);
      editForm.resetFields();
      setSelectedUnit(null);
      fetchInventory(projectId, currentPage, pageSize);
    } catch (err) {
      message.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Card actions (reserve/book/release/delete) ─────────────
  const handleAction = async (id, action, successMsg) => {
    try {
      if (action === "delete") {
        await apiService.delete(`/properties/developer/inventory/${id}`);
        message.success("Unit deleted");
      } else {
        await apiService.post(`/properties/inventory/${id}/${action}`);
        message.success(successMsg);
      }
      fetchInventory(projectId, currentPage, pageSize);
    } catch { message.error("Action failed"); }
  };

  // ── Open edit modal ────────────────────────────────────────
  const openEdit = (unit) => {
    setSelectedUnit(unit);
    editForm.setFieldsValue({
      unitNumber:      unit.unitNumber,
      buildingName:    unit.buildingName,
      floorNumber:     unit.floorNumber,
      unitType:        unit.unitType,
      bedroomType:     unit.bedroomType,
      bedrooms:        unit.bedrooms,
      bathrooms:       unit.bathrooms,
      area:            unit.area,
      areaUnit:        unit.areaUnit        || "sqft",
      price:           unit.price,
      currency:        unit.currency        || "AED",
      hasView:         unit.hasView         || false,
      viewType:        unit.viewType        || [],
      parkingSpaces:   unit.parkingSpaces   || 0,
      furnishing:      unit.furnishing      || "unfurnished",
      paymentPlan:     unit.paymentPlan     || "",
      downPayment:     unit.downPayment     || 0,
      commissionAmount: unit.commissionAmount || 0,
      status:          unit.status,
    });
    setEditModal(true);
  };

  // ── CSV import ─────────────────────────────────────────────
  const handleCSV = async (file) => {
    if (!projectId) { message.error("Select project first"); return false; }
    const text   = await file.text();
    const parsed = text.split(/\r?\n/).slice(1)
      .map(row => {
        const c = row.split(",");
        return {
          unitNumber:  c[0]?.trim(),
          area:        Number(c[1]),
          price:       Number(c[2]),
          viewType:    c[3]?.trim() ? [c[3].trim()] : [],
          status:      c[4]?.trim()?.toLowerCase() || "available",
          unitType:    c[5]?.trim()?.toLowerCase() || "apartment",
          bedroomType: c[6]?.trim()?.toLowerCase() || "1bed",
        };
      })
      .filter(u => u.unitNumber && u.area && u.price);

    if (!parsed.length) { message.error("No valid rows"); return false; }
    try {
      await apiService.post("/properties/developer/inventory/bulk-import", {
        propertyId: projectId, units: parsed,
      });
      message.success(`${parsed.length} units imported`);
      fetchInventory(projectId, currentPage, pageSize);
    } catch { message.error("Import failed"); }
    return false;
  };

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    if (projectId) fetchInventory(projectId, 1, pageSize);
  }, [projectId, statusFilter, unitTypeFilter]);

  // Client-side search on unitNumber
  const displayed = search
    ? units.filter(u => u.unitNumber?.toLowerCase().includes(search.toLowerCase()))
    : units;

  const byStatus   = stats?.byStatus   || {};
  const byUnitType = stats?.byUnitType || {};

  return (
    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} wrap>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Inventory Management</Title>
          <Text type="secondary">Manage all project units</Text>
        </Col>
        <Col>
          <Space wrap>
            <Upload beforeUpload={handleCSV} accept=".csv" showUploadList={false}>
              <Button icon={<UploadOutlined />}>Import CSV</Button>
            </Upload>
            <Button type="primary" icon={<FileAddOutlined />} disabled={!projectId}
              onClick={() => setCreateModal(true)}
              style={{ background: "#6d28d9", borderColor: "#6d28d9" }}>
              Add Unit
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 20, borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={7}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Project</Text>
            <Select size="large" style={{ width: "100%" }} placeholder="Select project"
              options={projects} value={projectId} showSearch
              filterOption={(i, o) => o.label?.toLowerCase().includes(i.toLowerCase())}
              onChange={val => {
                setProjectId(val);
                localStorage.setItem("selectedProject", val);
                setCurrentPage(1); setStatusFilter(null);
                setUnitTypeFilter(null); setSearch("");
              }} />
          </Col>
          <Col xs={12} md={4}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Status</Text>
            <Select size="large" style={{ width: "100%" }} placeholder="All" allowClear
              value={statusFilter}
              onChange={val => { setStatusFilter(val); setCurrentPage(1); }}>
              {["available","reserved","booked","sold"].map(s => (
                <Option key={s} value={s}>{toLabel(s)}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Unit Type</Text>
            <Select size="large" style={{ width: "100%" }} placeholder="All" allowClear
              value={unitTypeFilter}
              onChange={val => { setUnitTypeFilter(val); setCurrentPage(1); }}>
              {UNIT_TYPES.map(t => <Option key={t} value={t}>{toLabel(t)}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={7}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Search Unit No.</Text>
            <Input size="large" prefix={<SearchOutlined />}
              placeholder="e.g. T1-1001" allowClear
              value={search} onChange={e => setSearch(e.target.value)} />
          </Col>
          <Col xs={24} md={2} style={{ paddingTop: 24 }}>
            <Button size="large" icon={<ReloadOutlined />}
              onClick={() => fetchInventory(projectId, currentPage, pageSize)}
              disabled={!projectId} />
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      {stats && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {[
              { lbl: "Total",     val: stats.totalUnits   || 0, color: "#6d28d9" },
              { lbl: "Available", val: byStatus.available || 0, color: "#27500A" },
              { lbl: "Reserved",  val: byStatus.reserved  || 0, color: "#3C3489" },
              { lbl: "Booked",    val: byStatus.booked    || 0, color: "#633806" },
              { lbl: "Sold",      val: byStatus.sold      || 0, color: "#0C447C" },
            ].map(({ lbl, val, color }) => (
              <Col xs={12} sm={8} md={6} lg={4} key={lbl}>
                <Card style={{ borderRadius: 12, textAlign: "center" }} bodyStyle={{ padding: "12px 8px" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{lbl}</div>
                </Card>
              </Col>
            ))}
          </Row>

          {Object.keys(byUnitType).length > 0 && (
            <Card style={{ marginBottom: 20, borderRadius: 12 }}>
              <Title level={5} style={{ marginBottom: 16 }}>By Unit Type</Title>
              <Row gutter={[12, 12]}>
                {Object.entries(byUnitType).map(([type, data]) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={type}>
                    <Card size="small" style={{ borderRadius: 10 }}>
                      <Text strong style={{ fontSize: 14 }}>{toLabel(type)}</Text>
                      <div style={{ marginTop: 8, marginBottom: 8 }}>
                        <Space wrap size={4}>
                          <Tag color="green">Avail {data.available || 0}</Tag>
                          <Tag color="purple">Res {data.reserved || 0}</Tag>
                          <Tag color="orange">Book {data.booked || 0}</Tag>
                          <Tag color="blue">Sold {data.sold || 0}</Tag>
                        </Space>
                      </div>
                      <Divider style={{ margin: "8px 0" }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>Price Range</Text>
                      <div>
                        <Text strong style={{ fontSize: 12 }}>
                          {data.pricing?.min?.toLocaleString() || "—"} – {data.pricing?.max?.toLocaleString() || "—"} AED
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}

      {/* Cards grid */}
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>
          {search ? `Results: ${displayed.length}` : `Total: ${totalItems} units`}
        </Text>
        {(statusFilter || unitTypeFilter || search) && (
          <Button size="small" onClick={() => {
            setStatusFilter(null); setUnitTypeFilter(null); setSearch("");
          }}>Clear Filters</Button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : displayed.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty description={projectId ? "No units found" : "Select a project to view inventory"} />
        </Card>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}>
            {displayed.map(unit => (
              <InventoryCard
                key={unit.key}
                unit={unit}
                onEdit={openEdit}
                onAction={handleAction}
                onView={id => navigate(`/dashboard/developer/inventory/${id}`)}
              />
            ))}
          </div>

          {!search && totalItems > pageSize && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={(p) => {
                  setCurrentPage(p);
                  localStorage.setItem("inventoryPage", p);
                  fetchInventory(projectId, p, pageSize);
                }}
                showTotal={t => `${t} units`}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal title="Add New Unit" open={createModal}
        onCancel={() => { setCreateModal(false); createForm.resetFields(); }}
        footer={null} width={760} destroyOnClose>
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <InventoryFormFields />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Button onClick={() => { setCreateModal(false); createForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}
              style={{ background: "#6d28d9", borderColor: "#6d28d9" }}>
              Create Unit
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title={`Edit Unit — ${selectedUnit?.unitNumber || ""}`}
        open={editModal}
        onCancel={() => { setEditModal(false); editForm.resetFields(); setSelectedUnit(null); }}
        footer={null} width={760} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <InventoryFormFields isEdit selectedUnit={selectedUnit} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Button onClick={() => { setEditModal(false); editForm.resetFields(); setSelectedUnit(null); }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}
              style={{ background: "#6d28d9", borderColor: "#6d28d9" }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
}