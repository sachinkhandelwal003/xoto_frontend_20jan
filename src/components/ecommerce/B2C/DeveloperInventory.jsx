import { Card, Typography, Table, Tag, Button } from "antd";

const { Title } = Typography;

export default function DeveloperInventory(){

  const units=[
    { key:1, project:"Sky Tower", unit:"A-101", type:"2BHK", price:"85L", status:"Available" },
    { key:2, project:"Sky Tower", unit:"A-102", type:"2BHK", price:"87L", status:"Booked" },
    { key:3, project:"Downtown View", unit:"B-201", type:"3BHK", price:"1.2Cr", status:"Available" },
  ];

  const getColor=(status)=>{
    if(status==="Available") return "green";
    if(status==="Booked") return "red";
    return "default";
  };

  const columns=[
    { title:"Project", dataIndex:"project" },
    { title:"Unit", dataIndex:"unit" },
    { title:"Type", dataIndex:"type" },
    { title:"Price", dataIndex:"price" },
    {
      title:"Status",
      dataIndex:"status",
      render:(status)=><Tag color={getColor(status)}>{status}</Tag>
    },
    {
      title:"Action",
      render:()=>(
        <Button
          style={{
            background:"#5c039b",
            borderColor:"#5c039b",
            color:"#fff"
          }}
        >
          View
        </Button>
      )
    }
  ];

  return(
    <div className="p-6">

      <Title level={3}>Inventory / Units</Title>

      <Card className="shadow-sm rounded-xl">

        <Table
          columns={columns}
          dataSource={units}
          pagination={{pageSize:5}}
        />

      </Card>

    </div>
  );
}
