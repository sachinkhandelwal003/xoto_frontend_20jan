import { Card, Typography, Row, Col, Input, Button, Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DeveloperAddProject(){

  const navigate = useNavigate();

  return(
    <div className="p-6">

      <Title level={3}>Add New Project</Title>
      <Text type="secondary">Create a new real estate project</Text>

      <Card className="shadow-sm rounded-xl mt-6">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Project Name</Text>
            <Input placeholder="Enter project name"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Location</Text>
            <Input placeholder="Enter project location"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Total Units</Text>
            <Input placeholder="Enter total units"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Status</Text>
            <Select
              placeholder="Select status"
              style={{width:"100%"}}
              options={[
                {label:"Active",value:"active"},
                {label:"Completed",value:"completed"},
                {label:"Upcoming",value:"upcoming"}
              ]}
            />
          </Col>

          <Col span={24}>
            <Text>Description</Text>
            <TextArea rows={4} placeholder="Project description"/>
          </Col>

          <Col span={24} className="mt-4">

            <Button
              style={{
                background:"#5c039b",
                borderColor:"#5c039b",
                color:"#fff",
                marginRight:10
              }}
              onClick={()=>navigate("/dashboard/developer/projects")}
            >
              Save Project
            </Button>

            <Button onClick={()=>navigate(-1)}>
              Cancel
            </Button>

          </Col>

        </Row>

      </Card>

    </div>
  );
}