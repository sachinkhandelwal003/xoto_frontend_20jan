import { Card, Typography, Table, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function AgentDeals(){

  const navigate = useNavigate();

  const deals = [
    {
      key:1,
      client:"Rahul Mehta",
      project:"Sky Tower",
      amount:"1.4Cr",
      status:"Booked"
    },
    {
      key:2,
      client:"Ali Hassan",
      project:"Downtown View",
      amount:"1.1Cr",
      status:"Contract Signed"
    },
    {
      key:3,
      client:"Neha Gupta",
      project:"Marina Heights",
      amount:"95L",
      status:"Commission Pending"
    }
  ];

  const getStatusColor = (status)=>{
    if(status==="Booked") return "blue";
    if(status==="Contract Signed") return "green";
    if(status==="Commission Pending") return "orange";
    return "default";
  };

  const columns = [
    { title:"Client", dataIndex:"client" },
    { title:"Project", dataIndex:"project" },
    { title:"Amount", dataIndex:"amount" },

    {
      title:"Status",
      dataIndex:"status",
      render:(status)=>(
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },

    {
      title:"Action",
      render:(record)=>(
        <Button
          type="link"
          onClick={()=>navigate(`/dashboard/agent/deals/${record.key}`)}

        >
          View
        </Button>
      )
    }
  ];

  return(
    <div className="p-6">

      <Title level={3}>Deals Management</Title>

      <Card className="shadow-sm rounded-xl">

        <Table
          columns={columns}
          dataSource={deals}
          pagination={false}
          rowKey="key"
        />

      </Card>

    </div>
  )
}
