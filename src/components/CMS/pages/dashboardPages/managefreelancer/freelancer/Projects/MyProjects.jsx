// src/pages/freelancer/MyProjects.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Progress,
  Button,
  Tag,
  Typography,
  Empty,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Spin,
  Pagination,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

/* -------------------------------------------------------------------------- */
/*                              UTILITY FUNCTIONS                             */
/* -------------------------------------------------------------------------- */
const flattenProjectsForSearch = (projects) => {
  return projects.map(project => {
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(m => 
      m.status === "completed" || m.status === "approved"
    ).length;
    
    const projectProgress = milestones.length > 0 
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
    
    return {
      ...project,
      progress: projectProgress,
      client_name: project.client_name || 
                   (project.customer?.name?.first_name + " " + project.customer?.name?.last_name) || 
                   "Unknown",
      budget: project.budget || 0,
      status: project.status || "pending",
      city: project.city || "",
      start_date: project.start_date || new Date().toISOString(),
    };
  });
};

const getActiveMilestones = (milestones = []) => {
  return milestones.filter(m => !m.is_deleted);
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
const MyProjects = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  /* ------------------------------- State ----------------------------------- */
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Role Mapping for URL navigation
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};
const roleSlug = roleSlugMap[user?.role] || "freelancer";

  /* --------------------------- API Calls ----------------------------------- */
  const fetchMyProjects = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          freelancer: user?.id,
        };

        const response = await apiService.get("/freelancer/projects", params);

        if (response && response.projects) {
          const flattenedProjects = flattenProjectsForSearch(response.projects);
          setProjects(flattenedProjects);
        } else {
          const projectsData = response.data?.projects || response || [];
          const flattenedProjects = flattenProjectsForSearch(projectsData);
          setProjects(flattenedProjects);
        }

        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalResults: response.pagination.total || 0,
            itemsPerPage: response.pagination.limit || 10,
          });
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        message.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const refreshProjects = async () => {
    setRefreshing(true);
    await fetchMyProjects(pagination.currentPage);
    setRefreshing(false);
    message.success("Projects refreshed");
  };

  const handlePageChange = (page, pageSize) => {
    fetchMyProjects(page, pageSize);
  };

 const viewProjectDetails = (projectId) => {
  navigate(`/dashboard/${roleSlug}/projects/manage/${projectId}`);
};


  useEffect(() => {
    if (user?.id) {
      fetchMyProjects();
    }
  }, [fetchMyProjects, user?.id]);

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

  const calculateProjectProgress = (project) => {
    const activeMilestones = getActiveMilestones(project.milestones);
    if (!activeMilestones.length) return 0;
    
    const completed = activeMilestones.filter((m) => 
      ["approved", "completed"].includes(m.status)
    ).length;
    return Math.round((completed / activeMilestones.length) * 100);
  };

  const getClientName = (project) => {
    if (project.client_name) return project.client_name;
    if (project.customer) {
      const firstName = project.customer.name?.first_name || "";
      const lastName = project.customer.name?.last_name || "";
      return `${firstName} ${lastName}`.trim();
    }
    return "Unknown Client";
  };

  /* ------------------------------ UI --------------------------------------- */
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!projects.length && !loading) {
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
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refreshProjects} 
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Projects" 
              value={projects.length} 
              prefix={<FileTextOutlined />} 
            />
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
        const prog = calculateProjectProgress(proj);
        const clientName = getClientName(proj);
        const activeMilestones = getActiveMilestones(proj.milestones || []);
        
        return (
          <Card
            key={proj._id}
            className="mb-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => viewProjectDetails(proj._id)}
            title={
              <Space className="w-full justify-between">
                <Space>
                  <Text strong>{proj.title}</Text>
                  <Tag color={getStatusColor(proj.status)}>
                    {proj.status.replace("_", " ").toUpperCase()}
                  </Tag>
                </Space>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    viewProjectDetails(proj._id);
                  }}
                >
                  View Details
                </Button>
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary">
                  Budget: ${(proj.budget || 0).toLocaleString()}
                </Text>
                {proj.Code && (
                  <Tag color="blue">{proj.Code}</Tag>
                )}
              </Space>
            }
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
                  <Text>{clientName}</Text>
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

            {/* Project Summary */}
            <Row gutter={16} className="mt-4">
              <Col span={8}>
                <Text type="secondary">Milestones: </Text>
                <Text strong>{activeMilestones.length}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Duration: </Text>
                <Text strong>
                  {proj.start_date ? moment(proj.start_date).format("MMM DD") : "—"} 
                  {" to "}
                  {proj.end_date ? moment(proj.end_date).format("MMM DD, YYYY") : "—"}
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Created: </Text>
                <Text strong>
                  {proj.createdAt ? moment(proj.createdAt).format("DD MMM YYYY") : "—"}
                </Text>
              </Col>
            </Row>

            <div className="mt-4 text-right">
              <Button 
                type="primary" 
                icon={<ArrowRightOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  viewProjectDetails(proj._id);
                }}
              >
                View Full Details
              </Button>
            </div>
          </Card>
        );
      })}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalResults}
            pageSize={pagination.itemsPerPage}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} projects`
            }
          />
        </div>
      )}
    </div>
  );
};

export default MyProjects;