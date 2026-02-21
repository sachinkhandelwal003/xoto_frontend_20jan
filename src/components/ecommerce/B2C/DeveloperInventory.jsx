import { Card, Typography, Table, Tag, Button, Row, Col, Select, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperInventory(){

  const navigate = useNavigate();

  const projects=[
    {label:"Sky Tower",value:"sky"},
    {label:"Downtown View",value:"down"},
    {label:"Marina Heights",value:"marina"}
  ];

  const units=[
    {key:1,unit:"A-101",project:"Sky Tower",type:"2BHK",price:"1.2Cr",status:"Sold"},
    {key:2,unit:"A-102",project:"Sky Tower",type:"2BHK",price:"1.1Cr",status:"Available"},
    {key:3,unit:"B-201",project:"Downtown View",type:"3BHK",price:"1.6Cr",status:"Booked"},
    {key:4,unit:"C-301",project:"Marina Heights",type:"Studio",price:"70L",status:"Available"},
  ];

  const getColor=(s)=>{
    if(s==="Sold") return "blue";
    if(s==="Booked") return "orange";
    if(s==="Available") return "green";
    return "default";
  };

  const columns=[

    { title:"Unit", dataIndex:"unit" },
    { title:"Project", dataIndex:"project" },
    { title:"Type", dataIndex:"type" },
    { title:"Price", dataIndex:"price" },

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
          onClick={()=>navigate(`/dashboard/developer/inventory/${record.key}`)}
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
          <Title level={3} style={{margin:0}}>Inventory / Units</Title>
          <Text type="secondary">Manage all project units & availability</Text>
        </Col>

        <Col>
          <Button
            icon={<PlusOutlined/>}
            style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
            onClick={()=>navigate("/dashboard/developer/inventory/add")}
          >
            Add Unit
          </Button>
        </Col>

      </Row>

      {/* FILTERS */}
      <Card className="mb-4 shadow-sm rounded-xl">

        <Row gutter={12}>

          <Col span={8}>
            <Select
              placeholder="Select Project"
              options={projects}
              style={{width:"100%"}}
            />
          </Col>

          <Col span={8}>
            <Input
              placeholder="Search unit..."
              prefix={<SearchOutlined/>}
            />
          </Col>

        </Row>

      </Card>

      {/* TABLE */}
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={units}
          pagination={{pageSize:6}}
          rowKey="key"
        />
      </Card>

    </div>
  );
}