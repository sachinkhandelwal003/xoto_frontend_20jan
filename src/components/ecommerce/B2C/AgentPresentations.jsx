import { Card, Typography, Row, Col, Select, Input, Button, Switch, Divider } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentPresentations(){

  return(
    <div className="p-6">

      <Title level={3}>Presentation Generator</Title>

      <Row gutter={[16,16]}>

        {/* LEFT SIDE FORM */}
        <Col xs={24} lg={14}>

          <Card className="shadow-sm rounded-xl">

            <Title level={5}>Create Presentation</Title>

            <Row gutter={[16,16]}>

              <Col span={24}>
                <Text>Project</Text>
                <Select placeholder="Select project" style={{width:"100%"}}>
                  <Option value="1">Sky Tower</Option>
                  <Option value="2">Downtown View</Option>
                </Select>
              </Col>

              <Col span={24}>
                <Text>Client Name</Text>
                <Input placeholder="Enter client name"/>
              </Col>

              <Col span={24}>
                <Text>Template</Text>
                <Select placeholder="Choose template" style={{width:"100%"}}>
                  <Option value="modern">Modern</Option>
                  <Option value="minimal">Minimal</Option>
                  <Option value="corporate">Corporate</Option>
                </Select>
              </Col>

              <Divider/>

              <Col xs={12}>
                <Text>Show Price</Text><br/>
                <Switch defaultChecked/>
              </Col>

              <Col xs={12}>
                <Text>Show Location</Text><br/>
                <Switch defaultChecked/>
              </Col>

              <Col xs={12}>
                <Text>Show Developer</Text><br/>
                <Switch defaultChecked/>
              </Col>

              <Col xs={12}>
                <Text>Show Amenities</Text><br/>
                <Switch defaultChecked/>
              </Col>

              <Divider/>

              <Col span={24}>
                <Button type="primary" size="large" block>
                  Generate Presentation
                </Button>
              </Col>

            </Row>

          </Card>

        </Col>

        {/* RIGHT SIDE PREVIEW */}
        <Col xs={24} lg={10}>

          <Card className="shadow-sm rounded-xl">

            <Title level={5}>Preview</Title>

            <div className="bg-gray-100 rounded-lg h-[300px] flex items-center justify-center">
              <Text type="secondary">Presentation preview will appear here</Text>
            </div>

            <Divider/>

            <Row gutter={10}>
              <Col span={12}>
                <Button block>
                  Download PDF
                </Button>
              </Col>

              <Col span={12}>
                <Button type="primary" block>
                  Share Link
                </Button>
              </Col>
            </Row>

          </Card>

        </Col>

      </Row>

    </div>
  )
}
