// src/pages/freelancer/ProjectDetails.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Progress,
  Button,
  Drawer,
  Form,
  Input,
  Tag,
  Typography,
  Space,
  Alert,
  Divider,
  List,
  message,
  Spin,
  Popconfirm,
  Descriptions,
  Upload,
  Image,
  Collapse,
  DatePicker,
  Timeline,
  Badge,
  Row,
  Col,
  Tabs,
  Modal,
  Statistic,
  Empty
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined,
  PlusOutlined,
  NumberOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showConfirmDialog } from "../../../../../../../manageApi/utils/sweetAlert";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const API_BASE = "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/*                              UTILITY FUNCTIONS                             */
/* -------------------------------------------------------------------------- */
const getActiveMilestones = (milestones = []) => {
  return milestones.filter(m => !m.is_deleted);
};

const getStatusColor = (s) => {
  const map = {
    completed: "green",
    in_progress: "blue",
    pending: "orange",
    release_requested: "gold",
    approved: "cyan",
    draft: "gray",
  };
  return map[s] || "default";
};

const formatMilestoneStatus = (s) => {
  const map = {
    pending: "Pending",
    in_progress: "In Progress",
    release_requested: "Payment Requested",
    approved: "Approved",
    completed: "Completed",
  };
  return map[s] || s;
};

const isMilestoneActive = (m) => {
  if (!m.start_date || !m.end_date) return false;
  const now = moment();
  const start = moment(m.start_date);
  const end = moment(m.end_date);
  return now.isBetween(start, end, "day", "[]");
};

const canAddDailyUpdate = (m, userId) => {
  if (!["pending", "in_progress"].includes(m.status)) return false;
  if (!isMilestoneActive(m)) return false;
  const today = moment().startOf("day");
  return !m.daily_updates?.some(
    (u) => u.updated_by === userId && moment(u.date).isSame(today, "day")
  );
};

const daysRemaining = (due) => {
  if (!due) return 0;
  return moment(due).diff(moment(), "days");
};

