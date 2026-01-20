// src/pages/freelancer/MyProjects.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Progress,
  Button,
  Drawer,
  Form,
  Input,
  Tag,
  Typography,
  Empty,
  Row,
  Col,
  Statistic,
  Timeline,
  Badge,
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
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import { showConfirmDialog } from "../../../../../../../manageApi/utils/sweetAlert";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const API_BASE =  "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
const MyProjects = () => {
  const { user } = useSelector((s) => s.auth);

  /* ------------------------------- State ----------------------------------- */
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drawers
  const [projDrawerOpen, setProjDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [dailyDrawerOpen, setDailyDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submittingDaily, setSubmittingDaily] = useState(false);
  const [dailyErrors, setDailyErrors] = useState([]);

  const [dailyForm] = Form.useForm();

  /* --------------------------- API Calls ----------------------------------- */
  const fetchMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { success, projects: fetched, message: msg } = await apiService.get(
        "/freelancer/projects/my"
      );
      if (success) setProjects(fetched || []);
      else message.error(msg || "Failed to load projects");
    } catch (err) {
      console.error(err);
      message.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProjects = async () => {
    setRefreshing(true);
    await fetchMyProjects();
    setRefreshing(false);
    message.success("Projects refreshed");
  };

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  /* --------------------------- Helpers ------------------------------------- */
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
    const now = moment();
    const start = moment(m.start_date);
    const end = moment(m.end_date);
    return now.isBetween(start, end, "day", "[]");
  };

  const canAddDailyUpdate = (m) => {
    if (!["pending", "in_progress"].includes(m.status)) return false;
    if (!isMilestoneActive(m)) return false;
    const today = moment().startOf("day");
    return !m.daily_updates?.some(
      (u) => u.updated_by === user._id && moment(u.date).isSame(today, "day")
    );
  };

  const calculateProgress = (milestones) => {
    const active = milestones?.filter((m) => !m.is_deleted) || [];
    if (!active.length) return 0;
    const done = active.filter((m) => ["approved", "completed"].includes(m.status)).length;
    return Math.round((done / active.length) * 100);
  };

  const daysRemaining = (due) => moment(due).diff(moment(), "days");

  const dueStatus = (due, status) => {
    if (["approved", "completed"].includes(status)) return "success";
    const d = daysRemaining(due);
    if (d < 0) return "error";
    if (d <= 3) return "warning";
    return "success";
  };

  /* -------------------------- Drawer Handlers ------------------------------ */
  const openProjectDrawer = (proj) => {
    setSelectedProject(proj);
    setProjDrawerOpen(true);
  };

  const closeProjectDrawer = () => {
    setProjDrawerOpen(false);
    setSelectedProject(null);
  };

  const openDailyDrawer = (milestone) => {
    // if (!canAddDailyUpdate(milestone)) {
    //   const start = moment(milestone.start_date).format("DD MMM YYYY");
    //   const end = moment(milestone.end_date).format("DD MMM YYYY");
    //   message.warning(
    //     `Milestone active only from ${start} to ${end}. You may have already submitted today.`
    //   );
    //   return;
    // }
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

  const requestPaymentRelease = async (projId, milId) => {
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
        `/freelancer/projects/${projId}/milestones/${milId}/release`
      );
      if (success) {
        message.success("Payment release requested");
        fetchMyProjects();
      } else message.error(msg || "Failed");
    } catch (e) {
      message.error("Error requesting release");
    }
  };

  /* -------------------------- Submit Daily Update -------------------------- */
  const submitDailyUpdate = async (values) => {
    if (!selectedProject || !selectedMilestone) return;

    setSubmittingDaily(true);
    setDailyErrors([]);

    try {
      const formData = new FormData();
      formData.append("work_done", values.work_done);
      formData.append("notes", values.notes || "");
      formData.append("date", values.date.format("YYYY-MM-DD"));

      const photos = values.photos?.fileList?.map((f) => f.originFileObj).filter(Boolean) || [];
      photos.forEach((file) => formData.append("photos", file));

      const res = await apiService.upload(
        `/freelancer/projects/${selectedProject._id}/milestones/${selectedMilestone._id}/daily`,
        formData
      );

      if (res.success) {
        message.success("Daily update submitted successfully!");
        fetchMyProjects();
        closeDailyDrawer();
      } else {
        // Handle validation errors
        if (res.errors && Array.isArray(res.errors)) {
          const errorMessages = res.errors.map((e) => e.msg);
          setDailyErrors(errorMessages);

          const fieldErrors = res.errors.reduce((acc, e) => {
            acc[e.param] = { errors: [new Error(e.msg)] };
            return acc;
          }, {});
          dailyForm.setFields(Object.keys(fieldErrors).map((name) => ({
            name,
            errors: fieldErrors[name].errors,
          })));
        } else {
          message.error(res.message || "Failed to submit update");
        }
      }
    } catch (e) {
      const res = e?.response?.data;
      if (res?.errors && Array.isArray(res.errors)) {
        const errorMessages = res.errors.map((err) => err.msg || err.message);
        setDailyErrors(errorMessages);
        dailyForm.setFields(
          res.errors.map((err) => ({
            name: err.param || err.field,
            errors: [new Error(err.msg || err.message)],
          }))
        );
      } else {
        message.error("Network error. Please try again.");
      }
    } finally {
      setSubmittingDaily(false);
    }
  };

  /* ------------------------------ UI --------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="p-6">
        <Title level={3}>My Assigned Projects</Title>
        <Card>
          <Empty description="No projects assigned yet." />
        </Card>
      </div>
    );
  }

  const totalRevenue = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const inProgress = projects.filter((p) => p.status === "in_progress").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>My Assigned Projects</Title>
        <Button icon={<ReloadOutlined />} onClick={refreshProjects} loading={refreshing}>
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Total Projects" value={projects.length} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgress}
              valueStyle={{ color: "#1890ff" }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(v) => `$${v.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Project List */}
      {projects.map((proj) => {
        const prog = calculateProgress(proj.milestones);
        return (
          <Card
            key={proj._id}
            className="mb-6 shadow-lg"
            title={
              <Space className="w-full justify-between">
                <Space>
                  <Text strong>{proj.title}</Text>
                  <Tag color={getStatusColor(proj.status)}>
                    {proj.status.replace("_", " ").toUpperCase()}
                  </Tag>
                </Space>
                <Button type="link" icon={<EyeOutlined />} onClick={() => openProjectDrawer(proj)}>
                  View Details
                </Button>
              </Space>
            }
            extra={<Text type="secondary">Budget: ${proj.budget?.toLocaleString()}</Text>}
          >
            <Row gutter={16} className="mb-4">
              <Col span={8}>
                <Space>
                  <EnvironmentOutlined />
                  <Text>{proj.city || "—"}</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space>
                  <CalendarOutlined />
                  <Text>
                    {proj.start_date ? moment(proj.start_date).format("DD MMM YYYY") : "—"}
                  </Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space>
                  <UserOutlined />
                  <Text>{proj.client_name}</Text>
                </Space>
              </Col>
            </Row>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <Text strong>Project Progress</Text>
                <Text strong>{prog}%</Text>
              </div>
              <Progress percent={prog} status={prog === 100 ? "success" : "active"} />
            </div>
          </Card>
        );
      })}

      {/* ==================== PROJECT DETAIL DRAWER ==================== */}
      <Drawer
        title="Project Details"
        open={projDrawerOpen}
        onClose={closeProjectDrawer}
        width={800}
        destroyOnClose
      >
        {selectedProject && (
          <>
            <Descriptions title="Basic Info" bordered column={1}>
              <Descriptions.Item label="Title">{selectedProject.title}</Descriptions.Item>
              <Descriptions.Item label="Client">
                {selectedProject.client_name}
                {selectedProject.client_company && (
                  <Text type="secondary"> ({selectedProject.client_company})</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Budget">
                <Text strong>${selectedProject.budget?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedProject.status)}>
                  {selectedProject.status.replace("_", " ").toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Milestones</Title>

            <Timeline>
              {(selectedProject.milestones || [])
                .filter((m) => !m.is_deleted)
                .map((mil, idx) => {
                  const active = isMilestoneActive(mil);
                  const canAdd = canAddDailyUpdate(mil);
                  const dueDays = daysRemaining(mil.due_date);
                  const dueStat = dueStatus(mil.due_date, mil.status);
                  const milestoneNum = idx + 1;

                  return (
                    <Timeline.Item
                      key={mil._id}
                      dot={
                        mil.status === "approved" || mil.status === "completed" ? (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        ) : mil.status === "release_requested" ? (
                          <ClockCircleOutlined style={{ color: "#faad14" }} />
                        ) : (
                          <NumberOutlined style={{ color: "#1890ff" }} />
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
                            <Space direction="vertical" size={2}>
                              <Space>
                                <Text strong>Milestone {milestoneNum}: {mil.title}</Text>
                                <Tag color={getStatusColor(mil.status)}>
                                  {formatMilestoneStatus(mil.status)}
                                </Tag>
                                {!active && (
                                  <Tag color="gray">
                                    {moment(mil.start_date).format("DD MMM")} -{" "}
                                    {moment(mil.end_date).format("DD MMM")}
                                  </Tag>
                                )}
                                {dueStat === "error" && <Tag color="red">Overdue</Tag>}
                                {dueStat === "warning" && <Tag color="orange">Due Soon</Tag>}
                              </Space>

                              <Text type="secondary">
                                Due: {moment(mil.due_date).format("DD MMM YYYY")}{" "}
                                {dueDays >= 0
                                  ? `(${dueDays} day${dueDays !== 1 ? "s" : ""} left)`
                                  : `(${Math.abs(dueDays)} day${Math.abs(dueDays) !== 1 ? "s" : ""} overdue)`}
                              </Text>

                              <Text strong>Amount: ${mil.amount?.toLocaleString()}</Text>
                            </Space>

                            <Space direction="vertical" align="center">
                              <Text strong>{mil.progress || 0}%</Text>
                              <Progress
                                type="circle"
                                percent={mil.progress || 0}
                                width={60}
                                status={mil.progress === 100 ? "success" : "active"}
                              />
                            </Space>
                          </div>

                          <Progress
                            percent={mil.progress || 0}
                            size="small"
                            status={mil.progress === 100 ? "success" : "active"}
                          />

                          <Space wrap>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => openDailyDrawer(mil)}
                              // disabled={!canAdd}
                            >
                              Add Daily Update
                            </Button>

                            {mil.daily_updates?.length > 0 && (
                              <Button
                                size="small"
                                icon={<FileTextOutlined />}
                                onClick={() => {
                                  setSelectedMilestone(mil);
                                  setDailyDrawerOpen(true);
                                }}
                              >
                                View Updates ({mil.daily_updates.length})
                              </Button>
                            )}

                            {mil.progress === 100 && mil.status === "in_progress" && (
                              <Popconfirm
                                title="Request for approval?"
                                onConfirm={() => requestPaymentRelease(selectedProject._id, mil._id)}
                              >
                                <Button type="dashed" size="small" icon={<DollarOutlined />}>
                                  Approval Request
                                </Button>
                              </Popconfirm>
                            )}
                          </Space>

                          {/* Daily Updates List */}
                          {mil.daily_updates?.length > 0 && (
                            <Collapse className="mt-3">
                              <Panel header={`Daily Updates (${mil.daily_updates.length})`} key="1">
                                <List
                                  dataSource={mil.daily_updates
                                    .slice()
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))}
                                  renderItem={(upd, i) => (
                                    <List.Item key={upd._id}>
                                      <Card
                                        size="small"
                                        className={
                                          upd.approval_status === "rejected" ? "border-red-200" : ""
                                        }
                                      >
                                        <Space direction="vertical" style={{ width: "100%" }}>
                                          <Space>
                                            <Text strong>#{mil.daily_updates.length - i}</Text>
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
                                                    src={`${API_BASE}/${url}`}
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
          </>
        )}
      </Drawer>

      {/* ==================== DAILY UPDATE DRAWER (WITH DATE PICKER) ==================== */}
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
              <Descriptions.Item label="Milestone">{selectedMilestone.title}</Descriptions.Item>
              <Descriptions.Item label="Progress">{selectedMilestone.progress || 0}%</Descriptions.Item>
              <Descriptions.Item label="Amount">
                ${selectedMilestone.amount?.toLocaleString()}
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
                    if (!value) return Promise.reject();
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
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                accept="image/*"
                maxCount={10}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Alert
              message="Only one update per day per milestone"
              type="warning"
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
    </div>
  );
};

export default MyProjects;