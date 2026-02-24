import { Typography, Card, Row, Col, Spin, Tag, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export default function AgentProjectDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  // 🔥 token if backend protected
  const { token } = useSelector(s => s.auth || {});

  const [property,setProperty]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{

    const fetchProperty = async () => {

      try{
        setLoading(true);

        console.log("Fetching property ID:", id);

        const response = await fetch(
          `https://xoto.ae/api/property/get-property-by-id?id=${id}`,
          {
            headers:{
              "Content-Type":"application/json",
              ...(token ? { Authorization:`Bearer ${token}` } : {})
            }
          }
        );

        console.log("STATUS:", response.status);

        const text = await response.text();
        console.log("RAW RESPONSE:", text);

        let json=null;
        try{ json = JSON.parse(text); }catch(e){}

        if(json?.data){
          setProperty(json.data);
        } else {
          console.error("No property in response");
          setProperty(null);
          message.error("Property not found");
        }

      }catch(err){
        console.error("FETCH ERROR:",err);
        message.error("Failed to load property");
      }
      finally{
        setLoading(false);
      }

    };

    if(id) fetchProperty();

  },[id,token]);

  if(loading){
    return <div style={{textAlign:"center",padding:80}}><Spin size="large"/></div>;
  }

  if(!property){
    return(
      <div style={{textAlign:"center",padding:80}}>
        <Title level={4}>Project Not Found</Title>
        <Button onClick={()=>navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const image =
    property.photos?.[0] ||
    property.mainLogo ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";

  return(
    <div style={{padding:32,background:"#f6f7fb",minHeight:"100vh"}}>

      <Button onClick={()=>navigate(-1)} style={{marginBottom:20}}>
        ← Back
      </Button>

      <Card style={{borderRadius:16}}>

        <Row gutter={[30,30]}>

          <Col xs={24} md={12}>
            <img
              src={image}
              alt="property"
              style={{
                width:"100%",
                height:360,
                objectFit:"cover",
                borderRadius:12
              }}
            />
          </Col>

          <Col xs={24} md={12}>

            <Title level={3}>{property.propertyName}</Title>

            <Text type="secondary">
              {property.area}, {property.city}
            </Text>

            <Title level={4} style={{marginTop:10}}>
              {property.currency} {Number(property.price).toLocaleString()}
            </Title>

            <Row gutter={[16,16]} style={{marginTop:18}}>

              <Col span={12}>
                <Card size="small">
                  Bedrooms<br/><b>{property.bedrooms || "-"}</b>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  Bathrooms<br/><b>{property.bathrooms || "-"}</b>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  Area<br/><b>{property.builtUpArea_min || "-"} sqft</b>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  Status<br/>
                  <Tag color={property.isAvailable ? "green":"red"}>
                    {property.isAvailable ? "Available":"Unavailable"}
                  </Tag>
                </Card>
              </Col>

            </Row>

            {property.description && (
              <>
                <Title level={5} style={{marginTop:20}}>Description</Title>
                <Text>{property.description}</Text>
              </>
            )}

          </Col>
            </Row>
</Card>

    </div>
  );
}