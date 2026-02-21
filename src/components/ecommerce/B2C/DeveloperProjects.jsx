import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Space,
  Statistic
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export default function DeveloperProjects(){

  const navigate = useNavigate();
  const { user, token } = useSelector(s=>s.auth);
  const developerId = user?._id || user?.id;

  const [projects,setProjects]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");

  // ================= FETCH =================
  useEffect(()=>{

    if(!developerId) return;

    const fetchProjects=async()=>{

      try{
        setLoading(true);

        const res=await fetch(
          `https://xoto.ae/api/property/get-all-properties?developerId=${developerId}`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );

        const json=await res.json();

        const mapped=(json?.data || []).map(p=>({

          key:p._id,
          name:p.propertyName,
          location:`${p.area || ""} ${p.city || ""}`,
          units:p.builtUpArea_min ? `${p.builtUpArea_min}-${p.builtUpArea_max}` : "-",
          sold:p.unitType?.length || 0,
          status:p.isAvailable ? "Available" : "Unavailable"

        }));

        setProjects(mapped);
        setFiltered(mapped);

      }catch(err){
        console.error(err);
      }
      finally{
        setLoading(false);
      }
    };

    fetchProjects();

  },[developerId,token]);

  // ================= SEARCH =================
  useEffect(()=>{
    const q=search.toLowerCase();
    setFiltered(
      projects.filter(p=>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      )
    );
  },[search,projects]);

  // ================= COLORS =================
  const getColor=(status)=>{
    return status==="Available" ? "green" : "red";
  };

  // ================= TABLE =================
  const columns=[

    {
      title:"Property",
      dataIndex:"name",
      render:(name,record)=>(
        <div>
          <Text strong style={{fontSize:15}}>{name}</Text><br/>
          <Text type="secondary" style={{fontSize:12}}>
            {record.location}
          </Text>
        </div>
      )
    },

    {
      title:"Area Range",
      dataIndex:"units",
      render:(u)=><Text>{u}</Text>
    },

    {
      title:"Unit Types",
      dataIndex:"sold",
      render:(s)=><Tag color="purple">{s}</Tag>
    },

    {
      title:"Status",
      dataIndex:"status",
      render:(status)=>
        <Tag color={getColor(status)} style={{padding:"2px 10px"}}>
          {status}
        </Tag>
    },

    {
      title:"Action",
      render:(_,record)=>(
        <Button
          type="primary"
          style={{
            background:"#6d28d9",
            borderColor:"#6d28d9",
            borderRadius:8,
            fontWeight:500
          }}
          onClick={()=>navigate(`/dashboard/developer/projects/${record.key}`)}
        >
          View Details
        </Button>
      )
    }

  ];

  // ================= UI =================
  return(
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <Row justify="space-between" align="middle" className="mb-6">

        <Col>
          <Title level={3} style={{margin:0}}>
            Developer Properties
          </Title>
          <Text type="secondary">
            Manage and track all your listed properties
          </Text>
        </Col>

        <Col>
          <Button
            icon={<PlusOutlined/>}
            size="large"
            style={{
              background:"#6d28d9",
              borderColor:"#6d28d9",
              color:"#fff",
              borderRadius:10,
              fontWeight:600
            }}
            onClick={()=>navigate("/dashboard/developer/projects/add")}
          >
            Add Property
          </Button>
        </Col>

      </Row>

      {/* STATS + SEARCH */}
      <Row gutter={[16,16]} className="mb-6">

        <Col xs={24} md={8}>
          <Card className="shadow-sm rounded-xl">
            <Statistic
              title="Total Properties"
              value={projects.length}
              prefix={<HomeOutlined style={{color:"#6d28d9"}} />}
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card className="shadow-sm rounded-xl">
            <Input
              size="large"
              placeholder="Search by property name or location..."
              prefix={<SearchOutlined/>}
              allowClear
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </Card>
        </Col>

      </Row>

      {/* TABLE */}
      <Card
        className="shadow-sm rounded-xl"
        bodyStyle={{padding:0}}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{
            pageSize:6,
            style:{padding:"16px"}
          }}
          rowKey="key"
        />
      </Card>

    </div>
  );
}