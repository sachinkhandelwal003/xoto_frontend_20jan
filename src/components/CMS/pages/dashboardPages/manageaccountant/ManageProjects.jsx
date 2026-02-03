// src/pages/accountant/ManageProjects.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  Row,
  Col,
  Statistic,
  Badge,
  Descriptions,
  Avatar,
  Tooltip,
  Typography,
} from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import CustomTable from '../../../pages/custom/CustomTable';
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
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const XOTO_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMjg3NEE2Ii8+CjxwYXRoIGQ9Ik0zMCAxNUw0MCAzNUw1MCAxNUg2MEw0NSw0MEg1NUwzMCwxNVoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+WFBPVE8gQ09SUDwvdGV4dD4KPC9zdmc+";

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [invoiceType, setInvoiceType] = useState("tax"); // "po" or "tax"
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [form] = Form.useForm();
  const [billForm] = Form.useForm();
  const [sendingBill, setSendingBill] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Flatten projects for CustomTable
  const flattenProjectsForSearch = (list = []) => {
    const normalize = (str) => (str || "").toString().trim();
    
    return list.map((project) => {
      const title = project?.title || "";
      const budget = project?.budget || 0;
      const status = project?.status || "";
      const clientName = project?.customer?.name 
        ? `${project.customer.name.first_name || ""} ${project.customer.name.last_name || ""}`.trim()
        : "";
      const clientEmail = project?.customer?.email || "";
      
      const totalMilestones = project.milestones?.length || 0;
      const completedMilestones = project.completed_milestones || 0;
      const progressPercentage = project.progress_percentage || 0;
      
      return {
        ...project,
        __search_title: normalize(title),
        __search_budget: normalize(budget),
        __search_status: normalize(status),
        __search_client: normalize(clientName),
        __search_email: normalize(clientEmail),
        __search_milestones: normalize(`${completedMilestones}/${totalMilestones}`),
        __search_progress: normalize(`${progressPercentage}%`),
      };
    });
  };

  // Fetch Accountant's Assigned Projects
  const fetchProjects = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await apiService.get("freelancer/projects/my/get", { page, limit });
      
      if (response.success) {
        const flattenedProjects = flattenProjectsForSearch(response.projects || []);
        setProjects(flattenedProjects);
        
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalResults: response.pagination.total || response.projects?.length || 0,
            itemsPerPage: response.pagination.limit || limit,
          });
        }
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

  useEffect(() => {
    fetchProjects();
  }, []);

  // API to send milestone bill to customer
  const sendMilestoneBill = async (values) => {
    if (!selectedProject || !selectedMilestone) return;
    
    setSendingBill(true);
    try {
      const payload = {
        project_id: selectedProject._id,
        customer_id: selectedProject.customer?._id,
        milestone_id: selectedMilestone._id,
        price: values.price,
        estimate_id: selectedProject.estimate_reference?._id || null,
        notes: values.notes || "",
      };

      const response = await apiService.post(
        "/freelancer/projects/send-milestone-bill-to-customer",
        payload
      );
        message.success(response.message);

  
    } catch (err) {
      console.error("Error sending bill:", err);
      message.error(err.response?.data?.message || "Failed to send bill");
    } finally {
      setSendingBill(false);
    }
  };

  // Open Bill Modal
  const openBillModal = (project, milestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setBillModalVisible(true);
    
    billForm.setFieldsValue({
      project: project.title,
      milestone: milestone.title,
      customer: `${project.customer?.name?.first_name} ${project.customer?.name?.last_name}`,
      price: milestone.amount,
      notes: "",
    });
  };

  // Open Invoice Modal
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

  // Download PDF
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
      draft: "gray",
      assigned: "purple",
    };
    return map[status] || "default";
  };

  const formatStatus = (s) => {
    const map = {
      completed: "Completed",
      in_progress: "In Progress",
      pending: "Pending",
      approved: "Approved",
      release_requested: "Payment Requested",
      draft: "Draft",
      assigned: "Assigned",
    };
    return map[s] || s.replace(/_/g, " ").toUpperCase();
  };

  // Table Columns for CustomTable
  const columns = useMemo(
    () => [
      {
        key: "project_info",
        title: "Project Details",
        width: 300,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              shape="square"
              size="large"
              icon={<Briefcase size={16} />}
              style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
            />
            <div>
              <div className="font-semibold text-gray-800 text-base">{record.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Text type="secondary">Client: {record.customer?.name?.first_name} {record.customer?.name?.last_name}</Text>
                <Badge 
                  count={record.milestones?.length || 0} 
                  style={{ backgroundColor: THEME.primary }}
                  title="Total Milestones"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "budget",
        title: "Budget",
        width: 140,
        render: (_, record) => (
          <span className="font-semibold text-gray-700">
            ₹{Number(record.budget || 0).toLocaleString()}
          </span>
        ),
      },
      {
        key: "progress",
        title: "Progress",
        width: 180,
        render: (_, record) => {
          const progress = record.progress_percentage || 0;
          const completed = record.completed_milestones || 0;
          const total = record.milestones?.length || 0;
          
          return (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1 text-gray-500">
                <span>
                  {completed}/{total} Milestones
                </span>
                <span>{progress}%</span>
              </div>
              <Progress 
                percent={progress} 
                size="small" 
                status={progress === 100 ? 'success' : 'active'}
                showInfo={false}
                strokeColor={THEME.primary}
              />
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        width: 140,
        render: (_, record) => {
          const status = record.status;
          const color = getStatusColor(status);
          
          return (
            <Tag color={color} style={{ borderRadius: 12, padding: "2px 10px" }}>
              {formatStatus(status)}
            </Tag>
          );
        },
      },
      {
        key: "milestone_status",
        title: "Milestone Status",
        width: 180,
        render: (_, record) => {
          const milestones = record.milestones || [];
          const pendingBills = milestones.filter(m => 
            m.status === "approved" && !m.bill_sent
          ).length;
          
          const sentBills = milestones.filter(m => 
            m.bill_sent
          ).length;
          
          return (
            <Space direction="vertical" size="small">
              <div className="flex items-center">
                <Badge count={pendingBills} style={{ backgroundColor: THEME.warning }} />
                <Text type="secondary" className="ml-2">Pending Bills</Text>
              </div>
              <div className="flex items-center">
                <Badge count={sentBills} style={{ backgroundColor: THEME.success }} />
                <Text type="secondary" className="ml-2">Sent Bills</Text>
              </div>
            </Space>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="primary"
                ghost
                size="small"
                shape="circle"
                icon={<Eye size={14} />}
                onClick={() => setExpandedProject(expandedProject === record._id ? null : record._id)}
                style={{ borderColor: THEME.primary, color: THEME.primary }}
              />
            </Tooltip>
            <Tooltip title="Generate Documents">
              <Button
                type="default"
                size="small"
                shape="circle"
                icon={<FileCheck size={14} />}
                onClick={() => openInvoiceModal(record, "po")}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [THEME, expandedProject]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalProjects: pagination.totalResults,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      pendingBills: projects.reduce((sum, p) => {
        const milestones = p.milestones || [];
        return sum + milestones.filter(m => 
          m.status === "approved" && !m.bill_sent
        ).length;
      }, 0),
      completedProjects: projects.filter(p => p.status === "completed").length,
    };
  }, [projects, pagination.totalResults]);

  const handlePageChange = (page, limit) => {
    fetchProjects(page, limit);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading your projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error Loading Projects" 
        description={error} 
        type="error" 
        showIcon 
        className="m-6"
      />
    );
  }

  if (projects.length === 0 && !loading) {
    return (
      <Empty 
        description="No projects assigned yet" 
        className="mt-20"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="flex items-center gap-3">
              <Briefcase className="text-green-600" /> Accountant Projects Management
            </Title>
            <Text type="secondary">Manage finances, generate bills, POs & Tax Invoices</Text>
          </div>
          <Button 
            icon={<RefreshCw size={16} />} 
            onClick={() => fetchProjects()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Projects" 
              value={stats.totalProjects} 
              prefix={<Briefcase style={{ color: THEME.primary }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.secondary }}>
            <Statistic
              title="Total Budget"
              value={stats.totalBudget}
              precision={0}
              prefix={<DollarSign style={{ color: THEME.secondary }} />}
              formatter={value => `₹${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
            <Statistic
              title="Pending Bills"
              value={stats.pendingBills}
              prefix={<AlertCircle style={{ color: THEME.warning }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
            <Statistic
              title="Completed Projects"
              value={stats.completedProjects}
              prefix={<CheckCircle style={{ color: THEME.success }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* CustomTable */}
      <Card bordered={false} className="shadow-md rounded-lg mb-6" bodyStyle={{ padding: 0 }}>
        <CustomTable
          columns={columns}
          data={projects}
          loading={loading}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Expanded Project Details */}
      {expandedProject && projects.find(p => p._id === expandedProject) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="mb-0">
                {projects.find(p => p._id === expandedProject)?.title}
              </Title>
              <Button
                type="text"
                size="large"
                icon={<ChevronUp />}
                onClick={() => setExpandedProject(null)}
              />
            </div>
            
            <Tabs defaultActiveKey="milestones">
              <TabPane tab={`Milestones (${projects.find(p => p._id === expandedProject)?.milestones?.length || 0})`} key="milestones">
                <Collapse accordion>
                  {projects.find(p => p._id === expandedProject)?.milestones?.map((milestone) => (
                    <Panel
                      key={milestone._id}
                      header={
                        <div className="flex justify-between items-center w-full">
                          <Space>
                            <Text strong>{milestone.title}</Text>
                            <Tag color={getStatusColor(milestone.status)}>
                              {formatStatus(milestone.status)}
                            </Tag>
                            {milestone.bill_sent && (
                              <Tag color="green" icon={<CheckCircle size={12} />}>
                                Bill Sent
                              </Tag>
                            )}
                          </Space>
                          <Space>
                            <Text strong>₹{milestone.amount?.toLocaleString()}</Text>
                            {milestone.status === "approved" && !milestone.bill_sent && (
                              <Button
                                type="primary"
                                size="small"
                                icon={<Send size={12} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBillModal(
                                    projects.find(p => p._id === expandedProject),
                                    milestone
                                  );
                                }}
                              >
                                Send Bill
                              </Button>
                            )}
                          </Space>
                        </div>
                      }
                    >
                      <Descriptions column={2} bordered size="small" className="mb-4">
                        <Descriptions.Item label="Description" span={2}>
                          {milestone.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                          ₹{milestone.amount?.toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Progress">
                          {milestone.progress}%
                        </Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                          {dayjs(milestone.start_date).format("DD MMM YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="End Date">
                          {dayjs(milestone.end_date).format("DD MMM YYYY")}
                        </Descriptions.Item>
                      </Descriptions>
                      
                      <div className="my-3">
                        <Progress percent={milestone.progress} status={milestone.progress === 100 ? 'success' : 'active'} />
                      </div>
                      
                      {milestone.daily_updates?.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded mt-3">
                          <Text strong>Recent Updates:</Text>
                          {milestone.daily_updates.slice(0, 3).map((update) => (
                            <div key={update._id} className="text-sm mt-1">
                              • {dayjs(update.date).format("DD MMM YYYY")}: {update.work_done}
                              {update.approval_status && (
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
                    onClick={() => openInvoiceModal(
                      projects.find(p => p._id === expandedProject),
                      "po"
                    )}
                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Generate Purchase Order (PO)
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    danger
                    icon={<FileText className="mr-2" />}
                    onClick={() => openInvoiceModal(
                      projects.find(p => p._id === expandedProject),
                      "tax"
                    )}
                  >
                    Generate Tax Invoice (GST)
                  </Button>
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>
      )}

      {/* Send Bill Modal */}
      <Modal
        title="Send Milestone Bill to Customer"
        open={billModalVisible}
        onCancel={() => {
          setBillModalVisible(false);
          billForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={billForm} layout="vertical" onFinish={sendMilestoneBill}>
          <Alert
            message="Bill Information"
            description="This will send a bill notification to the customer for the selected milestone."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Form.Item label="Project" name="project">
            <Input disabled />
          </Form.Item>
          
          <Form.Item label="Milestone" name="milestone">
            <Input disabled />
          </Form.Item>
          
          <Form.Item label="Customer" name="customer">
            <Input disabled />
          </Form.Item>
          
          <Form.Item 
            label="Price" 
            name="price"
            rules={[
              { required: true, message: 'Please enter the price' },
              { type: 'number', min: 1, message: 'Price must be greater than 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="₹"
              placeholder="Enter bill amount"
            />
          </Form.Item>
          
          <Form.Item label="Notes (Optional)" name="notes">
            <TextArea
              rows={3}
              placeholder="Add any notes for the customer..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setBillModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={sendingBill}
              icon={<Send size={16} />}
            >
              Send Bill to Customer
            </Button>
          </div>
        </Form>
      </Modal>

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
        destroyOnClose
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