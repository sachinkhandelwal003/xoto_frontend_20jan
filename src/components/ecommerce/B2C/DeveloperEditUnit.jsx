import { Card, Typography, Row, Col, Input, Select, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperEditUnit(){

  const { id } = useParams();
  const navigate = useNavigate();

  // mock existing data
  const unit={
    unit:"A-101",
    project:"Sky Tower",
    type:"2BHK",
    price:"1.2Cr",
    status:"Sold"
  };

  return(
    <div className="p-6">

      <Title level={3}>Edit Unit</Title>
      <Text type="secondary">Update unit information</Text>

      <Card className="shadow-sm rounded-xl mt-6">

        <Row gutter={[16,16]}>

          <Col xs={24} md={12}>
            <Text>Unit Number</Text>
            <Input defaultValue={unit.unit}/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Project</Text>
            <Select
              defaultValue={unit.project}
              style={{width:"100%"}}
              options={[
                {label:"Sky Tower",value:"Sky Tower"},
                {label:"Downtown View",value:"Downtown View"},
                {label:"Marina Heights",value:"Marina Heights"},
              ]}
            />
          </Col>

          <Col xs={24} md={12}>
            <Text>Type</Text>
            <Select
              defaultValue={unit.type}
              style={{width:"100%"}}
              options={[
                {label:"Studio",value:"Studio"},
                {label:"1BHK",value:"1BHK"},
                {label:"2BHK",value:"2BHK"},
                {label:"3BHK",value:"3BHK"},
              ]}
            />
          </Col>

          <Col xs={24} md={12}>
            <Text>Price</Text>
            <Input defaultValue={unit.price}/>
          </Col>

          <Col xs={24} md={12}>
            <Text>Status</Text>
            <Select
              defaultValue={unit.status}
              style={{width:"100%"}}
              options={[
                {label:"Available",value:"Available"},
                {label:"Booked",value:"Booked"},
                {label:"Sold",value:"Sold"},
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
              onClick={()=>navigate(`/dashboard/developer/inventory/${id}`)}
            >
              Save Changes
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