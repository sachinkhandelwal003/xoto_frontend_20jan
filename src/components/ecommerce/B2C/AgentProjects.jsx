import {
  Card,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Button,
  Spin,
  message
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentProjects(){

  const navigate = useNavigate();

  const [projects,setProjects]=useState([]);
  const [filtered,setFiltered]=useState([]);
  const [loading,setLoading]=useState(false);

  const [search,setSearch]=useState("");
  const [location,setLocation]="";

  const [page,setPage]=useState(1);
  const [hasMore,setHasMore]=useState(true);

  // ================= FETCH =================
  const fetchProjects=async(pageNo=1,append=false)=>{

    try{
      setLoading(true);

      const res=await fetch(
        `https://xoto.ae/api/property/get-all-properties?page=${pageNo}&limit=6`
      );

      const json=await res.json();

      const list =
        json?.data?.data ||
        json?.data ||
        [];

      if(!list.length) setHasMore(false);

      setProjects(prev=>{
        const updated = append ? [...prev,...list] : list;
        return updated;
      });

    }catch(err){
      console.error(err);
      message.error("Failed to load properties");
    }
    finally{
      setLoading(false);
    }
  };

  // FIRST LOAD
  useEffect(()=>{
    fetchProjects(1,false);
  },[]);

  // ================= FILTER LOGIC =================
  useEffect(()=>{

    const q=search.toLowerCase();

    const result = projects.filter(p=>

      (!q ||
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q)
      )

      && (!location || p.city===location)

    );

    setFiltered(result);

  },[search,location,projects]);

  // ================= LOAD MORE =================
  const loadMore=()=>{
    const next=page+1;
    setPage(next);
    fetchProjects(next,true);
  };

  // ================= IMAGE =================
  const getImage=(p)=>{
    if(p?.photos?.length) return p.photos[0];
    if(p?.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";
  };

  return(
    <div style={{padding:"32px",background:"#f6f7fb",minHeight:"100vh"}}>

      {/* HEADER */}
      <div style={{marginBottom:28}}>
        <Title level={3} style={{marginBottom:4}}>Browse Projects</Title>
        <Text type="secondary">Explore all available properties</Text>
      </div>

      {/* FILTER CARD */}
      <Card
        style={{
          marginBottom:28,
          borderRadius:16,
          boxShadow:"0 6px 20px rgba(0,0,0,0.05)"
        }}
      >
        <Row gutter={16}>

          <Col xs={24} md={12}>
            <Input
              size="large"
              placeholder="Search property, area or city..."
              allowClear
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </Col>

          <Col xs={24} md={6}>
            <Select
              size="large"
              placeholder="Filter by city"
              allowClear
              style={{width:"100%"}}
              onChange={(v)=>setLocation(v)}
            >
              {[...new Set(projects.map(p=>p.city).filter(Boolean))]
                .map(city=>(
                  <Select.Option key={city} value={city}>
                    {city}
                  </Select.Option>
                ))
              }
            </Select>
          </Col>

        </Row>
      </Card>

      {/* CARDS */}
      <Row gutter={[24,24]}>

        {filtered.map(p=>(

          <Col xs={24} md={12} lg={8} key={p._id}>

            <Card
              hoverable
              style={{
                borderRadius:18,
                overflow:"hidden",
                border:"none",
                boxShadow:"0 10px 28px rgba(0,0,0,0.06)"
              }}
              bodyStyle={{padding:18}}
              cover={
                <div style={{height:240,overflow:"hidden"}}>
                  <img
                    src={getImage(p)}
                    alt="property"
                    style={{
                      width:"100%",
                      height:"100%",
                      objectFit:"cover"
                    }}
                  />
                </div>
              }
            >

              <Title level={5} style={{marginBottom:6}}>
                {p.propertyName}
              </Title>

              <Text type="secondary">
                {p.area} • {p.city}
              </Text>

              <div style={{marginTop:10}}>
                <Text strong style={{fontSize:17}}>
                  {p.currency || "AED"} {Number(p.price || 0).toLocaleString()}
                </Text>
              </div>

              <Button
                type="primary"
                block
                style={{
                  marginTop:16,
                  height:42,
                  borderRadius:10,
                  background:"#6d28d9",
                  borderColor:"#6d28d9",
                  fontWeight:500
                }}
                onClick={()=>navigate(`/dashboard/agent/projects/${p._id}`)}
              >
                View Details
              </Button>

            </Card>

          </Col>

        ))}

      </Row>

      <div style={{textAlign:"center",marginTop:40}}>

        {loading ? (
          <Spin/>
        ) : hasMore ? (

          <Button
            size="large"
            onClick={loadMore}
            style={{
              borderRadius:12,
              height:46,
              padding:"0 40px",
              fontWeight:600
            }}
          >
            Load More Projects
          </Button>

        ) : (
          <Text type="secondary">No more projects</Text>
        )}

      </div>

    </div>
  );
}