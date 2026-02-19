import { Card, Typography, Row, Col, Tag, Steps, Button } from "antd";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;

export default function AgentDealDetails(){

  const { id } = useParams();

  // dummy data (later from backend)
  const deal = {
    client:"Rahul Mehta",
    project:"Sky Tower",
    amount:"1.4Cr",
    commission:"₹45,000",
    stage:2
  };

  return(
    <div className="p-6">

      <Title level={3}>Deal Details</Title>

      <Row gutter={[16,16]}>

        {/* INFO */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">

            <Title level={5}>{deal.client}</Title>

            <div className="mb-2">
              <Text type="secondary">Project</Text><br/>
              <Text>{deal.project}</Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">Deal Amount</Text><br/>
              <Text strong>{deal.amount}</Text>
            </div>

            <div className="mb-2">
              <Text type="secondary">Commission</Text><br/>
              <Text strong>{deal.commission}</Text>
            </div>

            <Tag color="blue">Active Deal</Tag>

          </Card>
        </Col>

        {/* TIMELINE */}
        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-xl">

            <Title level={5}>Deal Progress</Title>

            <Steps current={deal.stage} direction="vertical">
              <Step title="Booked"/>
              <Step title="Deposit Paid"/>
              <Step title="Contract Signed"/>
              <Step title="Commission Pending"/>
              <Step title="Commission Paid"/>
            </Steps>

            <Button className="mt-6" type="primary" block>
              Mark Commission Paid
            </Button>

          </Card>
        </Col>

      </Row>

    </div>
  )
}
