import { Card, Typography, Row, Col, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Popconfirm, message } from "antd";

const { Title, Text } = Typography;

export default function DeveloperUnitDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  // mock data (later backend se replace)
  const unit={
    unit:"A-101",
    project:"Sky Tower",
    type:"2BHK",
    price:"1.2Cr",
    status:"Sold",
    floor:"10th",
    area:"1450 sqft"
  };

  const getColor=(s)=>{
    if(s==="Sold") return "blue";
    if(s==="Booked") return "orange";
    if(s==="Available") return "green";
    return "default";
  };
const handleDelete = () => {
  message.success("Unit deleted (mock)");
  navigate("/dashboard/developer/inventory");
};
  return(
    <div className="p-6">

      <Title level={3}>Unit Details</Title>
      <Text type="secondary">View unit information</Text>

      <Card className="shadow-sm rounded-xl mt-6">

        <Row gutter={[16,16]}>

          <Col span={12}>
            <Text type="secondary">Unit Number</Text><br/>
            <Text strong>{unit.unit}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Project</Text><br/>
            <Text strong>{unit.project}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Type</Text><br/>
            <Text strong>{unit.type}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Floor</Text><br/>
            <Text strong>{unit.floor}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Area</Text><br/>
            <Text strong>{unit.area}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Price</Text><br/>
            <Text strong>{unit.price}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Status</Text><br/>
            <Tag color={getColor(unit.status)}>{unit.status}</Tag>
          </Col>

         <Col span={24} className="mt-4">

  <Button
    style={{
      background:"#5c039b",
      borderColor:"#5c039b",
      color:"#fff",
      marginRight:10
    }}
    onClick={()=>navigate(`/dashboard/developer/inventory/${id}/edit`)}
  >
    Edit Unit
  </Button>

  <Popconfirm
    title="Delete this unit?"
    description="This action cannot be undone"
    onConfirm={handleDelete}
    okText="Delete"
    cancelText="Cancel"
  >
    <Button danger style={{marginRight:10}}>
      Delete Unit
    </Button>
  </Popconfirm>

  <Button onClick={()=>navigate(-1)}>
    Back
  </Button>

</Col>

        </Row>

      </Card>

    </div>
  );
}