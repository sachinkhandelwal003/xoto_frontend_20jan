import { Card, Typography, Table, Tag, Button, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DeveloperLeads(){

  const leads=[
    {
      key:1,
      client:"Rahul Mehta",
      project:"Sky Tower",
      agent:"Amit Sharma",
      phone:"9876543210",
      status:"New"
    },
    {
      key:2,
      client:"Ali Hassan",
      project:"Downtown View",
      agent:"Sana Khan",
      phone:"9123456789",
      status:"Follow Up"
    },
    {
      key:3,
      client:"Neha Gupta",
      project:"Marina Heights",
      agent:"Rohit Verma",
      phone:"9988776655",
      status:"Converted"
    }
  ];

  const getColor=(status)=>{
    if(status==="New") return "blue";
    if(status==="Follow Up") return "orange";
    if(status==="Converted") return "green";
    return "default";
  };

  const columns=[

    {
      title:"Client",
      dataIndex:"client",
      render:(text,record)=>(
        <div>
          <Text strong>{text}</Text><br/>
          <Text type="secondary" style={{fontSize:12}}>
            {record.phone}
          </Text>
        </div>
      )
    },

    { title:"Project", dataIndex:"project" },

    { title:"Agent", dataIndex:"agent" },

    {
      title:"Status",
      dataIndex:"status",
      render:(status)=>
        <Tag color={getColor(status)}>
          {status}
        </Tag>
    },

    {
      title:"Action",
      render:()=>(
        <Button
          style={{
            background:"#5c039b",
            borderColor:"#5c039b",
            color:"#fff"
          }}
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
          <Title level={3} style={{margin:0}}>
            Leads Tracking
          </Title>
          <Text type="secondary">
            Monitor all leads coming from agents
          </Text>
        </Col>

      </Row>

      {/* SEARCH */}
      <Card className="mb-4 shadow-sm rounded-xl">
        <Input
          placeholder="Search client / project / agent..."
          prefix={<SearchOutlined/>}
        />
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={leads}
          pagination={{pageSize:5}}
          rowKey="key"
        />
      </Card>

    </div>
  );
}
