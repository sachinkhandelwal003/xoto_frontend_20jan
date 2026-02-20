import { Card, Typography, Row, Col, Table, Tag } from "antd";

const { Title, Text } = Typography;

export default function DeveloperRevenue(){

  const stats={
    total:"125 Cr",
    monthly:"9.5 Cr",
    pending:"2.1 Cr",
    deals:48
  };

  const deals=[
    {key:1,client:"Rahul Mehta",project:"Sky Tower",amount:"1.2Cr",status:"Received"},
    {key:2,client:"Ali Hassan",project:"Downtown View",amount:"1Cr",status:"Pending"},
    {key:3,client:"Neha Gupta",project:"Marina Heights",amount:"95L",status:"Received"},
  ];

  const getColor=(s)=>{
    if(s==="Received") return "green";
    if(s==="Pending") return "orange";
    return "default";
  };

  const columns=[
    {title:"Client",dataIndex:"client"},
    {title:"Project",dataIndex:"project"},
    {title:"Amount",dataIndex:"amount"},
    {
      title:"Status",
      dataIndex:"status",
      render:(s)=><Tag color={getColor(s)}>{s}</Tag>
    }
  ];

  return(
    <div className="p-6">

      <Title level={3}>Sales Revenue</Title>
      <Text type="secondary">Overview of total sales & collections</Text>

      {/* STATS */}
      <Row gutter={16} className="mt-6 mb-6">

        <Col span={6}>
          <Card>
            <Text>Total Revenue</Text>
            <Title level={4}>{stats.total}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>This Month</Text>
            <Title level={4}>{stats.monthly}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Pending Payments</Text>
            <Title level={4}>{stats.pending}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Total Deals</Text>
            <Title level={4}>{stats.deals}</Title>
          </Card>
        </Col>

      </Row>

      {/* DEALS TABLE */}
      <Card className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={deals}
          pagination={false}
        />
      </Card>

    </div>
  );
}