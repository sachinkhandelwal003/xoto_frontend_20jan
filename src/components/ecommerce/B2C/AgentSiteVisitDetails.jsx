import { Card, Typography, Button, Tag } from "antd";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentSiteVisitDetails(){

  const { id } = useParams();

  return(
    <div className="p-6">

      <Title level={3}>Site Visit Details</Title>

      <Card className="shadow-sm rounded-xl">

        <div className="mb-3">
          <Text type="secondary">Client</Text><br/>
          <Text strong>Rahul Mehta</Text>
        </div>

        <div className="mb-3">
          <Text type="secondary">Project</Text><br/>
          <Text strong>Sky Tower</Text>
        </div>

        <div className="mb-3">
          <Text type="secondary">Visit Date</Text><br/>
          <Text strong>22 Feb 2026</Text>
        </div>

        <Tag color="blue">Scheduled</Tag>

        <Button type="primary" className="mt-4" block>
          Mark Visit Completed
        </Button>

      </Card>

    </div>
  )
}
