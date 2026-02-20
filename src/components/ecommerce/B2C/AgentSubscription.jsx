import { Card, Typography, Button, Tag } from "antd";

const { Title, Text } = Typography;

const AgentSubscription = () => {
  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm rounded-xl">
        <Title level={3}>My Subscription</Title>

        <Text type="secondary">Current Plan</Text>
        <Title level={4}>Pro Plan</Title>

        <Tag color="green">Active</Tag>

        <div className="mt-3">
          <Text type="secondary">Valid till: 30 March 2026</Text>
        </div>

        <div className="mt-5">
          <Button type="primary">Upgrade Plan</Button>
        </div>
      </Card>
    </div>
  );
};

export default AgentSubscription;
