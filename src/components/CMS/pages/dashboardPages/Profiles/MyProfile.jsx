// src/components/CMS/pages/dashboardPages/Profiles/MyProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  Avatar,
  Button,
  Tabs,
  Tag,
  Progress,
  List,
  Divider,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Timeline,
  Badge,
  Rate,
  Empty,
  Typography,
  Dropdown
} from 'antd';

import {
  EditOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
  EyeOutlined,
  MessageOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  BellOutlined,
  DownloadOutlined,
  PlusOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const MyProfile = () => {
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [form] = Form.useForm();

  const user = {
    name: "Alex Johnson",
    title: "Senior Landscape Designer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    cover: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&h=600&fit=crop",
    email: "alex.johnson@landscapely.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    joinDate: "January 2023",
    bio: "Award-winning landscape architect with 8+ years creating stunning outdoor spaces.",
    hourlyRate: "AED 450/hour",
    availability: "Available for new projects",
    skills: [
      { name: "Landscape Design", level: 98 },
      { name: "3D Rendering", level: 95 },
      { name: "AutoCAD", level: 92 },
      { name: "Plant Selection", level: 96 },
      { name: "Irrigation Systems", level: 88 },
      { name: "Project Management", level: 90 },
    ],
    stats: {
      projects: 87,
      clients: 64,
      rating: 4.9,
      earnings: "AED 1.2M+",
      completed: 82,
      inProgress: 5
    },
    recentProjects: [
      { name: "Palm Jumeirah Villa Garden", client: "Sheikh Ahmed", budget: "AED 380,000", status: "completed", rating: 5, date: "2 days ago" },
      { name: "Emirates Hills Rooftop Oasis", client: "Al Maktoum Family", budget: "AED 520,000", status: "in progress", rating: 4.9, date: "1 week ago" },
      { name: "Dubai Marina Penthouse Terrace", client: "Luxury Developments LLC", budget: "AED 280,000", status: "completed", rating: 5, date: "3 weeks ago" },
    ],
    education: [
      { degree: "Master in Landscape Architecture", school: "Harvard University", year: "2018", gpa: "3.9/4.0" },
      { degree: "Bachelor in Environmental Design", school: "UCLA", year: "2015", gpa: "3.8/4.0" },
    ],
    certifications: [
      { name: "Certified Landscape Professional (CLP)", issuer: "APLD", year: "2020" },
      { name: "LEED Accredited Professional", issuer: "USGBC", year: "2019" },
      { name: "Dubai Municipality Approved Designer", issuer: "Dubai Gov", year: "2018" },
    ]
  };

  const handleSave = (values) => {
    console.log('Updated profile:', values);
    message.success('Profile updated successfully!');
    setEditModal(false);
  };

  const menuItems = [
    { key: 'view', label: 'View Public Profile', icon: <EyeOutlined /> },
    { key: 'share', label: 'Share Profile', icon: <ShareAltOutlined /> },
    { key: 'download', label: 'Download Portfolio', icon: <DownloadOutlined /> },
    { type: 'divider' },
    { key: 'settings', label: 'Account Settings', icon: <SettingOutlined /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">

      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 ">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <Space>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} size="large">
                Back
              </Button>
              <Title level={3} style={{ margin: 0 }}>My Profile</Title>
            </Space>
            <Space>
              <Button icon={<BellOutlined />} type="text" size="large" />
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button icon={<MoreOutlined />} type="text" size="large" />
              </Dropdown>
            </Space>
          </div>
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="relative h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.cover})`, filter: 'brightness(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70" />

        <div className="absolute bottom-0 p-8 text-white w-full">
          <Row align="bottom" gutter={32}>
            <Col>
              <div className="relative">
                <Avatar size={160} src={user.avatar} className="border-8 border-white shadow-2xl" />
                <Upload>
                  <Button shape="circle" icon={<CameraOutlined />} size="large"
                          className="absolute bottom-4 right-4 bg-purple-600 text-white border-0" />
                </Upload>
              </div>
            </Col>

            <Col flex="auto">
              <Space direction="vertical">
                <div className="flex items-center gap-3">
                  <Title level={1} style={{ margin: 0, color: 'white' }}>{user.name}</Title>
                  <Tag icon={<CheckCircleOutlined />} color="success">Verified Pro</Tag>
                </div>

                <Title level={3} type="secondary" style={{ margin: 0, color: '#ddd' }}>
                  {user.title}
                </Title>

                <Space size="large" className="mt-4">
                  <Space><MailOutlined /> {user.email}</Space>
                  <Space><PhoneOutlined /> {user.phone}</Space>
                  <Space><EnvironmentOutlined /> {user.location}</Space>
                  <Space><DollarOutlined /> {user.hourlyRate}</Space>
                </Space>
              </Space>
            </Col>

            <Col>
              <Space>
                <Button size="large" icon={<MessageOutlined />}>Message</Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setEditModal(true)}
                  style={{ background: '#722ed1', border: 'none' }}
                >
                  Edit Profile
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 -mt-16">
        <Row gutter={[24, 24]}>

          {/* Left Side */}
          <Col xs={24} lg={8}>
            <Card className="text-center shadow-xl rounded-2xl mb-6">
              <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={3} className="text-green-600">{user.availability}</Title>
              <Text>Open to new opportunities</Text>
            </Card>

            <Card title="About Me" className="shadow-xl rounded-2xl mb-6">
              <Paragraph>{user.bio}</Paragraph>
              <Divider />
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text type="secondary">Member Since</Text>
                  <Text strong>{user.joinDate}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Response Time</Text>
                  <Tag color="purple">Within 1 hour</Tag>
                </div>
              </Space>
            </Card>

            <Card
              title="Top Skills"
              extra={<Text strong className="text-purple-600">{user.skills.length}+</Text>}
              className="shadow-xl rounded-2xl mb-6"
            >
              {user.skills.map((s, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <Text strong>{s.name}</Text>
                    <Text>{s.level}%</Text>
                  </div>
                  <Progress percent={s.level} strokeColor="#722ed1" showInfo={false} />
                </div>
              ))}
            </Card>

            <Card className="shadow-xl rounded-2xl">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Projects" value={user.stats.projects} prefix={<BookOutlined />} />
                </Col>
                <Col span={12}>
                  <Statistic title="Clients" value={user.stats.clients} prefix={<TeamOutlined />} />
                </Col>
                <Col span={12}>
                  <Statistic title="Rating" value={user.stats.rating} prefix={<StarOutlined />} />
                </Col>
                <Col span={12}>
                  <Statistic title="Earnings" value={user.stats.earnings} prefix={<DollarOutlined />} />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* RIGHT SECTION */}
          <Col xs={24} lg={16}>
            <Card className="shadow-xl rounded-2xl">
              <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">

                {/* Projects Tab */}
                <TabPane
                  tab={<>Projects <Badge count={user.stats.projects} /></>}
                  key="projects"
                >
                  <List
                    dataSource={user.recentProjects}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ background: '#722ed1' }}>{item.name[0]}</Avatar>}
                          title={item.name}
                          description={<>Client: {item.client} • {item.budget}</>}
                        />
                        <Space>
                          <Tag color={item.status === 'completed' ? 'green' : 'blue'}>
                            {item.status}
                          </Tag>
                          <Rate disabled value={item.rating} />
                        </Space>
                      </List.Item>
                    )}
                  />
                </TabPane>

                {/* Education */}
                <TabPane tab="Education" key="education">
                  <Timeline>
                    {user.education.map((e, i) => (
                      <Timeline.Item key={i} color="purple">
                        <Title level={5}>{e.degree}</Title>
                        <Text type="secondary">{e.school} • {e.year}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </TabPane>

                {/* Certifications */}
                <TabPane tab="Certifications" key="certifications">
                  {user.certifications.map((c, i) => (
                    <Card key={i} className="mb-4" hoverable>
                      <Title level={5}>{c.name}</Title>
                      <Text type="secondary">{c.issuer} • {c.year}</Text>
                    </Card>
                  ))}
                </TabPane>

              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onCancel={() => setEditModal(false)} footer={null} width={800}>
        <Title level={2} className="text-center text-purple-700">Edit Profile</Title>

        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={user}>
          <Row gutter={24}>
            <Col span={24} className="text-center mb-6">
              <Upload>
                <Avatar size={120} src={user.avatar} />
              </Upload>
            </Col>

            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="title" label="Title">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="bio" label="Bio">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Space className="w-full justify-end mt-6">
            <Button onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#722ed1' }}>Save</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProfile;
