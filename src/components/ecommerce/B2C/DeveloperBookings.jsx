import { Card, Typography, Table, Tag, Button, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperBookings(){

  const navigate = useNavigate();

  const bookings=[
    {key:1,client:"Rahul Mehta",unit:"A-101",project:"Sky Tower",amount:"1.2Cr",status:"Confirmed"},
    {key:2,client:"Ali Hassan",unit:"B-201",project:"Downtown View",amount:"1.6Cr",status:"Pending"},
    {key:3,client:"Neha Gupta",unit:"C-301",project:"Marina Heights",amount:"70L",status:"Completed"},
  ];

  const getColor=(s)=>{
    if(s==="Confirmed") return "green";
    if(s==="Pending") return "orange";
    if(s==="Completed") return "blue";
  };

  const columns=[

    {title:"Client",dataIndex:"client"},
    {title:"Project",dataIndex:"project"},
    {title:"Unit",dataIndex:"unit"},
    {title:"Amount",dataIndex:"amount"},

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
          onClick={()=>navigate(`/dashboard/developer/bookings/${record.key}`)}
        >
          View
        </Button>
      )
    }
  ];

  return(
    <div className="p-6">

      <Row justify="space-between" className="mb-6">
        <Col>
          <Title level={3} style={{margin:0}}>Bookings</Title>
          <Text type="secondary">All confirmed property bookings</Text>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm rounded-xl">
        <Input placeholder="Search booking..." prefix={<SearchOutlined/>}/>
      </Card>

      <Card className="shadow-sm rounded-xl">
        <Table columns={columns} dataSource={bookings} pagination={{pageSize:6}}/>
      </Card>

    </div>
  )
}