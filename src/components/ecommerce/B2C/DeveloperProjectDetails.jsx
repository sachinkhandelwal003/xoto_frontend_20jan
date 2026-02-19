import { Card, Typography, Table, Tag } from "antd";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperProjectDetails(){

  const { id } = useParams();

  const units=[
    { key:1, unit:"A-101", type:"2BHK", price:"85L", status:"Available" },
    { key:2, unit:"A-102", type:"2BHK", price:"87L", status:"Booked" },
    { key:3, unit:"B-201", type:"3BHK", price:"1.2Cr", status:"Available" },
  ];

  const getColor=(status)=>{
    if(status==="Available") return "green";
    if(status==="Booked") return "red";
    return "default";
  };

  const columns=[

    { title:"Unit", dataIndex:"unit" },

    { title:"Type", dataIndex:"type" },

    { title:"Price", dataIndex:"price" },

    {
      title:"Status",
      dataIndex:"status",
      render:(status)=>
        <Tag color={getColor(status)}>
          {status}
        </Tag>
    }

  ];

  return(
    <div className="p-6">

      <Title level={3}>Project Units</Title>

      <Card className="shadow-sm rounded-xl mb-4">
        <Text type="secondary">Project ID:</Text>
        <div className="text-lg font-semibold">{id}</div>
      </Card>

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
