import { Card, Typography, Tag, Button, Spin, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function DeveloperLeadDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,setLead] = useState(null);
  const [loading,setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(()=>{
    fetchLeadDetails();
  },[id]);

  // ================= FETCH LEAD DETAILS =================
  const fetchLeadDetails = async () => {

    try{

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/property/developer-lead-details?id=${id}`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      console.log("Lead Details:",data);

      if(data?.success){
        setLead(data.data);
      }else{
        message.error("Lead not found");
      }

    }catch(err){
      console.log(err);
      message.error("Failed to load lead details");
    }finally{
      setLoading(false);
    }

  };

  if(loading){
    return(
      <div className="flex justify-center items-center h-64">
        <Spin size="large"/>
      </div>
    )
  }

  if(!lead){
    return(
      <div className="p-6">
        <Title level={4}>No Lead Found</Title>
      </div>
    )
  }

  const clientName = `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`;

  return(
    <div className="p-6">

      <Title level={3}>Lead Details</Title>

      <Card className="shadow-sm rounded-xl">

        <div className="mb-4">
          <Text type="secondary">Client Name</Text><br/>
          <Text strong>{clientName}</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Email</Text><br/>
          <Text strong>{lead?.email || "N/A"}</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Phone</Text><br/>
          <Text strong>{lead?.phone_number || "N/A"}</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Interested Unit</Text><br/>
          <Text strong>{lead?.interested_unit || "N/A"}</Text>
        </div>

        <div className="mb-4">
          <Text type="secondary">Status</Text><br/>
          <Tag color="orange">{lead?.status || "New"}</Tag>
        </div>

        <div className="flex gap-3">

          <Button
            style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
            onClick={()=>navigate(`/dashboard/developer/leads/${id}/booking`)}
          >
            Convert to Booking
          </Button>

          <Button
            onClick={()=>navigate(-1)}
          >
            Back
          </Button>

        </div>

      </Card>

    </div>
  )
}