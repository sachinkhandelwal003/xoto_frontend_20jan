import { Card, Typography, Row, Col, Tag, Table, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";



const { Title, Text } = Typography;

export default function DeveloperProjectDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  const project={
    name:"Sky Tower",
    location:"Dubai Marina",
    units:120,
    sold:78,
    status:"Active"
  };

  const units=[
    {key:1,unit:"A-101",type:"2BHK",price:"1.2Cr",status:"Sold"},
    {key:2,unit:"A-102",type:"2BHK",price:"1.1Cr",status:"Available"},
    {key:3,unit:"A-103",type:"3BHK",price:"1.6Cr",status:"Booked"},
  ];

  const getColor=(s)=>{
    if(s==="Sold") return "blue";
    if(s==="Booked") return "orange";
    if(s==="Available") return "green";
  };

  const columns=[
    {title:"Unit",dataIndex:"unit"},
    {title:"Type",dataIndex:"type"},
    {title:"Price",dataIndex:"price"},
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

      <Title level={3}>{project.name}</Title>
      <Text type="secondary">{project.location}</Text>

      {/* PROJECT SUMMARY */}
      <Row gutter={16} className="mt-6 mb-6">

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Total Units</Text><br/>
            <Title level={4}>{project.units}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Sold</Text><br/>
            <Title level={4}>{project.sold}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Available</Text><br/>
            <Title level={4}>{project.units-project.sold}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Status</Text><br/>
            <Tag color="green">{project.status}</Tag>
          </Card>
        </Col>

      </Row>

      {/* UNITS TABLE */}
      <Card className="shadow-sm rounded-xl mt-6">

  <Title level={4}>Project Leads</Title>

  <Table
    rowKey="key"
    pagination={false}
    columns={[
      {title:"Client",dataIndex:"client"},
      {title:"Phone",dataIndex:"phone"},
      {title:"Interested Unit",dataIndex:"unit"},
      {
        title:"Status",
        dataIndex:"status",
        render:(s)=>(
          <Tag color={s==="Hot"?"red":s==="Warm"?"orange":"blue"}>
            {s}
          </Tag>
        )
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
    ]}
    dataSource={[
      {key:1,client:"Rahul Mehta",phone:"9876543210",unit:"A-101",status:"Hot"},
      {key:2,client:"Neha Gupta",phone:"9988776655",unit:"A-103",status:"Warm"},
      {key:3,client:"Ali Hassan",phone:"9123456780",unit:"A-102",status:"Cold"},
    ]}
  />

</Card>

    </div>
  );
}