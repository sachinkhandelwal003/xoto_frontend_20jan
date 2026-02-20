import { Card, Typography, Row, Col } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const { Title, Text } = Typography;

export default function DeveloperRevenue(){

  const stats=[
    { label:"Total Revenue", value:"₹12.4 Cr" },
    { label:"Units Sold", value:"146" },
    { label:"Pending Payments", value:"₹2.1 Cr" },
    { label:"Active Projects", value:"5" }
  ];

  const monthly=[
    { month:"Jan", sales:20 },
    { month:"Feb", sales:35 },
    { month:"Mar", sales:28 },
    { month:"Apr", sales:45 },
    { month:"May", sales:38 },
    { month:"Jun", sales:52 }
  ];

  return(
    <div className="p-6">

      {/* HEADER */}
      <Title level={3}>Sales Revenue Dashboard</Title>

      {/* STATS */}
      <Row gutter={[16,16]} className="mb-6">

        {stats.map((s,i)=>(
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="shadow-sm rounded-xl">
              <Text type="secondary">{s.label}</Text>
              <Title level={3} style={{margin:0}}>
                {s.value}
              </Title>
            </Card>
          </Col>
        ))}

      </Row>

      {/* CHART */}
      <Card className="shadow-sm rounded-xl" title="Monthly Units Sold">

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month"/>
            <Tooltip/>
            <Bar dataKey="sales" fill="#5c039b" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>

      </Card>

    </div>
  );
}
