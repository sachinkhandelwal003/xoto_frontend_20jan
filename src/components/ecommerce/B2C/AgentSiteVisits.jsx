import { Card, Typography, Table, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function AgentSiteVisits(){

  const navigate = useNavigate();

  const visits = [
    {
      key:1,
      client:"Rahul Mehta",
      project:"Sky Tower",
      date:"22 Feb 2026",
      status:"Scheduled"
    },
    {
      key:2,
      client:"Ali Hassan",
      project:"Downtown View",
      date:"20 Feb 2026",
      status:"Completed"
    }
  ];

  const getStatusColor = (status)=>{
    if(status==="Scheduled") return "blue";
    if(status==="Completed") return "green";
    if(status==="Cancelled") return "red";
    return "default";
  };

  const columns = [
    { title:"Client", dataIndex:"client" },
    { title:"Project", dataIndex:"project" },
    { title:"Visit Date", dataIndex:"date" },

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
          onClick={()=>navigate(`/dashboard/agent/site-visits/${record.key}`)}
        >
          View
        </Button>
      )
    }
  ];

  return(
    <div className="p-6">

      <Title level={3}>Site Visits</Title>

      <Card className="shadow-sm rounded-xl">

        <Table
          columns={columns}
          dataSource={visits}
          pagination={false}
          rowKey="key"
        />

      </Card>

    </div>
  )
}
