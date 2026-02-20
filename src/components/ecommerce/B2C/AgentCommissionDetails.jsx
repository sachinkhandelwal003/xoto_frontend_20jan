import { Card, Typography, Tag, Button } from "antd";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentCommissionDetails(){

  const { id } = useParams();

  return(
    <div className="p-6">

      <Title level={3}>Commission Details</Title>

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
          <Text type="secondary">Commission Amount</Text><br/>
          <Text strong>₹45,000</Text>
        </div>

        <Tag color="orange">Pending</Tag>

        <Button type="primary" className="mt-4" block>
          Mark as Received
        </Button>

      </Card>

    </div>
  )
}
