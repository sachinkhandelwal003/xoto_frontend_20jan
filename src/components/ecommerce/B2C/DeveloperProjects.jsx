import { Card, Typography, Table, Tag, Button, Input, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DeveloperProjects(){
  const navigate = useNavigate();

  const projects=[
    {
      key:1,
      name:"Sky Tower",
      location:"Dubai Marina",
      units:120,
      sold:78,
      status:"Active"
    },
    {
      key:2,
      name:"Downtown View",
      location:"Business Bay",
      units:90,
      sold:52,
      status:"Active"
    },
    {
      key:3,
      name:"Marina Heights",
      location:"JVC",
      units:60,
      sold:60,
      status:"Completed"
    }
  ];

  const getColor=(status)=>{
    if(status==="Active") return "green";
    if(status==="Completed") return "blue";
    return "default";
  };

  const columns=[

    {
      title:"Project",
      dataIndex:"name",
      render:(name,record)=>(
        <div>
          <Text strong>{name}</Text><br/>
          <Text type="secondary" style={{fontSize:12}}>
            {record.location}
          </Text>
        </div>
      )
    },

    {
      title:"Total Units",
      dataIndex:"units"
    },

    {
      title:"Sold",
      dataIndex:"sold"
    },

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
  render:(_,record)=>(
    <Button
      style={{
        background:"#5c039b",
        borderColor:"#5c039b",
        color:"#fff"
      }}
     onClick={() => navigate(`/dashboard/developer/developer-projects/${record.key}`)}
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
            Projects Management
          </Title>
          <Text type="secondary">
            Manage all developer projects & inventory status
          </Text>
        </Col>

        <Col>
         <Button
  icon={<PlusOutlined/>}
  style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
  onClick={()=>navigate("/dashboard/developer/developer-projects/add")}
>
  Add Project
</Button>
        </Col>

      </Row>

      {/* SEARCH */}
      <Card className="mb-4 shadow-sm rounded-xl">
        <Input
          placeholder="Search project..."
          prefix={<SearchOutlined/>}
        />
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={projects}
          pagination={{pageSize:5}}
          rowKey="key"
        />
      </Card>

    </div>
  );
}
