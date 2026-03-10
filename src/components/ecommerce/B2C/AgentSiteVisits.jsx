import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Space
} from "antd";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentSiteVisits() {

  const navigate = useNavigate();

  const [visits,setVisits] = useState([]);
  const [loading,setLoading] = useState(false);

  // ================= FETCH SITE VISITS =================

  const fetchVisits = async () => {

    try{

      setLoading(true);

      const res = await apiService.get("/agent/lead/get-all-site-visits");

      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];

      setVisits(list);

    }catch(error){

      console.log(error);

    }finally{

      setLoading(false);

    }

  };

  useEffect(()=>{
    fetchVisits();
  },[]);

  // ================= STATUS COLOR =================

  const getStatusColor = (status) => {

    if(status === "scheduled") return "blue";
    if(status === "completed") return "green";
    if(status === "cancelled") return "red";
    if(status === "requested") return "orange";

    return "default";
  };

  // ================= SUMMARY =================

  const totalVisits = visits.length;

  const completed = visits.filter(v => v.status === "completed").length;

  const scheduled = visits.filter(v => v.status === "scheduled").length;

  const cancelled = visits.filter(v => v.status === "cancelled").length;

  // ================= TABLE =================

  const columns = [

    {
      title:"Client",
      render:(record)=>record?.lead?.name?.first_name + " " + record?.lead?.name?.last_name
    },

    {
      title:"Project",
      render:(record)=>record?.property?.propertyName || "-"
    },

    {
      title:"Visit Date",
      render:(record)=> new Date(record.requestedDate).toLocaleDateString()
    },

    {
      title:"Status",
      render:(record)=>(
        <Tag color={getStatusColor(record.status)} className="px-3 py-1 rounded-full">
          {record.status}
        </Tag>
      )
    },

    {
      title:"Action",
      render:(record)=>(
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={()=>navigate(`/dashboard/agent/site-visits/${record._id}`)}
          className="rounded-lg"
        >
          View
        </Button>
      )
    }

  ];

  return (

    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="mb-8">

        <Title level={2} className="!mb-1">
          Site Visit Management
        </Title>

        <Text type="secondary">
          Track all scheduled and completed property visits
        </Text>

      </div>

      {/* SUMMARY */}

      <Row gutter={[24,24]} className="mb-8">

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Total Visits"
              value={totalVisits}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Scheduled"
              value={scheduled}
              valueStyle={{color:"#2563eb"}}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Completed"
              value={completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{color:"#16a34a"}}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Cancelled"
              value={cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{color:"#dc2626"}}
            />
          </Card>
        </Col>

      </Row>

      {/* FILTER */}

      <Card bordered={false} className="shadow-lg rounded-2xl mb-6">

        <Space>

          <Input.Search
            placeholder="Search client or project"
            style={{width:250}}
          />

          <Select defaultValue="all" style={{width:180}}>
            <Option value="all">All Status</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

        </Space>

      </Card>

      {/* TABLE */}

      <Card bordered={false} className="shadow-lg rounded-2xl">

        <Table
          columns={columns}
          dataSource={visits}
          loading={loading}
          pagination={{pageSize:5}}
          rowKey="_id"
        />

      </Card>

    </div>

  );

}