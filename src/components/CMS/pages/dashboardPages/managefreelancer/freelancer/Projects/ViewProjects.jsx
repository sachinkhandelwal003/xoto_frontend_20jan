import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  BankOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Tag,
  Tabs,
  Spin,
  Typography,
  Row,
  Col,
  Statistic,
  List,
  Avatar,
  Badge,
  Modal,
  Form,
  Select,
  Alert,
  Input,
  InputNumber,
  DatePicker,
  Upload,
  Image,
  Progress,
  message,
  Space,
  Divider,
  Tooltip,
  Drawer,
  Table,Empty 
} from "antd";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../manageApi/utils/sweetAlert";
import { showToast } from "../../../../../../../manageApi/utils/toast";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

// Theme Colors
const COLORS = {
  primary: "#722ed1",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
  cardBg: "#ffffff"
};

const ViewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  
  const isAdmin = ["SuperAdmin", "Admin"].includes(user?.role?.name);
  const isFreelancer = user?.role?.name === "Freelancer";

  // --- STATES ---
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & Drawers
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [rateCardDrawerOpen, setRateCardDrawerOpen] = useState(false); // New
  
  // Data Lists
  const [freelancers, setFreelancers] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  
  // Selection
  const [selectedFreelancerIds, setSelectedFreelancerIds] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewingFreelancerRateCard, setViewingFreelancerRateCard] = useState(null); // New

  // Loaders
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Forms
  const [milestoneForm] = Form.useForm();
  const [dailyForm] = Form.useForm();

  // --- FETCH PROJECT DATA ---
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/freelancer/projects?id=${id}`);
      if (response.success) {
        setProject(response.project);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load project details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  // --- HELPERS ---
  const calculateDaysRemaining = (end) => {
    const diff = moment(end).diff(moment(), 'days');
    return diff > 0 ? diff : 0;
  };

  const calculateOverallProgress = () => {
    if (!project?.milestones?.length) return 0;
    const total = project.milestones.length * 100;
    const current = project.milestones.reduce((acc, m) => acc + (m.progress || 0), 0);
    return Math.round((current / total) * 100);
  };

  // --- FETCH DROPDOWN DATA ---
  const fetchFreelancers = async () => {
    const res = await apiService.get("/freelancer?isActive=true");
    setFreelancers(res.freelancers || []);
  };

  const fetchAccountants = async () => {
    const res = await apiService.get("/users?role=accountant");
    setAccountants(res.data || []);
  };

  const openAssignModal = () => {
    fetchFreelancers();
    if (project?.freelancers) {
        setSelectedFreelancerIds(project.freelancers.map(f => f._id));
    }
    setAssignModalOpen(true);
  };

  const handleViewRateCard = (freelancerId) => {
    const fl = freelancers.find(f => f._id === freelancerId);
    if (fl) {
      setViewingFreelancerRateCard(fl);
      setRateCardDrawerOpen(true);
    }
  };

  const openMoveModal = () => {
    fetchAccountants();
    setMoveModalOpen(true);
  };

  // --- API ACTIONS ---
  const handleAssignFreelancers = async () => {
    setActionLoading(true);
    try {
      await apiService.post(`/freelancer/projects/${project._id}/assign`, {
        freelancers: selectedFreelancerIds,
      });
      message.success("Team updated successfully");
      setAssignModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      message.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToAccountant = async (accountantId) => {
    setActionLoading(true);
    try {
      await apiService.post(`/freelancer/projects/${project._id}/move`, { accountantId });
      showSuccessAlert("Moved", "Project moved to accounts");
      setMoveModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      showErrorAlert("Error", "Failed to move project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestone = async (values) => {
    const startMoment = values.date_range[0];
    const endMoment = values.date_range[1];
    const projStart = moment(project.start_date);
    const projEnd = moment(project.end_date);

    if (startMoment.isBefore(projStart) || endMoment.isAfter(projEnd)) {
        return message.error(`Dates must be within project duration (${projStart.format("MMM DD")} - ${projEnd.format("MMM DD")})`);
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("amount", values.amount);
      formData.append("start_date", startMoment.format("YYYY-MM-DD"));
      formData.append("end_date", endMoment.format("YYYY-MM-DD"));
      if (values.description) formData.append("description", values.description);
      
      if (values.photos) {
        values.photos.forEach((file) => {
          if (file.originFileObj) formData.append("photos", file.originFileObj);
        });
      }

      await apiService.upload(`/freelancer/projects/${project._id}/milestones`, formData);
      message.success("Milestone created");
      setMilestoneModalOpen(false);
      milestoneForm.resetFields();
      fetchProjectDetails();
    } catch (err) {
      message.error("Failed to add milestone");
    } finally {
      setActionLoading(false);
    }
  };

  const updateMilestoneProgress = async (milestoneId, progress) => {
    try {
      await apiService.put(`/freelancer/projects/${project._id}/milestones/${milestoneId}/progress`, { progress });
      message.success("Progress updated");
      fetchProjectDetails();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const requestPaymentRelease = async (milestoneId) => {
    try {
      await apiService.post(`/freelancer/projects/${project._id}/milestones/${milestoneId}/request-release`);
      message.success("Release requested");
      fetchProjectDetails();
    } catch (err) {
      message.error("Request failed");
    }
  };

  const approveMilestone = async (milestoneId) => {
    try {
      await apiService.put(`/freelancer/projects/${project._id}/milestones/${milestoneId}/approve`);
      message.success("Milestone approved");
      fetchProjectDetails();
    } catch (err) {
      message.error("Approval failed");
    }
  };

  // Daily Updates Logic
  const handleOpenDailyUpdates = async (milestone) => {
    setSelectedMilestone(milestone);
    setDailyModalOpen(true);
    setLoadingUpdates(true);
    try {
        const res = await apiService.get(`/freelancer/projects/${project._id}/milestones/${milestone._id}/daily`);
        setDailyUpdates(res.daily_updates || []);
    } catch (error) {
        setDailyUpdates(milestone.daily_updates || []);
    } finally {
        setLoadingUpdates(false);
    }
  };

  const handleAddDailyUpdate = async (values) => {
    setActionLoading(true);
    try {
        const payload = {
            work_done: values.work_done,
            date: values.date ? values.date.format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
            notes: values.notes || ""
        };
        await apiService.post(`/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily`, payload);
        message.success("Update submitted");
        dailyForm.resetFields();
        setDailyModalOpen(false);
        fetchProjectDetails();
    } catch (err) {
        message.error("Failed to add update");
    } finally {
        setActionLoading(false);
    }
  };

  const approveDailyUpdate = async (dailyId, approvedProgress) => {
    try {
      await apiService.put(
        `/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily/${dailyId}/approve`,
        { approved_progress: approvedProgress }
      );
      message.success("Update approved");
      handleOpenDailyUpdates(selectedMilestone);
      fetchProjectDetails(); 
    } catch (err) {
      message.error("Approval failed");
    }
  };

  const rejectDailyUpdate = async (dailyId) => {
    confirm({
      title: "Reject Daily Update",
      content: (
        <div>
          <p>Reason for rejection:</p>
          <Input.TextArea id="rejectionReason" rows={3} placeholder="Enter reason..." />
        </div>
      ),
      onOk: async () => {
        const reason = document.getElementById("rejectionReason")?.value;
        try {
          await apiService.put(
            `/freelancer/projects/${project._id}/milestones/${selectedMilestone._id}/daily/${dailyId}/reject`,
            { reason }
          );
          message.success("Update rejected");
          handleOpenDailyUpdates(selectedMilestone);
        } catch (err) {
          message.error("Failed to reject");
        }
      },
    });
  };

  // --- RATE CARD COLUMNS ---
  const rateCardColumns = [
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">{record.category?.name}</div>
          <div className="text-xs text-gray-500">
             {record.subcategories?.map(sub => sub.name).join(", ")}
          </div>
        </div>
      )
    },
    {
      title: 'Rate',
      key: 'rate',
      render: (_, record) => (
        <Tag color="green">
          {viewingFreelancerRateCard?.payment?.preferred_currency?.symbol} {record.price_range} / {record.unit}
        </Tag>
      )
    }
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spin size="large" tip="Loading Project..." /></div>;
  if (!project) return <div className="p-10 text-center text-gray-500">Project Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* --- TOP HEADER & STATS --- */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="border-gray-300" />
                    <div>
                        <div className="flex items-center gap-2">
                            <Title level={4} style={{ margin: 0 }}>{project.title}</Title>
                            <Tag color="blue">{project.status?.toUpperCase()}</Tag>
                        </div>
                        <Text type="secondary" className="text-xs">
                            <ProjectOutlined className="mr-1"/> {project.Code} | {project.client_name}
                        </Text>
                    </div>
                </div>
                
                {isAdmin && (
                    <Space>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={openAssignModal} disabled={project.status === "completed"}>
                            Assign Team
                        </Button>
                        <Button icon={<BankOutlined />} onClick={openMoveModal} disabled={!!project.accountant || project.status !== "completed"}>
                            Move to Accounts
                        </Button>
                    </Space>
                )}
            </div>

            {/* Quick Stats Row */}
            <Row gutter={24} className="mt-4">
                <Col xs={12} sm={6}>
                    <Statistic 
                        title="Budget" 
                        value={project.budget} 
                        valueStyle={{ color: COLORS.primary, fontWeight: 600 }}
                        prefix={<DollarCircleOutlined className="mr-1" />}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic 
                        title="Progress" 
                        value={calculateOverallProgress()} 
                        suffix="%" 
                        valueStyle={{ color: COLORS.success, fontWeight: 600 }} 
                        prefix={<CheckCircleOutlined className="mr-1" />}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic 
                        title="Days Remaining" 
                        value={calculateDaysRemaining(project.end_date)} 
                        valueStyle={{ fontWeight: 600 }}
                        prefix={<ClockCircleOutlined className="mr-1" />}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic 
                        title="Total Milestones" 
                        value={project.milestones?.length || 0} 
                        valueStyle={{ fontWeight: 600 }}
                        prefix={<FileTextOutlined className="mr-1" />}
                    />
                </Col>
            </Row>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Row gutter={24}>
            
            {/* --- LEFT SIDEBAR: DETAILS --- */}
            <Col xs={24} lg={8}>
                <Card title="Project Details" className="shadow-sm mb-6 rounded-lg" bordered={false}>
                    <Space direction="vertical" className="w-full" size="middle">
                        <div>
                            <Text type="secondary" className="block text-xs uppercase mb-1">Category</Text>
                            <Tag color="cyan" icon={<ProjectOutlined />}>{project.category?.name || "General"}</Tag>
                        </div>
                        <div>
                            <Text type="secondary" className="block text-xs uppercase mb-1">Timeline</Text>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-500">Start:</span>
                                    <span className="font-medium text-gray-800">{moment(project.start_date).format("DD MMM YYYY")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">End:</span>
                                    <span className="font-medium text-gray-800">{moment(project.end_date).format("DD MMM YYYY")}</span>
                                </div>
                            </div>
                        </div>
                        
                        <Divider style={{ margin: '8px 0' }} />
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Text type="secondary" className="text-xs uppercase">Assigned Team</Text>
                            </div>
                            {project.freelancers?.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={project.freelancers}
                                    renderItem={f => (
                                        <List.Item className="py-2 px-0 border-b border-gray-50 last:border-0">
                                            <List.Item.Meta
                                                avatar={<Avatar style={{ backgroundColor: COLORS.primary }}>{f.name?.first_name?.[0]}</Avatar>}
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <span>{f.name?.first_name} {f.name?.last_name}</span>
                                                        <Tooltip title="View Rate Card">
                                                            <CreditCardOutlined 
                                                                className="text-gray-400 hover:text-blue-500 cursor-pointer"
                                                                onClick={() => handleViewRateCard(f._id)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                }
                                                description={<span className="text-xs text-gray-400">{f.email}</span>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : <Alert message="No freelancers assigned" type="warning" showIcon style={{ fontSize: 12 }} />}
                        </div>

                        {project.accountant && (
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center gap-3">
                                <Avatar icon={<BankOutlined />} style={{ backgroundColor: COLORS.primary }} />
                                <div>
                                    <div className="font-medium text-purple-900">{project.accountant.name?.first_name}</div>
                                    <div className="text-xs text-purple-600">Accountant</div>
                                </div>
                            </div>
                        )}
                    </Space>
                </Card>
            </Col>

            {/* --- RIGHT CONTENT: TABS --- */}
            <Col xs={24} lg={16}>
                <Card className="shadow-sm rounded-lg" bordered={false} bodyStyle={{ padding: 0 }}>
                    <Tabs defaultActiveKey="1" tabBarStyle={{ padding: '0 24px', margin: 0 }} size="large">
                        
                        {/* TAB 1: MILESTONES */}
                        <TabPane tab={<span><CheckCircleOutlined /> Milestones</span>} key="1">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Title level={5} style={{ margin: 0 }}>Execution Roadmap</Title>
                                    {isAdmin && (
                                        <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => setMilestoneModalOpen(true)}>
                                            New Milestone
                                        </Button>
                                    )}
                                </div>

                                {project.milestones?.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                                        <FileTextOutlined style={{ fontSize: 32, color: '#ccc' }} />
                                        <p className="text-gray-500 mt-2">No milestones created yet.</p>
                                    </div>
                                ) : (
                                    <List
                                        dataSource={project.milestones}
                                        renderItem={item => (
                                            <Card 
                                                className="mb-4 border-gray-200 hover:shadow-md transition-shadow" 
                                                size="small" 
                                                bordered
                                                title={
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-700">#{item.milestone_number} {item.title}</span>
                                                        <Tag color={item.status === 'approved' ? 'success' : item.status === 'in_progress' ? 'processing' : 'warning'}>
                                                            {item.status.toUpperCase()}
                                                        </Tag>
                                                    </div>
                                                }
                                            >
                                                <div className="flex flex-col gap-4">
                                                    {/* Progress & Amount */}
                                                    <div className="flex justify-between items-end text-xs text-gray-500">
                                                        <Space>
                                                            <CalendarOutlined /> {moment(item.start_date).format("MMM DD")} - {moment(item.end_date).format("MMM DD")}
                                                        </Space>
                                                        <span className="text-gray-800 font-medium text-sm">${Number(item.amount).toLocaleString()}</span>
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span>Completion</span>
                                                            <span className="font-bold">{item.progress}%</span>
                                                        </div>
                                                        <Progress percent={item.progress} strokeColor={COLORS.primary} showInfo={false} size="small" />
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                                                        <Button type="text" size="small" icon={<FileTextOutlined />} onClick={() => handleOpenDailyUpdates(item)}>
                                                            {item.daily_updates?.length || 0} Daily Updates
                                                        </Button>

                                                        <Space>
                                                            {isFreelancer && item.status !== 'approved' && (
                                                                <>
                                                                    <Button size="small" onClick={() => updateMilestoneProgress(item._id, Math.min(100, item.progress + 10))}>+10%</Button>
                                                                    {item.progress === 100 && item.status === 'in_progress' && (
                                                                        <Button type="primary" size="small" onClick={() => requestPaymentRelease(item._id)}>Request Release</Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {isAdmin && item.status === 'release_requested' && (
                                                                <Button type="primary" size="small" className="bg-green-600" onClick={() => approveMilestone(item._id)}>Approve & Pay</Button>
                                                            )}
                                                        </Space>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    />
                                )}
                            </div>
                        </TabPane>

                        {/* TAB 2: OVERVIEW */}
                        <TabPane tab={<span><FileTextOutlined /> Overview</span>} key="2">
                            <div className="p-6">
                                <Title level={5}>Project Description</Title>
                                <Paragraph className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
                                    {project.overview || "No overview provided."}
                                </Paragraph>
                                
                                <Divider />
                                
                                <Title level={5}>Scope & Details</Title>
                                <Paragraph className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
                                    {project.scope_details || "No scope details provided."}
                                </Paragraph>

                                <div className="mt-6">
                                    <Text strong>Subcategories Involved:</Text>
                                    <div className="mt-2">
                                        {project.subcategory?.map(s => <Tag key={s._id}>{s.name}</Tag>) || <Text type="secondary">None</Text>}
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>
            </Col>
        </Row>
      </div>

      {/* --- MODALS --- */}
      
      {/* Assign Modal */}
      <Modal title="Assign Freelancers" open={assignModalOpen} onCancel={() => setAssignModalOpen(false)} onOk={handleAssignFreelancers} confirmLoading={actionLoading} width={600}>
        <Alert message="Select team members. You can view their rate card before assigning." type="info" showIcon className="mb-4" />
        <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select freelancers"
            value={selectedFreelancerIds}
            onChange={setSelectedFreelancerIds}
            optionLabelProp="label"
        >
            {freelancers.map(f => (
                <Option key={f._id} value={f._id} label={`${f.name?.first_name} ${f.name?.last_name}`}>
                    <div className="flex justify-between items-center w-full">
                        <span>{f.name?.first_name} {f.name?.last_name}</span>
                        <Tooltip title="View Rate Card">
                            <Button 
                                type="text" 
                                size="small" 
                                icon={<CreditCardOutlined />} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewRateCard(f._id);
                                }}
                            />
                        </Tooltip>
                    </div>
                </Option>
            ))}
        </Select>
      </Modal>

      {/* Rate Card Drawer */}
      <Drawer
         title={`Rate Card: ${viewingFreelancerRateCard?.name?.first_name}`}
         open={rateCardDrawerOpen}
         onClose={() => setRateCardDrawerOpen(false)}
         width={500}
      >
        {viewingFreelancerRateCard?.services_offered?.length > 0 ? (
            <Table 
                dataSource={viewingFreelancerRateCard.services_offered} 
                columns={rateCardColumns} 
                pagination={false} 
                rowKey="_id"
                size="small"
            />
        ) : <Empty description="No services listed" />}
      </Drawer>

      {/* Move Modal */}
      <Modal title="Select Accountant" open={moveModalOpen} footer={null} onCancel={() => setMoveModalOpen(false)}>
        <List dataSource={accountants} renderItem={a => (
            <List.Item actions={[<Button size="small" type="primary" loading={actionLoading} onClick={() => handleMoveToAccountant(a._id)}>Select</Button>]}>
                <List.Item.Meta avatar={<Avatar icon={<BankOutlined />} />} title={`${a.name?.first_name} ${a.name?.last_name}`} description={a.email} />
            </List.Item>
        )} />
      </Modal>

      {/* Add Milestone Modal */}
      <Modal title="Create New Milestone" open={milestoneModalOpen} onCancel={() => setMilestoneModalOpen(false)} footer={null} width={700}>
        <Form form={milestoneForm} onFinish={handleAddMilestone} layout="vertical">
            <Row gutter={16}>
                <Col span={12}><Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g. Foundation Work" /></Form.Item></Col>
                <Col span={12}><Form.Item name="amount" label="Amount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={value => `AED${value}`} /></Form.Item></Col>
            </Row>
            
            {/* Date Range Picker */}
            <Form.Item name="date_range" label="Milestone Duration" rules={[{ required: true }]}>
                <RangePicker 
                    style={{ width: '100%' }} 
                    disabledDate={(current) => current && (current < moment(project.start_date) || current > moment(project.end_date))}
                />
            </Form.Item>
            
            <Form.Item name="description" label="Description"><TextArea rows={2} /></Form.Item>
            <Form.Item name="photos" label="Attachments"><Upload listType="picture" beforeUpload={() => false} maxCount={5} multiple><Button icon={<UploadOutlined />}>Upload</Button></Upload></Form.Item>
            <Button type="primary" htmlType="submit" block loading={actionLoading} size="large">Create Milestone</Button>
        </Form>
      </Modal>

      {/* Daily Updates Modal */}
      <Modal title={<span className="text-gray-700">Daily Updates: <span className="font-bold">{selectedMilestone?.title}</span></span>} open={dailyModalOpen} onCancel={() => setDailyModalOpen(false)} width={800} footer={null} centered>
        {isFreelancer && selectedMilestone?.status !== 'approved' && (
            <Card type="inner" size="small" className="mb-6 bg-gray-50 border-gray-200">
                <Form form={dailyForm} onFinish={handleAddDailyUpdate} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="date" label="Date" initialValue={moment()}><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
                        <Col span={16}><Form.Item name="work_done" label="Work Done" rules={[{ required: true }]}><Input placeholder="Brief summary..." /></Form.Item></Col>
                    </Row>
                    <Form.Item name="notes" label="Detailed Notes"><TextArea rows={2} /></Form.Item>
                    <div className="flex justify-end"><Button type="primary" htmlType="submit" loading={actionLoading}>Post Update</Button></div>
                </Form>
            </Card>
        )}

        <div className="max-h-[400px] overflow-y-auto pr-2">
            <Spin spinning={loadingUpdates}>
                <List dataSource={dailyUpdates} renderItem={du => (
                    <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition bg-white">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-xs text-gray-400 block mb-1">{moment(du.date).format("dddd, DD MMM YYYY")}</span>
                                <div className="font-medium text-gray-800">{du.work_done}</div>
                            </div>
                            <Tag color={du.approval_status === 'approved' ? 'success' : du.approval_status === 'rejected' ? 'error' : 'warning'}>{du.approval_status.toUpperCase()}</Tag>
                        </div>
                        {du.notes && <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-2">{du.notes}</div>}
                        
                        {/* Admin Approval UI */}
                        {isAdmin && du.approval_status === 'pending' && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <InputNumber size="small" min={0} max={100} defaultValue={du.approved_progress || 0} id={`prog-${du._id}`} placeholder="%" style={{ width: 70 }} />
                                <Button type="primary" size="small" onClick={() => approveDailyUpdate(du._id, document.getElementById(`prog-${du._id}`).value)}>Approve</Button>
                                <Button danger size="small" onClick={() => rejectDailyUpdate(du._id)}>Reject</Button>
                            </div>
                        )}
                        {du.approval_status === 'approved' && <div className="text-xs text-green-600 mt-2 font-medium">Approved Progress Impact: {du.approved_progress}%</div>}
                    </div>
                )} locale={{ emptyText: "No updates found" }} />
            </Spin>
        </div>
      </Modal>

    </div>
  );
};

export default ViewProject;