import { Card, Typography, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperLeadDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  return(
    <div className="p-6">

      <Title level={3}>Lead Details</Title>

      <Card className="shadow-sm rounded-xl">

        <div className="mb-4">
          <Text type="secondary">Client Name</Text><br/>
          <Text strong>Rahul Mehta</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Phone</Text><br/>
          <Text strong>9876543210</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Interested Unit</Text><br/>
          <Text strong>A-101</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Status</Text><br/>
          <Tag color="red">Hot</Tag>
        </div>
<Button
  style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
  onClick={()=>navigate(`/dashboard/developer/leads/${id}/booking`)}
>
  Convert to Booking
</Button>
        <Button
          style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
          onClick={()=>navigate(-1)}
        >
          Back
        </Button>

      </Card>

    </div>
  )
}