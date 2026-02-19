import { Card, Typography, Row, Col, Input, Select, Button } from "antd";

const { Title, Text } = Typography;
const { Search } = Input;

const projects = [
  {
    id:1,
    name:"Sky Tower",
    location:"Dubai Marina",
    price:"1.2Cr - 1.8Cr"
  },
  {
    id:2,
    name:"Downtown View",
    location:"Downtown Dubai",
    price:"90L - 1.3Cr"
  }
];

export default function AgentProjects(){

  return(
    <div className="p-6">

      <Title level={3}>Projects</Title>

      {/* FILTERS */}
      <Card className="mb-6 shadow-sm rounded-xl">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Search placeholder="Search project..." />
          </Col>

          <Col xs={24} md={6}>
            <Select style={{width:"100%"}} placeholder="Location">
              <Select.Option value="dubai">Dubai</Select.Option>
              <Select.Option value="india">India</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={4}>
            <Button type="primary" block>
              Filter
            </Button>
          </Col>
        </Row>
      </Card>

      {/* PROJECT CARDS */}
      <Row gutter={[16,16]}>
        {projects.map(p=>(
          <Col xs={24} md={12} lg={8} key={p.id}>
            <Card hoverable className="shadow-sm rounded-xl">
              <Title level={5}>{p.name}</Title>
              <Text type="secondary">{p.location}</Text>
              <div className="mt-2">
                <Text strong>{p.price}</Text>
              </div>

              <Button type="link" className="p-0 mt-3">
                View Details
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

    </div>
  )
}