const dueStatus = (due, status) => {
  if (["approved", "completed"].includes(status)) return "success";
  const d = daysRemaining(due);
  if (d < 0) return "error";
  if (d <= 3) return "warning";
  return "success";
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
const ManageProjectFreelancer = () => {
  const { user } = useSelector((s) => s.auth);
  const { projectId } = useParams();
  const navigate = useNavigate();
  console.log("Project ID:", projectId);

  /* ------------------------------- State ----------------------------------- */
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Daily Update Drawer
  const [dailyDrawerOpen, setDailyDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submittingDaily, setSubmittingDaily] = useState(false);
  const [dailyErrors, setDailyErrors] = useState([]);

  // File Upload Modal
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const [dailyForm] = Form.useForm();

  /* --------------------------- API Calls ----------------------------------- */
  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/freelancer/projects?id=${projectId}`);
      
      if (response && response.project) {
        setProject(response.project);
      } else {
        message.error("Project not found");
        navigate("/freelancer/projects");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      message.error("Failed to load project details");
      navigate("/freelancer/projects");
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  const refreshProject = async () => {
    setRefreshing(true);
    await fetchProjectDetails();
    setRefreshing(false);
    message.success("Project refreshed");
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [fetchProjectDetails, projectId]);

  /* -------------------------- File Upload Handler -------------------------- */
  const handleFileUpload = async () => {
    if (!uploadFile) {
      message.warning("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await apiService.upload("/upload", formData);

      if (response.success) {
        message.success("File uploaded successfully!");
        const uploadedUrl = response.file.url;

        // Get current photos from form
        const currentPhotos = dailyForm.getFieldValue("photos") || [];
        const fileList = Array.isArray(currentPhotos) ? currentPhotos : currentPhotos.fileList || [];
        
        // Add new uploaded file to the list
        const newFile = {
          uid: `uploaded-${Date.now()}`,
          name: uploadFile.name,
          status: 'done',
          url: uploadedUrl,
          response: response
        };

        // Update form with new file list
        dailyForm.setFieldsValue({
          photos: [...fileList, newFile]
        });

        setUploadModalVisible(false);
        setUploadFile(null);
        message.success("File added to photos list");
      } else {
        message.error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  /* -------------------------- Daily Update Handlers ------------------------ */
  const openDailyDrawer = (milestone) => {
    setSelectedMilestone(milestone);
    setDailyErrors([]);
    dailyForm.resetFields();
    setDailyDrawerOpen(true);
  };

  const closeDailyDrawer = () => {
    setDailyDrawerOpen(false);
    setSelectedMilestone(null);
    setDailyErrors([]);
    dailyForm.resetFields();
  };

  /* -------------------- FIXED: Submit Daily Update Function ---------------- */
  const submitDailyUpdate = async (values) => {
    if (!project || !selectedMilestone) {
      message.error("Project or milestone not selected");
      return;
    }

    setSubmittingDaily(true);
    setDailyErrors([]);

    try {
      // 1. Collect photo URLs from the form
      let photoUrls = [];
      const photos = values.photos || [];

      // Check if photos is a fileList object or array
      const photoList = Array.isArray(photos) ? photos : (photos.fileList || []);

      for (const photo of photoList) {
        if (photo.originFileObj) {
          // Upload new photo file
          const photoFormData = new FormData();
          photoFormData.append("file", photo.originFileObj);

          const uploadRes = await apiService.post("upload", photoFormData);
          if (uploadRes.success && uploadRes.file && uploadRes.file.url) {
            photoUrls.push(uploadRes.file.url);
          } else {
            console.error("Upload failed for file:", photo);
          }
        } else if (photo.url) {
          // Already uploaded URL
          photoUrls.push(photo.url);
        } else if (photo.response?.file?.url) {
          // From previous upload response
          photoUrls.push(photo.response.file.url);
        }
      }

      // 2. Prepare payload exactly as specified
      const payload = {
        work_done: values.work_done,
        date: values.date.format("YYYY-MM-DD"),
        notes: values.notes || "",
        photos: photoUrls
      };

      console.log("Submitting daily update with payload:", payload);
      console.log("To URL: /api/freelancer/projects/daily-update");
      console.log("Params:", {
        projectId: project._id,
        milestoneId: selectedMilestone._id
      });

      // 3. Submit the daily update
     const res = await apiService.post(
  `freelancer/projects/daily-update?projectId=${project._id}&milestoneId=${selectedMilestone._id}`,
  payload
);

      if (res.success) {
        message.success("Daily update submitted successfully!");
        fetchProjectDetails();
        closeDailyDrawer();
      } else {
        message.error(res.message || "Failed to submit daily update");
        
        // Handle validation errors
        if (res.errors) {
          const errorMessages = res.errors.map(err => err.msg || err.message);
          setDailyErrors(errorMessages);
        }
      }
    } catch (err) {
      console.error("Daily update error:", err);
      
      if (err.response) {
        // Handle API response errors
        const errorData = err.response.data;
        if (errorData.errors) {
          const errorMessages = errorData.errors.map(e => e.msg || e.message);
          setDailyErrors(errorMessages);
        } else {
          message.error(errorData.message || "Failed to submit daily update");
        }
      } else {
        message.error("Network error. Please check your connection.");
      }
    } finally {
      setSubmittingDaily(false);
    }
  };

  const requestPaymentRelease = async (milId) => {
    const ok = await showConfirmDialog({
      title: "Request Payment Release?",
      text: "This will notify the admin to release the milestone payment.",
      icon: "question",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    if (!ok) return;

    try {
      const { success, message: msg } = await apiService.post(
        `/freelancer/projects/${project._id}/milestones/${milId}/release`
      );
      if (success) {
        message.success("Payment release requested");
        fetchProjectDetails();
      } else message.error(msg || "Failed");
    } catch (e) {
      message.error("Error requesting release");
    }
  };

  /* --------------------------- Helpers ------------------------------------- */
  const getClientName = () => {
    if (project?.client_name) return project.client_name;
    if (project?.customer) {
      const firstName = project.customer.name?.first_name || "";
      const lastName = project.customer.name?.last_name || "";
      return `${firstName} ${lastName}`.trim();
    }
    return "Unknown Client";
  };

  const calculateProjectProgress = () => {
    const activeMilestones = getActiveMilestones(project?.milestones || []);
    if (!activeMilestones.length) return 0;
    
    const completed = activeMilestones.filter((m) => 
      ["approved", "completed"].includes(m.status)
    ).length;
    return Math.round((completed / activeMilestones.length) * 100);
  };

  /* ------------------------------ UI --------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Alert
          message="Project Not Found"
          description="The project you're looking for doesn't exist or you don't have access."
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={() => navigate("/freelancer/projects")}
            >
              Back to Projects
            </Button>
          }
        />
      </div>
    );
  }

  const activeMilestones = getActiveMilestones(project.milestones || []);
  const projectProgress = calculateProjectProgress();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/freelancer/projects")}
          >
            Back to Projects
          </Button>
          <Title level={2}>{project.title}</Title>
          <Tag color={getStatusColor(project.status)}>
            {project.status.replace("_", " ").toUpperCase()}
          </Tag>
        </Space>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refreshProject} 
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Project Info Card */}
      <Card className="mb-6">
        <Descriptions title="Project Information" bordered column={2}>
          <Descriptions.Item label="Project Code">
            <Tag color="blue">{project.Code || "—"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Budget">
            <Text strong>${(project.budget || 0).toLocaleString()}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Client">
            {getClientName()}
            {project.client_company && (
              <Text type="secondary"> ({project.client_company})</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Client Email">
            {project.customer?.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {project.city || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {project.start_date ? moment(project.start_date).format("DD MMM YYYY") : "—"}
            {" to "}
            {project.end_date ? moment(project.end_date).format("DD MMM YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Supervisor">
            {project.assigned_supervisor?.name?.first_name || "—"} 
            {" "}
            {project.assigned_supervisor?.name?.last_name || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {project.createdAt ? moment(project.createdAt).format("DD MMM YYYY") : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Progress Section */}
      <Card className="mb-6">
        <Title level={4}>Project Progress</Title>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Text strong>Overall Progress</Text>
            <Text strong>{projectProgress}%</Text>
          </div>
          <Progress percent={projectProgress} status={projectProgress === 100 ? "success" : "active"} />
        </div>
        
        <Row gutter={16} className="mt-4">
          <Col span={8}>
            <Statistic 
              title="Total Milestones" 
              value={activeMilestones.length} 
              prefix={<FileTextOutlined />} 
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Completed Milestones"
              value={activeMilestones.filter(m => ["completed", "approved"].includes(m.status)).length}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="In Progress"
              value={activeMilestones.filter(m => m.status === "in_progress").length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<PlayCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Milestones Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Milestones ({activeMilestones.length})</Title>
        </div>

        {activeMilestones.length === 0 ? (
          <Empty description="No milestones found" />
        ) : (
          <Timeline>
            {activeMilestones
              .sort((a, b) => a.milestone_number - b.milestone_number)
              .map((mil) => {
                const active = isMilestoneActive(mil);
                const canAdd = canAddDailyUpdate(mil, user?._id);
                const dueDays = daysRemaining(mil.due_date);
                const dueStat = dueStatus(mil.due_date, mil.status);
                const milestoneProgress = mil.progress || 0;
                const dailyUpdates = mil.daily_updates || [];

                return (
                  <Timeline.Item
                    key={mil._id}
                    dot={
                      mil.status === "approved" || mil.status === "completed" ? (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      ) : mil.status === "release_requested" ? (
                        <ClockCircleOutlined style={{ color: "#faad14" }} />
                      ) : active ? (
                        <PlayCircleOutlined style={{ color: "#1890ff" }} />
                      ) : (
                        <NumberOutlined style={{ color: "#d9d9d9" }} />
                      )
                    }
                  >
                    <Card
                      size="small"
                      className="mb-4"
                      style={{ borderLeft: `4px solid ${getStatusColor(mil.status)}` }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div className="flex justify-between items-start">
                          <Space direction="vertical" size={2} style={{ flex: 1 }}>
                            <Space wrap>
                              <Text strong>Milestone {mil.milestone_number}: {mil.title}</Text>
                              <Tag color={getStatusColor(mil.status)}>
                                {formatMilestoneStatus(mil.status)}
                              </Tag>
                              <Tag color={active ? "green" : "gray"}>
                                {moment(mil.start_date).format("DD MMM")} -{" "}
                                {moment(mil.end_date).format("DD MMM")}
                              </Tag>
                              {mil.milestone_weightage && (
                                <Tag color="purple">Weight: {mil.milestone_weightage}%</Tag>
                              )}
                            </Space>

                            <Text type="secondary">
                              Due: {moment(mil.due_date).format("DD MMM YYYY")}{" "}
                              {dueDays >= 0
                                ? `(${dueDays} day${dueDays !== 1 ? "s" : ""} left)`
                                : `(${Math.abs(dueDays)} day${Math.abs(dueDays) !== 1 ? "s" : ""} overdue)`}
                            </Text>

                            <Text strong>Amount: ${(mil.amount || 0).toLocaleString()}</Text>
                            
                            {mil.description && (
                              <Text type="secondary">{mil.description}</Text>
                            )}
                          </Space>

                          <Space direction="vertical" align="center">
                            <Text strong>{milestoneProgress}%</Text>
                            <Progress
                              type="circle"
                              percent={milestoneProgress}
                              width={60}
                              status={milestoneProgress === 100 ? "success" : "active"}
                            />
                          </Space>
                        </div>

                        <Progress
                          percent={milestoneProgress}
                          size="small"
                          status={milestoneProgress === 100 ? "success" : "active"}
                        />

                        <Space wrap>
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => openDailyDrawer(mil)}
                          >
                            Add Daily Update
                          </Button>

                          {dailyUpdates.length > 0 && (
                            <Button
                              size="small"
                              icon={<FileTextOutlined />}
                              onClick={() => {
                                setSelectedMilestone(mil);
                                setDailyDrawerOpen(true);
                              }}
                            >
                              View Updates ({dailyUpdates.length})
                            </Button>
                          )}

                          {milestoneProgress === 100 && mil.status === "in_progress" && (
                            <Popconfirm
                              title="Request for approval?"
                              onConfirm={() => requestPaymentRelease(mil._id)}
                            >
                              <Button type="dashed" size="small" icon={<DollarOutlined />}>
                                Approval Request
                              </Button>
                            </Popconfirm>
                          )}
                        </Space>

                        {/* Daily Updates List */}
                        {dailyUpdates.length > 0 && (
                          <Collapse className="mt-3">
                            <Panel header={`Daily Updates (${dailyUpdates.length})`} key="1">
                              <List
                                dataSource={dailyUpdates
                                  .slice()
                                  .sort((a, b) => new Date(b.date) - new Date(a.date))}
                                renderItem={(upd, i) => (
                                  <List.Item key={upd._id || i}>
                                    <Card
                                      size="small"
                                      className={
                                        upd.approval_status === "rejected" ? "border-red-200" : ""
                                      }
                                    >
                                      <Space direction="vertical" style={{ width: "100%" }}>
                                        <Space>
                                          <Text strong>#{dailyUpdates.length - i}</Text>
                                          <Text type="secondary">
                                            {moment(upd.date).format("DD MMM YYYY")}
                                          </Text>
                                          {upd.approval_status === "approved" && (
                                            <Badge status="success" text="Approved" />
                                          )}
                                          {upd.approval_status === "rejected" && (
                                            <Badge status="error" text="Rejected" />
                                          )}
                                          {upd.approval_status === "pending" && (
                                            <Badge status="processing" text="Pending" />
                                          )}
                                        </Space>

                                        <Paragraph strong>Work Done:</Paragraph>
                                        <Paragraph>{upd.work_done}</Paragraph>

                                        {upd.notes && (
                                          <>
                                            <Paragraph strong>Notes:</Paragraph>
                                            <Paragraph type="secondary">{upd.notes}</Paragraph>
                                          </>
                                        )}

                                        {upd.photos?.length > 0 && (
                                          <div className="mt-2">
                                            <Paragraph strong>Photos:</Paragraph>
                                            <Space wrap>
                                              {upd.photos.map((url, pi) => (
                                                <Image
                                                  key={pi}
                                                  src={url}
                                                  width={80}
                                                  height={80}
                                                  style={{ objectFit: "cover", borderRadius: 6 }}
                                                  preview
                                                />
                                              ))}
                                            </Space>
                                          </div>
                                        )}

                                        {upd.approval_status === "rejected" &&
                                          upd.rejection_reason && (
                                            <Alert
                                              message="Rejection Reason"
                                              description={upd.rejection_reason}
                                              type="error"
                                              showIcon
                                              className="mt-2"
                                            />
                                          )}
                                      </Space>
                                    </Card>
                                  </List.Item>
                                )}
                              />
                            </Panel>
                          </Collapse>
                        )}
                      </Space>
                    </Card>
                  </Timeline.Item>
                );
              })}
          </Timeline>
        )}
      </Card>

      {/* ==================== DAILY UPDATE DRAWER ==================== */}
      <Drawer
        title="Submit Daily Update"
        open={dailyDrawerOpen}
        onClose={closeDailyDrawer}
        width={600}
        destroyOnClose
      >
        {selectedMilestone && (
          <Form form={dailyForm} layout="vertical" onFinish={submitDailyUpdate}>
            <Alert
              message="Your update will be reviewed by admin"
              type="info"
              showIcon
              className="mb-4"
            />

            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Milestone">
                {selectedMilestone.title}
              </Descriptions.Item>
              <Descriptions.Item label="Milestone Number">
                {selectedMilestone.milestone_number}
              </Descriptions.Item>
              <Descriptions.Item label="Progress">
                {selectedMilestone.progress || 0}%
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                ${(selectedMilestone.amount || 0).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Active Period">
                {moment(selectedMilestone.start_date).format("DD MMM YYYY")} -{" "}
                {moment(selectedMilestone.end_date).format("DD MMM YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* DATE PICKER */}
            <Form.Item
              name="date"
              label="Update Date"
              rules={[
                { required: true, message: "Please select a date" },
                () => ({
                  validator(_, value) {
                    if (!value) return Promise.reject(new Error("Please select a date"));
                    const start = moment(selectedMilestone.start_date).startOf("day");
                    const end = moment(selectedMilestone.end_date).startOf("day");
                    if (value.isBefore(start) || value.isAfter(end)) {
                      return Promise.reject(
                        `Date must be between ${start.format("DD MMM YYYY")} and ${end.format("DD MMM YYYY")}`
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD MMM YYYY"
                disabledDate={(current) => {
                  const start = moment(selectedMilestone.start_date).startOf("day");
                  const end = moment(selectedMilestone.end_date).startOf("day");
                  return current && (current < start || current > end);
                }}
              />
            </Form.Item>

            {/* Validation Errors */}
            {dailyErrors.length > 0 && (
              <Alert
                message="Please fix the following errors:"
                description={
                  <ul className="m-0 pl-4">
                    {dailyErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                }
                type="error"
                showIcon
                className="mb-4"
              />
            )}

            <Form.Item
              name="work_done"
              label="Work Completed"
              rules={[
                { required: true, message: "Please describe work done" },
                { min: 5, message: "Work done must be at least 5 characters" },
              ]}
            >
              <TextArea rows={4} placeholder="e.g. Installed 50m² of tiles..." />
            </Form.Item>

            <Form.Item name="notes" label="Additional Notes (Optional)">
              <TextArea rows={2} />
            </Form.Item>

            <Form.Item
              name="photos"
              label="Photos (Optional, max 10)"
              extra="Upload photos of completed work"
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                accept="image/*"
                maxCount={10}
                onChange={({ fileList }) => {
                  dailyForm.setFieldsValue({ photos: fileList });
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Button
              type="dashed"
              block
              icon={<PictureOutlined />}
              onClick={() => setUploadModalVisible(true)}
              className="mb-4"
            >
              Upload Single File via API Endpoint
            </Button>

            <Alert
              message="Note: Files will be uploaded to {{base_url}}/api/upload"
              type="info"
              showIcon
              className="mb-4"
            />

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submittingDaily}
                block
                size="large"
                icon={<CheckOutlined />}
              >
                Submit Daily Update
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>

      {/* File Upload Modal */}
      <Modal
        title="Upload File"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setUploadFile(null);
        }}
        onOk={handleFileUpload}
        confirmLoading={uploading}
        okText="Upload File"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Select File">
            <Upload
              beforeUpload={(file) => {
                setUploadFile(file);
                return false;
              }}
              maxCount={1}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          {uploadFile && (
            <Alert
              message={`Selected: ${uploadFile.name} (${(uploadFile.size / 1024).toFixed(2)} KB)`}
              type="info"
              showIcon
            />
          )}
          <Alert
            message="File will be uploaded to: {{base_url}}/api/upload and added to photos list"
            type="info"
            showIcon
            className="mt-4"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProjectFreelancer;