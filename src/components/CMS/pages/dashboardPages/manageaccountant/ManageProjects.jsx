// src/pages/accountant/ManageProjects.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  FileCheck,
} from "lucide-react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Collapse,
  Card,
  Space,
  Progress,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Alert,
} from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

const XOTO_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMjg3NEE2Ii8+CjxwYXRoIGQ9Ik0zMCAxNUw0MCAzNUw1MCAxNUg2MEw0NSw0MEg1NUwzMCwxNVoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+WFBPVE8gQ09SUDwvdGV4dD4KPC9zdmc+";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [invoiceType, setInvoiceType] = useState("tax"); // "po" or "tax"
  const [selectedProject, setSelectedProject] = useState(null);
  const [form] = Form.useForm();

  // Fetch Accountant's Assigned Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("freelancer/projects/my/get");
        console.log(response)
        if (response.success) {
          setProjects(response.projects || []);
        } else {
          throw new Error(response.message || "Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load assigned projects");
        message.error("Could not load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openInvoiceModal = (project, type) => {
    setSelectedProject(project);
    setInvoiceType(type);
    setInvoiceModalVisible(true);

    const invNo = type === "po"
      ? `PO-${project._id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`
      : `INV-${project._id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    form.setFieldsValue({
      invoiceNumber: invNo,
      date: dayjs(),
      dueDate: dayjs().add(15, "day"),
      items: [{ description: "Advance Payment - Site Clearance", qty: 1, rate: project.budget * 0.2 }],
    });
  };

  const downloadPDF = (project, values, type) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Logo & Header
    doc.addImage(XOTO_LOGO, "PNG", 14, y, 40, 15);
    doc.setFontSize(18);
    doc.setTextColor(40, 116, 166);
    doc.text(type === "po" ? "PURCHASE ORDER" : "TAX INVOICE", pageWidth / 2, y + 10, { align: "center" });

    y += 30;

    // Details
    doc.setFontSize(10);
    doc.text(`${type === "po" ? "PO" : "Invoice"} #: ${values.invoiceNumber}`, 14, y);
    doc.text(`Date: ${values.date.format("DD MMM YYYY")}`, 14, y + 6);
    doc.text(`Due Date: ${values.dueDate.format("DD MMM YYYY")}`, 14, y + 12);

    doc.text(`Project: ${project.title}`, pageWidth / 2 + 10, y);
    doc.text(`Category: ${project.category?.name || "N/A"}`, pageWidth / 2 + 10, y + 6);
    doc.text(`Budget: ₹${project.budget.toLocaleString()}`, pageWidth / 2 + 10, y + 12);

    y += 30;

    // Items Table
    const items = values.items || [];
    const tableData = items.map((it, i) => [
      i + 1,
      it.description,
      it.qty,
      `₹${it.rate.toLocaleString()}`,
      `₹${(it.qty * it.rate).toLocaleString()}`,
    ]);

    doc.autoTable({
      head: [["#", "Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      startY: y,
      theme: "grid",
      headStyles: { fillColor: [40, 116, 166] },
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    const total = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
    const gst = total * 0.18;
    const grandTotal = total + gst;

    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${total.toLocaleString()}`, pageWidth - 70, finalY);
    if (type === "tax") {
      doc.text(`CGST @9%: ₹${(gst / 2).toLocaleString()}`, pageWidth - 70, finalY + 8);
      doc.text(`SGST @9%: ₹${(gst / 2).toLocaleString()}`, pageWidth - 70, finalY + 16);
    }
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Total: ₹${type === "tax" ? grandTotal.toLocaleString() : total.toLocaleString()}`, pageWidth - 70, finalY + 30);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Bank: HDFC Bank | A/c: 50200078901234 | IFSC: HDFC0000123", 14, doc.internal.pageSize.getHeight() - 30);
    doc.text("UPI: xoto.corp@okhdfcbank", 14, doc.internal.pageSize.getHeight() - 20);

    doc.save(`${type === "po" ? "PO" : "Invoice"}-${values.invoiceNumber}.pdf`);
    message.success(`${type === "po" ? "PO" : "Tax Invoice"} downloaded!`);
  };

  const handleCreateInvoice = (values) => {
    downloadPDF(selectedProject, values, invoiceType);
    setInvoiceModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    const map = {
      completed: "green",
      in_progress: "blue",
      pending: "orange",
      approved: "green",
      release_requested: "gold",
    };
    return map[status] || "default";
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" tip="Loading your projects..." /></div>;
  if (error) return <Alert message="Error" description={error} type="error" showIcon className="m-6" />;
  if (projects.length === 0) return <Empty description="No projects assigned yet" className="mt-20" />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Briefcase className="text-green-600" /> Assigned Projects
        </h1>
        <p className="text-gray-600 mt-2">Manage finances, generate POs & Tax Invoices</p>
      </motion.div>

      <div className="space-y-6">
        {projects.map((project, idx) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{project.title}</h3>
                  <Space size="middle" className="mt-3">
                    <Tag color={getStatusColor(project.status)}>
                      {project.status.toUpperCase()}
                    </Tag>
                    <span className="text-lg font-medium">₹{project.budget.toLocaleString()}</span>
                    <span>{project.category?.name} → {project.subcategory?.name}</span>
                    <Progress percent={project.progress_percentage} size="small" className="w-32" />
                  </Space>
                </div>
                <Button
                  type="text"
                  size="large"
                  icon={expandedProject === project._id ? <ChevronUp /> : <ChevronDown />}
                  onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                />
              </div>

              {expandedProject === project._id && (
                <Tabs defaultActiveKey="milestones">
                  <TabPane tab={`Milestones (${project.milestones_count})`} key="milestones">
                    <Collapse accordion>
                      {project.milestones.map((m) => (
                        <Panel
                          key={m._id}
                          header={
                            <div className="flex justify-between">
                              <span className="font-medium">{m.title}</span>
                              <Space>
                                <Tag color={getStatusColor(m.status)}>
                                  {m.status.replace(/_/g, " ").toUpperCase()}
                                </Tag>
                                <span className="font-medium">₹{m.amount.toLocaleString()}</span>
                              </Space>
                            </div>
                          }
                        >
                          <p className="text-gray-600">{m.description}</p>
                          <div className="my-3">
                            <Progress percent={m.progress} status={m.progress === 100 ? "success" : "active"} />
                          </div>
                          {m.daily_updates?.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded mt-3">
                              <strong>Recent Updates:</strong>
                              {m.daily_updates.slice(0, 3).map((u) => (
                                <div key={u._id} className="text-sm mt-1">
                                  • {dayjs(u.date).format("DD MMM YYYY")}: {u.work_done}
                                  {u.approval_status && (
                                    <Tag color="green" className="ml-2 text-xs">APPROVED</Tag>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  </TabPane>

                  <TabPane tab="Generate Documents" key="documents">
                    <Space size="middle" wrap>
                      <Button
                        type="primary"
                        size="large"
                        icon={<FileCheck className="mr-2" />}
                        onClick={() => openInvoiceModal(project, "po")}
                        style={{ background: "#52c41a", borderColor: "#52c41a" }}
                      >
                        Generate Purchase Order (PO)
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        danger
                        icon={<FileText className="mr-2" />}
                        onClick={() => openInvoiceModal(project, "tax")}
                      >
                        Generate Tax Invoice (GST)
                      </Button>
                    </Space>
                  </TabPane>
                </Tabs>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Invoice / PO Modal */}
      <Modal
        title={invoiceType === "po" ? "Generate Purchase Order" : "Generate Tax Invoice"}
        open={invoiceModalVisible}
        onCancel={() => {
          setInvoiceModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Document Number" name="invoiceNumber" rules={[{ required: true }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item label="Project">
              <Input value={selectedProject?.title} disabled />
            </Form.Item>
            <Form.Item label="Issue Date" name="date" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="Due Date" name="dueDate" rules={[{ required: true }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item name={[name, "description"]} rules={[{ required: true }]}>
                      <Input placeholder="Description" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item name={[name, "qty"]} rules={[{ required: true }]}>
                      <InputNumber min={1} placeholder="Qty" />
                    </Form.Item>
                    <Form.Item name={[name, "rate"]} rules={[{ required: true }]}>
                      <InputNumber min={0} placeholder="Rate" style={{ width: 120 }} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button type="text" danger onClick={() => remove(name)}>Remove</Button>
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<Plus />}>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setInvoiceModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<Download />}>
              Download {invoiceType === "po" ? "PO" : "Tax Invoice"} as PDF
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProjects;