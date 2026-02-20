import { Card, Typography, Row, Col, Input, Button, Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperAddUnit(){

  const navigate = useNavigate();

  return(
    <div className="p-6">

      <Title level={3}>Add Unit</Title>
      <Text type="secondary">Create a new unit for a project</Text>

      <Card className="shadow-sm rounded-xl mt-6">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Project</Text>
            <Select
              placeholder="Select project"
              style={{width:"100%"}}
              options={[
                {label:"Sky Tower",value:"sky"},
                {label:"Downtown View",value:"down"},
                {label:"Marina Heights",value:"marina"},
              ]}
            />
          </Col>

          <Col xs={24} md={12}>
            <Text>Unit Number</Text>
            <Input placeholder="Eg: A-101"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Unit Type</Text>
            <Select
              placeholder="Select type"
              style={{width:"100%"}}
              options={[
                {label:"Studio",value:"studio"},
                {label:"1BHK",value:"1"},
                {label:"2BHK",value:"2"},
                {label:"3BHK",value:"3"},
              ]}
            />
          </Col>

          <Col xs={24} md={12}>
            <Text>Price</Text>
            <Input placeholder="Enter price"/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Status</Text>
            <Select
              placeholder="Select status"
              style={{width:"100%"}}
              options={[
                {label:"Available",value:"available"},
                {label:"Booked",value:"booked"},
                {label:"Sold",value:"sold"},
              ]}
            />
          </Col>

          <Col span={24} className="mt-4">

            <Button
              style={{
                background:"#5c039b",
                borderColor:"#5c039b",
                color:"#fff",
                marginRight:10
              }}
              onClick={()=>navigate("/dashboard/developer/inventory")}
            >
              Save Unit
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