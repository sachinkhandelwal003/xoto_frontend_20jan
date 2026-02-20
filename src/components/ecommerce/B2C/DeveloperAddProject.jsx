import { Card, Typography, Input, Button, Row, Col, Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperAddProject(){

  const navigate = useNavigate();

  return(
    <div className="p-6">

      <Title level={3}>Add New Project</Title>

      <Card className="shadow-sm rounded-xl">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Project Name</Text>
            <Input placeholder="Enter project name"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Location</Text>
            <Input placeholder="Enter location"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Total Units</Text>
            <Input placeholder="Enter number of units"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Status</Text>
            <Select style={{width:"100%"}}>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
            </Select>
          </Col>

          <Col span={24}>

            <Button
              type="primary"
              size="large"
              style={{
                background:"#5c039b",
                borderColor:"#5c039b"
              }}
              onClick={()=>navigate("/projects")}
            >
              Save Project
            </Button>

          </Col>

        </Row>

      </Card>

    </div>
  );
}
