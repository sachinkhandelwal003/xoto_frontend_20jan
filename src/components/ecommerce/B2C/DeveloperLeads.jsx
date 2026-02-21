import { Card, Typography, Table, Tag, Button, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperLeads(){

  const navigate = useNavigate();

  const leads=[
    {
      key:1,
      name:"Rahul Mehta",
      project:"Sky Tower",
      budget:"1.2Cr",
      agent:"Amit Sharma",
      status:"New"
    },
    {
      key:2,
      name:"Ali Hassan",
      project:"Downtown View",
      budget:"1Cr",
      agent:"Vikas Singh",
      status:"Site Visit"
    },
    {
      key:3,
      name:"Neha Gupta",
      project:"Marina Heights",
      budget:"90L",
      agent:"Amit Sharma",
      status:"Negotiation"
    }
  ];

  const getColor=(s)=>{
    if(s==="New") return "blue";
    if(s==="Site Visit") return "orange";
    if(s==="Negotiation") return "purple";
    if(s==="Booked") return "green";
    return "default";
  };

  const columns=[

    {
      title:"Client",
      dataIndex:"name"
    },

    {
      title:"Project",
      dataIndex:"project"
    },

    {
      title:"Budget",
      dataIndex:"budget"
    },

    {
      title:"Agent",
      dataIndex:"agent"
    },

    {
      title:"Status",
      dataIndex:"status",
      render:(s)=><Tag color={getColor(s)}>{s}</Tag>
    },

    {
      title:"Action",
      render:(_,record)=>(
        <Button
          style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
          onClick={()=>navigate(`/dashboard/developer/leads/${record.key}`)}
        >
          View
        </Button>
      )
    }

  ];

  return(
    <div className="p-6">

      {/* HEADER */}
      <Row justify="space-between" align="middle" className="mb-6">

        <Col>
          <Title level={3} style={{margin:0}}>Leads Tracking</Title>
          <Text type="secondary">
            Monitor all incoming leads & assigned agents
          </Text>
        </Col>

      </Row>

      {/* SEARCH */}
      <Card className="mb-4 shadow-sm rounded-xl">
        <Input
          placeholder="Search lead..."
          prefix={<SearchOutlined/>}
        />
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={leads}
          pagination={{pageSize:6}}
        />
      </Card>

    </div>
  );
}