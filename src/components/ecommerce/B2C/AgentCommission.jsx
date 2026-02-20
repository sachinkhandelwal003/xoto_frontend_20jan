import { Card, Typography, Table, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function AgentCommission(){
const navigate = useNavigate();
  const commissions = [
    {
      key:1,
      client:"Rahul Mehta",
      project:"Sky Tower",
      amount:"₹45,000",
      status:"Pending"
    },
    {
      key:2,
      client:"Ali Hassan",
      project:"Downtown View",
      amount:"₹38,000",
      status:"Paid"
    }
  ];

  const getStatusColor=(status)=>{
    if(status==="Paid") return "green";
    if(status==="Pending") return "orange";
    return "default";
  };

  const columns=[
    { title:"Client", dataIndex:"client" },
    { title:"Project", dataIndex:"project" },
    { title:"Commission", dataIndex:"amount" },

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
      onClick={()=>navigate(`/dashboard/agent/commission/${record.key}`)}
    >
      View
    </Button>
  )
}
  ];

  return(
    <div className="p-6">

      <Title level={3}>Commission Tracking</Title>

      <Card className="shadow-sm rounded-xl">

        <Table
          columns={columns}
          dataSource={commissions}
          pagination={false}
          rowKey="key"
        />

      </Card>

    </div>
  )
}
