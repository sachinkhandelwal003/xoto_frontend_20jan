import { Card, Typography, Row, Col, Tag, Table, Button, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function DeveloperProjectDetails(){

  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useSelector(s=>s.auth);

  const [project,setProject]=useState(null);
  const [loading,setLoading]=useState(true);

  // ================= FETCH PROJECT =================
  useEffect(()=>{

    if(!id || id==="add") return;

    const fetchProject=async()=>{

      try{

        setLoading(true);

        const res=await fetch(
          `https://xoto.ae/api/property/get-property/${id}`,
          {
            headers:{ Authorization:`Bearer ${token}` }
          }
        );

        const json=await res.json();

        if(!json?.data){
          message.error("Project not found");
          return;
        }

        setProject(json.data);

      }catch(err){
        console.error(err);
        message.error("Failed to load project details");
      }
      finally{
        setLoading(false);
      }
    };

    fetchProject();

  },[id,token]);

  if(loading){
    return(
      <div className="p-10 text-center">
        <Spin size="large"/>
      </div>
    );
  }

  if(!project){
    return(
      <div className="p-10 text-center">
        <Title level={4}>Project Not Found</Title>
      </div>
    );
  }

  const totalUnits = project?.unitType?.length || 0;
  const soldUnits = project?.unitType?.filter(u=>u.status==="sold")?.length || 0;

  return(
    <div className="p-6 bg-gray-50 min-h-screen">

      <Title level={3}>{project.propertyName}</Title>
      <Text type="secondary">{project.area} {project.city}</Text>

      {/* SUMMARY */}
      <Row gutter={16} className="mt-6 mb-6">

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Total Units</Text><br/>
            <Title level={4}>{totalUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Sold</Text><br/>
            <Title level={4}>{soldUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Available</Text><br/>
            <Title level={4}>{totalUnits - soldUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-xl shadow-sm">
            <Text type="secondary">Status</Text><br/>
            <Tag color={project.isAvailable ? "green":"red"}>
              {project.isAvailable ? "Active":"Inactive"}
            </Tag>
          </Card>
        </Col>

      </Row>

      {/* LEADS / UNITS TABLE */}
      <Card className="shadow-sm rounded-xl mt-6">

        <Title level={4}>Project Leads</Title>

        <Table
          rowKey="_id"
          pagination={false}
          columns={[
            {title:"Client",dataIndex:"name"},
            {title:"Phone",dataIndex:"phone"},
            {title:"Interested Unit",dataIndex:"unit"},
            {
              title:"Status",
              dataIndex:"status",
              render:(s)=>(
                <Tag color={s==="Hot"?"red":s==="Warm"?"orange":"blue"}>
                  {s}
                </Tag>
              )
            },
            {
              title:"Action",
              render:(_,record)=>(
                <Button
                  style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
                  onClick={()=>navigate(`/dashboard/developer/leads/${record._id}`)}
                >
                  View
                </Button>
              )
            }
          ]}
          dataSource={project?.leads || []}
        />

      </Card>

    </div>
  );
}